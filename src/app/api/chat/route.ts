import { groq } from "@/lib/groq";
import { getHistory, saveMessage, getCustomerProfile } from "@/lib/memory";
import { searchKnowledge } from "@/lib/knowledge";
import { detectIntent } from "@/lib/intent";
import {
    searchProducts,
    getProduct,
    getOrder,
    createOrder,
    requestReturn,
    formatOrderSummary,
    extractTracking,
} from "@/lib/woocommerce";
import { getCourier, detectProvider, formatTrackingStatus } from "@/lib/courier";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { getCart, addToCart, removeFromCart, clearCart } from "@/lib/cart";
import { getOrCreateCheckout, updateCheckoutStage, CheckoutStage } from "@/lib/checkout";
import { createExecutionPlan } from "@/lib/planner";
import { ExecutionSupervisor } from "@/lib/supervisor";
import { assembleSystemPrompt } from "@/lib/prompts";
import { reflectOnInteraction } from "@/lib/reflection";
import { evaluateStrategy } from "@/lib/strategy";
import { getGoalDirective } from "@/lib/goals";

export const dynamic = "force-dynamic";

// ─── Rate limiter (Phase 10) ───────────────────────────────────────────────────
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        analytics: true,
    });
}

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are OmniChat AI, a premium conversational commerce agent.
Your goal is to guide users from product discovery to successful checkout.

Core Responsibilities:
1. Discovery: Help users find products using the search tool. Use the [PRODUCT_LIST:JSON] format to show cards.
2. Cart Management: Maintain the user's cart (add/remove/view).
3. Checkout Flow: When a user says "checkout" or "buy":
   - Step A: Show Cart Summary & Total.
   - Step B: Collect Delivery Details (Full Name, Phone, Email, Full Address, City).
   - Step C: Show Shipping Options.
   - Step D: Generate Payment Link.

Rules:
- Be proactive but elegant.
- If delivery details are missing, ask for them politely.
- Use markdown for lists and bolding for emphasis.
- Keep responses concise and action-oriented.
- When show products, ALWAYS use the tool to get current stock and prices.`;

// ─── Tool orchestration ───────────────────────────────────────────────────────

// ─── Tool orchestration (Phase 5) ─────────────────────────────────────────────
interface ToolResult {
    text: string;
    data?: any;
    intent: string;
}

async function runTool(
    intent: Awaited<ReturnType<typeof detectIntent>>,
    userMessage: string,
    userId: string = "guest"
): Promise<ToolResult> {
    const { entities } = intent;

    switch (intent.intent) {
        case "product_search": {
            const query = entities.product_query ?? userMessage;
            const products = await searchProducts(query);
            if (!products.length) return { text: "No products found matching your query.", intent: "product_search" };
            
            return {
                text: "I found these items for you:",
                data: { type: "product_list", products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    regular_price: p.regular_price,
                    on_sale: p.on_sale,
                    short_description: p.short_description,
                    image: p.images?.[0]?.src,
                    stock_status: p.stock_status,
                    stock_quantity: p.stock_quantity,
                    permalink: p.permalink
                })) },
                intent: "product_search"
            };
        }

        case "cart_add": {
            const query = entities.product_query ?? userMessage;
            const pid = entities.product_id;
            
            let product;
            if (pid) {
                product = await getProduct(Number(pid));
            } else {
                const search = await searchProducts(query);
                product = search[0];
            }

            if (!product) return { text: "I couldn't find that product to add to your cart.", intent: "cart_add" };

            const cart = await addToCart(userId, {
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: entities.quantity || 1,
                image: product.images?.[0]?.src
            });

            return {
                text: `✅ Added *${product.name}* to your cart.\n\nYour cart total is now **${cart.subtotal.toFixed(2)}**. Would you like to view your cart or continue shopping?`,
                data: { type: "cart_update", cart },
                intent: "cart_add"
            };
        }

        case "cart_view": {
            const cart = await getCart(userId);
            if (!cart.items.length) return { text: "Your cart is currently empty.", intent: "cart_view" };

            const items = cart.items
                .map((i) => `• ${i.name} (x${i.quantity}) — ${i.price}`)
                .join("\n");
            
            return {
                text: `🛒 **Your Cart**\n\n${items}\n\n**Total: ${cart.subtotal.toFixed(2)}**\n\nReady to checkout?`,
                data: { type: "cart_summary", cart },
                intent: "cart_view"
            };
        }

        case "checkout_start": {
            const cart = await getCart(userId);
            if (!cart.items.length) return { text: "Your cart is empty. Add some items before checking out!", intent: "checkout_start" };

            const checkout = await getOrCreateCheckout(userId, cart.userId); // userId as cart identifier for now
            const summary = cart.items.map(i => `${i.name} x${i.quantity}`).join(", ");
            
            return {
                text: `🚀 **Starting Checkout**\n\nYou have **${cart.items.length} items** (${summary}) in your cart.\n\nTo proceed, please provide your **Full Name**, **Delivery Address**, and **City**.`,
                data: { type: "checkout_init", checkout, cart },
                intent: "checkout_start"
            };
        }

        case "cart_clear": {
            await clearCart(userId);
            return { text: "Your cart has been cleared.", intent: "cart_clear" };
        }

        case "human_handoff": {
            return { 
                text: "I'm connecting you with a human senior sales representative now. They will review our conversation and take over shortly. Thank you for your patience!", 
                data: { type: "handoff_init" },
                intent: "human_handoff" 
            };
        }

        case "voice_input": {
            return {
                text: "I've received your voice message. I'm processing it now to find the best options for you.",
                data: { type: "voice_processing" },
                intent: "voice_input"
            };
        }

        default:
            return { text: "", intent: "general" };
    }
}


// ─── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        if (ratelimit) {
            const ip = req.headers.get("x-forwarded-for") ?? "anon";
            const { success } = await ratelimit.limit(ip);
            if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { message, messages = [], context, session_id, userId = "guest" } = await req.json();
        const sessionId = session_id || crypto.randomUUID();
        const userMessage = message || messages[messages.length - 1]?.content;

        if (!userMessage) return NextResponse.json({ error: "Message required" }, { status: 400 });

        const isComplex = userMessage.includes(" and ") || userMessage.includes(" also ") || userMessage.length > 60;
        
        let toolResult: ToolResult;
        let intentResult: any;

        if (isComplex) {
            const plan = await createExecutionPlan(userMessage);
            if (plan && plan.steps.length > 0) {
                const validation = await ExecutionSupervisor.validatePlan(plan);
                if (validation.approved && validation.modifiedSteps) {
                    const step = validation.modifiedSteps[0];
                    intentResult = { intent: step.tool, entities: step.args };
                    toolResult = await runTool(intentResult, userMessage, userId);
                    toolResult.text = `[PLAN: ${plan.goal}]\n${toolResult.text}`;
                } else {
                    return NextResponse.json({ 
                        text: `I'm sorry, I cannot proceed with that request: ${validation.reason || "Policy violation."}` 
                    });
                }
            } else {
                intentResult = await detectIntent(userMessage); // Uses 70b inside detectIntent usually, let's keep it for now or move to 8b
                toolResult = await runTool(intentResult, userMessage, userId);
            }
        } else {
            intentResult = await detectIntent(userMessage);
            toolResult = await runTool(intentResult, userMessage, userId);
        }

        const [history, knowledge, cart, profile] = await Promise.all([
            getHistory(sessionId, userId),
            searchKnowledge(userMessage),
            getCart(userId),
            getCustomerProfile(userId) // userId used as phone/id for simplicity
        ]);

        const checkout = await getOrCreateCheckout(userId, cart.userId);

        // ─── ADAPTIVE STRATEGY ───
        const strategy = evaluateStrategy(profile || undefined);

        // ─── DYNAMIC PROMPT ASSEMBLY ───
        const dynamicSystemPrompt = assembleSystemPrompt({
            customer: profile || undefined,
            cart,
            checkout,
            channel: "web",
            strategy
        });

        const goalDirective = getGoalDirective();

        const systemContent = [
            dynamicSystemPrompt,
            goalDirective,
            history.length ? `Recent conversation:\n${history.map(e => `User: ${e.message}\nAssistant: ${e.response}`).join("\n")}` : "",
            knowledge.length ? `Knowledge snippets:\n${knowledge.join("\n")}` : "",
            toolResult.text ? `Tool result (${intentResult.intent}):\n${toolResult.text}` : "",
            "Final Instruction: Synthesize the plan and tool results into a natural, helpful response.",
        ].filter(Boolean).join("\n\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            stream: true,
            messages: [{ role: "system", content: systemContent }, ...messages.slice(-4), { role: "user", content: userMessage }],
            max_completion_tokens: 500,
            temperature: 0.7,
        });

        const encoder = new TextEncoder();
        let fullContent = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 1. Send tool data first (if any)
                    if (toolResult.data) {
                        controller.enqueue(encoder.encode(`D:${JSON.stringify(toolResult.data)}\n`));
                    }

                    // 2. Stream text
                    for await (const chunk of completion) {
                        const delta = chunk.choices[0]?.delta?.content || "";
                        if (!delta) continue;
                        fullContent += delta;
                        controller.enqueue(encoder.encode(`T:${delta}\n`));
                    }

                    if (fullContent) {
                        await saveMessage(sessionId, userId, userMessage, fullContent);

                        // ─── ASYNC REFLECTION (fire-and-forget) ───
                        reflectOnInteraction(userMessage, fullContent, history).catch(console.error);
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Session-Id": sessionId,
                "X-Intent": intentResult?.intent || "general",
            },
        });
    } catch (error) {
        console.error("Internal API error:", error);
        return NextResponse.json({ error: "Cognition Fault" }, { status: 500 });
    }
}

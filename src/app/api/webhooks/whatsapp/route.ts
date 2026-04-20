import { NextResponse } from "next/server";
import {
    parseInboundMessage,
    verifyWebhook,
    verifySignature,
    sendWhatsAppMessage,
} from "@/lib/whatsapp";
import { detectIntent } from "@/lib/intent";
import { acquireMessageLock } from "@/lib/queue";
import { getHistory, saveMessage, getCustomerProfile, upsertCustomerProfile, buildCustomerContext } from "@/lib/memory";
import { searchKnowledge } from "@/lib/knowledge";
import {
    searchProducts,
    getOrder,
    createOrder,
    requestReturn,
    formatOrderSummary,
    extractTracking,
} from "@/lib/woocommerce";
import { getCourier, detectProvider, formatTrackingStatus } from "@/lib/courier";
import { groq } from "@/lib/groq";

export const dynamic = "force-dynamic";

// ─── GET — Meta webhook verification ──────────────────────────────────────────
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const challenge = verifyWebhook(params);

    if (challenge !== null) {
        return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
}

// ─── POST — Inbound WhatsApp message ──────────────────────────────────────────
export async function POST(req: Request) {
    // Validate signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const valid = await verifySignature(rawBody, signature);
    if (!valid) return new Response("Unauthorized", { status: 401 });

    let body: unknown;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return new Response("Bad Request", { status: 400 });
    }

    const inbound = parseInboundMessage(body);

    // Always acknowledge quickly (Meta requires 200 within 5s)
    if (!inbound) return new Response("OK", { status: 200 });

    // Process async — don't block the 200 response
    processMessage(inbound).catch((err) =>
        console.error("WhatsApp message processing error:", err)
    );

    return new Response("OK", { status: 200 });
}

// ─── Async message processing pipeline ────────────────────────────────────────
async function processMessage(inbound: {
    from: string;
    messageId: string;
    text: string;
    timestamp: string;
}): Promise<void> {
    const { from, messageId, text } = inbound;
    const sessionId = `wa:${from}`;
    const userId = from;

    // Idempotency — skip if already processed (Meta retry)
    const acquired = await acquireMessageLock(messageId);
    if (!acquired) {
        console.log(`[WhatsApp] Skipping duplicate message ${messageId}`);
        return;
    }

    try {
        // Load customer profile, history, knowledge, and detect intent in parallel
        const [profile, history, knowledge, intent] = await Promise.all([
            getCustomerProfile(from),
            getHistory(sessionId, userId),
            searchKnowledge(text),
            detectIntent(text),
        ]);

        // Run tool based on intent
        const toolResult = await dispatchTool(intent, text);

        // Build system context
        const historyText = history
            .map((e) => `User: ${e.message}\nAssistant: ${e.response}`)
            .join("\n");
        const customerCtx = buildCustomerContext(profile);
        const knowledgeText = knowledge.join("\n");

        const systemContent = [
            `You are OmniChat AI, a business automation assistant on WhatsApp.
Rules:
- Be friendly, concise, and helpful. Use plain text (no markdown formatting).
- Summarize tool results naturally. Don't expose raw data or IDs unless useful.
- If you don't know something, say so honestly.`,
            customerCtx,
            historyText ? `Recent conversation:\n${historyText}` : "",
            knowledgeText ? `Knowledge:\n${knowledgeText}` : "",
            toolResult ? `Tool result (${intent.intent}):\n${toolResult}` : "",
        ]
            .filter(Boolean)
            .join("\n\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            stream: false,
            temperature: 0.7,
            max_completion_tokens: 400,
            messages: [
                { role: "system", content: systemContent },
                { role: "user", content: text },
            ],
        });

        const reply = completion.choices[0]?.message?.content?.trim() ?? "Sorry, I couldn't process that.";

        // Send reply + persist conversation
        await Promise.all([
            sendWhatsAppMessage(from, reply),
            saveMessage(sessionId, userId, text, reply),
            // Update last-seen in customer profile
            upsertCustomerProfile(from, {}),
        ]);
    } catch (err) {
        console.error("processMessage error:", err);
        await sendWhatsAppMessage(
            from,
            "Sorry, I'm having trouble right now. Please try again in a moment."
        );
    }
}

// ─── Tool dispatcher ───────────────────────────────────────────────────────────
async function dispatchTool(
    intent: Awaited<ReturnType<typeof detectIntent>>,
    userMessage: string
): Promise<string> {
    const { entities } = intent;

    switch (intent.intent) {
        case "product_search": {
            const query = entities.product_query ?? userMessage;
            const products = await searchProducts(query);
            if (!products.length) return "No matching products found.";
            return products
                .map((p) => `${p.name} — ${p.price} (${p.stock_status}): ${p.permalink}`)
                .join("\n");
        }

        case "order_status": {
            const id = entities.order_id;
            if (!id) return "Order ID not found in message.";
            const order = await getOrder(id);
            if (!order) return `Order #${id} not found.`;
            return formatOrderSummary(order);
        }

        case "courier_track": {
            const tn = entities.tracking_number;
            if (!tn) return "Tracking number not found.";
            const courier = getCourier(detectProvider(tn));
            const status = await courier.track(tn);
            return status ? formatTrackingStatus(status) : "Tracking info unavailable.";
        }

        case "return_request": {
            const id = entities.order_id;
            if (!id) return "Order ID not found.";
            const ok = await requestReturn(id, userMessage);
            return ok
                ? `Return request submitted for order #${id}.`
                : "Unable to process return right now.";
        }

        case "shipping_cost": {
            const id = entities.order_id;
            if (id) {
                const order = await getOrder(id);
                if (order) {
                    const tn = extractTracking(order);
                    if (tn) {
                        const courier = getCourier(detectProvider(tn));
                        const status = await courier.track(tn);
                        if (status) return formatTrackingStatus(status);
                    }
                    return formatOrderSummary(order);
                }
            }
            return "";
        }

        case "order_create": {
            // order_create requires multi-turn flow — handled by LLM guidance
            return "To place an order, I need your name, delivery address, and the product you want.";
        }

        default:
            return "";
    }
}

// Unused import suppression
void createOrder;

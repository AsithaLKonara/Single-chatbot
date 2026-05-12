import { groq } from "./groq";

export type Intent =
    | "product_search"
    | "cart_view"
    | "cart_add"
    | "cart_remove"
    | "cart_clear"
    | "checkout_start"
    | "order_status"
    | "order_create"
    | "return_request"
    | "shipping_cost"
    | "courier_track"
    | "human_handoff"
    | "voice_input"
    | "support"
    | "general";

export interface IntentResult {
    intent: Intent;
    entities: {
        product_query?: string;
        product_id?: string | number;
        quantity?: number;
        order_id?: string;
        tracking_number?: string;
        customer_name?: string;
        phone?: string;
    };
    confidence: "high" | "medium" | "low";
}

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a premium AI commerce agent (OmniChat).
Analyze the user message and return ONLY a valid JSON object.

Intents:
- product_search: User looking for items (e.g. "show me headphones")
- cart_view: User wants to see their shopping cart
- cart_add: User wants to add an item to cart (e.g. "add the first one", "buy this")
- cart_remove: User wants to remove an item
- cart_clear: User wants to empty the cart
- checkout_start: User ready to pay/finish (e.g. "checkout", "place order")
- order_status: Checking existing order
- courier_track: Live tracking lookup
- general: Chit-chat or unknown

Entities to extract:
- product_query: Search terms
- product_id: ID of the product if mentioned
- quantity: Number of items (default 1)
- order_id: For status/tracking
- tracking_number: For live tracking

JSON Format:
{
  "intent": "<intent_name>",
  "entities": {
    "product_query": "<string|null>",
    "product_id": "<number|null>",
    "quantity": "<number|null>",
    "order_id": "<string|null>",
    "tracking_number": "<string|null>"
  },
  "confidence": "high|medium|low"
}`;

export async function detectIntent(message: string): Promise<IntentResult> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            stream: false,
            temperature: 0.1,
            max_completion_tokens: 300,
            messages: [
                { role: "system", content: INTENT_SYSTEM_PROMPT },
                { role: "user", content: message },
            ],
        });

        const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

        // Strip markdown code fences if present
        const clean = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
        const parsed = JSON.parse(clean) as IntentResult;
        return parsed;
    } catch {
        // Fallback to general intent on parse failure
        return {
            intent: "general",
            entities: {},
            confidence: "low",
        };
    }
}

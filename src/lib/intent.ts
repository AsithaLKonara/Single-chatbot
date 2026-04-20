import { groq } from "./groq";

export type Intent =
    | "product_search"
    | "order_status"
    | "order_create"
    | "return_request"
    | "shipping_cost"
    | "courier_track"
    | "support"
    | "general";

export interface IntentResult {
    intent: Intent;
    entities: {
        product_query?: string;
        order_id?: string;
        tracking_number?: string;
        customer_name?: string;
        phone?: string;
    };
    confidence: "high" | "medium" | "low";
}

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a business automation chatbot.
Analyze the user message and return ONLY a valid JSON object with this exact shape:
{
  "intent": "<one of: product_search|order_status|order_create|return_request|shipping_cost|courier_track|support|general>",
  "entities": {
    "product_query": "<string or null>",
    "order_id": "<order number if mentioned or null>",
    "tracking_number": "<tracking number if mentioned or null>",
    "customer_name": "<customer name if mentioned or null>",
    "phone": "<phone number if mentioned or null>"
  },
  "confidence": "<high|medium|low>"
}
Return ONLY the JSON. No explanation. No markdown.`;

export async function detectIntent(message: string): Promise<IntentResult> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
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

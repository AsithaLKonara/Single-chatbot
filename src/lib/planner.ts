import { groq } from "./groq";

export interface PlanStep {
    tool: string;
    args: any;
    reason: string;
}

export interface ExecutionPlan {
    steps: PlanStep[];
    totalSteps: number;
    goal: string;
}

const PLANNER_SYSTEM_PROMPT = `You are the OmniChat Strategic Planner.
Your job is to take a user commerce request and break it into a sequence of atomic tool calls.

Available Tools:
- product_search(query): Search for products
- cart_add(product_id, quantity): Add item to cart
- cart_view(): See cart
- checkout_start(): Begin checkout
- courier_track(number): Track package

Example Request: "Buy me a gaming mouse under $50 and a mousepad"
Response: {
  "goal": "Purchase gaming mouse and mousepad",
  "steps": [
    { "tool": "product_search", "args": { "query": "gaming mouse under $50" }, "reason": "Find affordable mouse" },
    { "tool": "product_search", "args": { "query": "gaming mousepad" }, "reason": "Find matching mousepad" }
  ],
  "totalSteps": 2
}

Return ONLY valid JSON.`;

export async function createExecutionPlan(message: string): Promise<ExecutionPlan | null> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            stream: false,
            temperature: 0,
            messages: [
                { role: "system", content: PLANNER_SYSTEM_PROMPT },
                { role: "user", content: message }
            ]
        });

        const raw = completion.choices[0]?.message?.content?.trim() || "{}";
        const clean = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
        return JSON.parse(clean);
    } catch (error) {
        console.error("Planning error:", error);
        return null;
    }
}

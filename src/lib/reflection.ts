import { groq } from "./groq";
import { omniBus, OmniEvent } from "./events";

export interface ReflectionSignal {
    sentiment: "positive" | "neutral" | "negative";
    intent_achieved: boolean;
    frictions: string[];
    opportunities: string[];
    suggested_strategy?: string;
    abandonment_reason?: "PRICE" | "TRUST" | "CONFUSION" | "COMPARISON" | "DISTRACTION" | "NONE";
}

const REFLECTION_PROMPT = `You are the OmniChat Cognitive Mirror.
Analyze the following conversation segment and extract commerce performance signals.

Focus on:
1. Friction: Why did the user hesitate or abandon?
   - PRICE: Mentioned high cost, asked for discount.
   - TRUST: Asked about authenticity, delivery safety, or payment security.
   - CONFUSION: Didn't understand instructions, asked "how to", or repetitive questions.
   - COMPARISON: Mentioned other stores or "looking around".
   - DISTRACTION: Abrupt stop, "be back later", or off-topic.
2. Opportunity: What upsells or cross-sells were missed?
3. Strategy: What tone or tactic would work better next time?

Response format: JSON only.
{
  "sentiment": "positive" | "neutral" | "negative",
  "intent_achieved": boolean,
  "frictions": [],
  "opportunities": [],
  "suggested_strategy": "",
  "abandonment_reason": "PRICE" | "TRUST" | "CONFUSION" | "COMPARISON" | "DISTRACTION" | "NONE"
}`;

export async function reflectOnInteraction(
    userMessage: string,
    aiResponse: string,
    history: any[] = []
): Promise<ReflectionSignal | null> {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // Smaller, faster model for background reflection
            temperature: 0,
            messages: [
                { role: "system", content: REFLECTION_PROMPT },
                { role: "user", content: `History: ${JSON.stringify(history.slice(-2))}\nUser: ${userMessage}\nAI: ${aiResponse}` }
            ],
            response_format: { type: "json_object" }
        });

        const signal = JSON.parse(completion.choices[0]?.message?.content || "{}") as ReflectionSignal;
        
        console.log("[REFLECTION] Interaction Signal:", signal);
        
        // Emit for the learning loop
        omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, { type: "reflection", signal });

        return signal;
    } catch (error) {
        console.error("Reflection error:", error);
        return null;
    }
}

import { groq } from "../src/lib/groq.ts";

async function run() {
    try {
        console.log("Testing Groq AI generation...");
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Hello! Tell me a fun fact about artificial intelligence." }],
            max_completion_tokens: 100,
        });
        console.log("Success! Response from Groq:");
        console.log(response.choices[0].message.content);
    } catch (e) {
        console.error("Failed to fetch from Groq:", e.message);
    }
}
run();

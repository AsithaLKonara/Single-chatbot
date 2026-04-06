process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { POST } from "../src/app/api/chat/route.ts";

async function testIntegration() {
    console.log("Initializing E2E AI Test...");
    const req = {
        json: async () => ({
            messages: [{ role: "user", content: "What is 2+2?" }],
            context: { page: "/home" },
            projectId: null,
            userId: null
        })
    };
    
    // @ts-ignore
    const response = await POST(req);
    const data = await response.json();
    console.log("Chatbot AI Response:", data);
}

testIntegration();

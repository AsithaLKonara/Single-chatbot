process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { POST } from "../src/app/api/chat/route.ts";

async function testIntegration() {
    console.log("Initializing E2E AI Test...");
    const req = {
        json: async () => ({
            message: "What is 2+2?",
            messages: [{ role: "user", content: "What is 2+2?" }],
            context: { page: "/home" },
            session_id: "test-session",
            userId: "test-user"
        })
    };
    
    // @ts-expect-error test harness mock request object
    const response = await POST(req);
    const content = await response.text();
    console.log("Session:", response.headers.get("X-Session-Id"));
    console.log("Chatbot AI Response:", content);
}

testIntegration();

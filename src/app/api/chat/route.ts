import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { messages, context, projectId, userId } = await req.json();

        let knowledge = "";
        if (projectId) {
            const { data } = await supabase.from("knowledge").select("content").eq("project_id", projectId).limit(3);
            knowledge = data?.map(d => d.content).join("\n") || "";
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Concise assistant. Knowledge: ${knowledge}. Context: ${JSON.stringify(context || {})}`
                },
                ...messages.slice(-3),
            ],
            max_completion_tokens: 200,
            temperature: 0.5,
        });

        const content = response.choices[0].message.content;
        if (projectId && userId && content) {
            await supabase.from("conversations").insert({
                project_id: projectId,
                user_id: userId,
                message: messages[messages.length - 1].content,
                response: content,
            });
        }

        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }
}

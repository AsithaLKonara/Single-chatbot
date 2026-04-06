import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { messages, context, projectId, userId = "guest" } = await req.json();

        let knowledge = "";
        if (projectId) {
            const data = await prisma.knowledge.findMany({
                where: { projectId },
                take: 5,
                orderBy: { createdAt: "desc" }
            });
            knowledge = data.map(d => d.content).join("\n") || "";
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant. Context: ${JSON.stringify(context || {})}. Use provided knowledge: ${knowledge}. Be concise.`
                },
                ...messages.slice(-5),
            ],
            max_completion_tokens: 400,
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        const tokens = response.usage?.total_tokens || 0;

        if (projectId && content) {
            // Track usage and log conversation asynchronously
            await prisma.$transaction([
                prisma.conversation.create({
                    data: {
                        projectId,
                        userId,
                        message: messages[messages.length - 1].content,
                        response: content,
                    }
                }),
                prisma.usage.create({
                    data: {
                        projectId,
                        tokens
                    }
                })
            ]);
        }

        return NextResponse.json({ content, usage: { tokens } });
    } catch (error) {
        console.error("Internal API error:", error);
        return NextResponse.json({ error: "Cognition Fault" }, { status: 500 });
    }
}

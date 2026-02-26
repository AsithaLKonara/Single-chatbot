import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

        const project = await prisma.project.findUnique({
            where: { apiKey },
            include: { user: true }
        });

        if (!project) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

        const { messages, userId = "anonymous" } = await req.json();

        const knowledge = await prisma.knowledge.findMany({
            where: { projectId: project.id },
            take: 3
        });

        const kbContent = knowledge.map(k => k.content).join("\n");

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `Concise. Knowledge: ${kbContent}` },
                ...messages.slice(-3)
            ],
            max_completion_tokens: 200,
        });

        const content = response.choices[0].message.content;
        const tokens = response.usage?.total_tokens || 0;

        await prisma.$transaction([
            prisma.conversation.create({
                data: { projectId: project.id, userId, message: messages[messages.length - 1].content, response: content || "" }
            }),
            prisma.usage.create({
                data: { projectId: project.id, tokens }
            })
        ]);

        return NextResponse.json({ content, usage: { tokens } });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

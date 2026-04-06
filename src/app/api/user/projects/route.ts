import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getToken(req: Request) {
    const auth = req.headers.get("authorization") || "";
    return auth.replace("Bearer ", "");
}

// GET — list all projects for the authenticated user
export async function GET(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const projects = await prisma.project.findMany({
            where: { userId: payload.id },
            include: {
                _count: { select: { conversations: true } },
                usage: { select: { tokens: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(
            projects.map((p) => ({
                id: p.id,
                name: p.name,
                apiKey: p.apiKey,
                conversations: p._count.conversations,
                tokens: p.usage.reduce((s, u) => s + u.tokens, 0),
                createdAt: p.createdAt,
            }))
        );
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// POST — create a new project
export async function POST(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { name } = await req.json();
        if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const project = await prisma.project.create({
            data: { name: name.trim(), userId: payload.id },
        });
        return NextResponse.json({ id: project.id, name: project.name, apiKey: project.apiKey, conversations: 0, tokens: 0, createdAt: project.createdAt });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// DELETE — delete a project
export async function DELETE(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("id");
        if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.userId !== payload.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.usage.deleteMany({ where: { projectId } });
        await prisma.knowledge.deleteMany({ where: { projectId } });
        await prisma.conversation.deleteMany({ where: { projectId } });
        await prisma.project.delete({ where: { id: projectId } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

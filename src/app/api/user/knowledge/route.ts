import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getToken(req: Request) {
    const auth = req.headers.get("authorization") || "";
    return auth.replace("Bearer ", "");
}

// GET — list all knowledge pieces for a project
export async function GET(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        if (!projectId) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        // Verify project belongs to user
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: payload.id }
        });
        if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const knowledge = await prisma.knowledge.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(knowledge);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// POST — add new knowledge
export async function POST(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { projectId, content } = await req.json();

        if (!projectId || !content?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: payload.id }
        });
        if (!project) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const knowledge = await prisma.knowledge.create({
            data: { projectId, content: content.trim(), embedding: [] } // Embedding handled by worker/trigger later if needed
        });

        return NextResponse.json(knowledge);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// DELETE — remove knowledge
export async function DELETE(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Knowledge ID required" }, { status: 400 });

        // Find knowledge ensuring it belongs to a project the user owns
        const knowledge = await prisma.knowledge.findFirst({
            where: { id, project: { userId: payload.id } }
        });

        if (!knowledge) return NextResponse.json({ error: "Not found or Forbidden" }, { status: 404 });

        await prisma.knowledge.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

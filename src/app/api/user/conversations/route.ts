import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getToken(req: Request) {
    return (req.headers.get("authorization") || "").replace("Bearer ", "");
}

// GET — paginated conversation logs for a user
export async function GET(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const take = parseInt(searchParams.get("take") || "20");
        const skip = parseInt(searchParams.get("skip") || "0");

        const where: any = { project: { userId: payload.id } };
        if (projectId) where.projectId = projectId;

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take,
                skip,
                include: { project: { select: { name: true } } },
            }),
            prisma.conversation.count({ where }),
        ]);

        return NextResponse.json({ conversations, total });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

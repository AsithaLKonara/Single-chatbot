import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "") || "";

        let userId: string;
        try {
            const payload = verifyToken(token) as { id: string };
            userId = payload.id;
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, plan: true, role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            include: {
                usage: { select: { tokens: true } },
                _count: { select: { conversations: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const projectsWithStats = projects.map((p) => ({
            id: p.id,
            name: p.name,
            apiKey: p.apiKey,
            conversations: p._count.conversations,
            tokens: p.usage.reduce((sum, u) => sum + u.tokens, 0),
            createdAt: p.createdAt,
        }));

        const allUsage = await prisma.usage.findMany({
            where: { project: { userId } },
            orderBy: { timestamp: "desc" },
        });

        const totalTokens = allUsage.reduce((sum, u) => sum + u.tokens, 0);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyTokens = allUsage
            .filter((u) => u.timestamp >= oneDayAgo)
            .reduce((sum, u) => sum + u.tokens, 0);

        const planLimits: Record<string, number> = {
            FREE: 10000,
            PRO: 100000,
            ENTERPRISE: 1000000,
        };

        return NextResponse.json({
            user,
            projects: projectsWithStats,
            usage: {
                total: totalTokens,
                daily: dailyTokens,
                limit: planLimits[user.plan] ?? 10000,
            },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

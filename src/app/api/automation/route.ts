import { NextResponse } from "next/server";
import {
    processDeliveredOrders,
    processDelayedOrders,
    processReorderNudges,
} from "@/lib/automation";

export const dynamic = "force-dynamic";

// ─── Cron authentication ───────────────────────────────────────────────────────
function isCronAuthorized(req: Request): boolean {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET ?? "";
    if (!cronSecret) return true; // allow in dev
    return authHeader === `Bearer ${cronSecret}`;
}

// ─── POST /api/automation ──────────────────────────────────────────────────────
// Called by Vercel Cron Jobs or external scheduler
export async function POST(req: Request) {
    if (!isCronAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));

        const {
            rule = "all",
            delivered_order_ids = [],
            delayed_order_ids = [],
            inactive_phones = [],
        } = body as {
            rule?: string;
            delivered_order_ids?: string[];
            delayed_order_ids?: string[];
            inactive_phones?: string[];
        };

        const results: Record<string, string> = {};

        if (rule === "all" || rule === "delivered") {
            await processDeliveredOrders(delivered_order_ids);
            results.delivered = `Processed ${delivered_order_ids.length} orders`;
        }

        if (rule === "all" || rule === "delayed") {
            await processDelayedOrders(delayed_order_ids);
            results.delayed = `Processed ${delayed_order_ids.length} orders`;
        }

        if (rule === "all" || rule === "reorder") {
            await processReorderNudges(inactive_phones);
            results.reorder = `Nudged ${inactive_phones.length} customers`;
        }

        return NextResponse.json({ ok: true, results });
    } catch (err) {
        console.error("Automation error:", err);
        return NextResponse.json({ error: "Automation run failed" }, { status: 500 });
    }
}

// ─── GET /api/automation — health check ───────────────────────────────────────
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Automation engine is running",
        timestamp: new Date().toISOString(),
    });
}

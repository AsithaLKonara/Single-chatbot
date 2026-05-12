import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetch basic commerce metrics
        const { data: metrics, error } = await supabase
            .from("analytics_events")
            .select("type, metadata")
            .order("timestamp", { ascending: false })
            .limit(100);

        if (error) throw error;

        const summary = {
            total_leads: metrics.filter(m => m.type === "lead").length,
            add_to_carts: metrics.filter(m => m.type === "add_to_cart").length,
            checkouts_started: metrics.filter(m => m.type === "checkout_start").length,
            orders_completed: metrics.filter(m => m.type === "order_complete").length,
            conversions: metrics.filter(m => m.type === "order_complete")
        };

        return NextResponse.json({
            status: "Online",
            uptime: process.uptime(),
            metrics: summary,
            recent_events: metrics.slice(0, 10)
        });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}

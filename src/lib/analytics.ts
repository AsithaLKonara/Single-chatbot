import { supabase } from "./supabase";

export interface SalesMetric {
    type: "VISIT" | "VIEW_PRODUCT" | "ADD_TO_CART" | "CHECKOUT_START" | "ADDRESS_PROVIDED" | "PAYMENT_SELECTED" | "ORDER_SUCCESS" | "ABANDONED";
    userId: string;
    sessionId: string;
    strategyUsed?: string;
    revenueImpact?: number;
    metadata?: any;
    timestamp: string;
}

export async function logSalesMetric(metric: Omit<SalesMetric, "timestamp">): Promise<void> {
    try {
        const payload = {
            ...metric,
            timestamp: new Date().toISOString()
        };

        // In a real app, we'd store this in a dedicated analytics table or PostHog/Mixpanel
        console.log(`[ANALYTICS] Recording metric: ${metric.type}`, payload);

        const { error } = await supabase.from("analytics_events").insert(payload);
        if (error) console.warn("Failed to store analytics in DB:", error.message);
    } catch (err) {
        console.error("Analytics logging failed:", err);
    }
}

/**
 * Aggregates performance data for each sales strategy.
 * Returns success rates and total revenue impact.
 */
export async function getStrategyPerformance(): Promise<Record<string, { successRate: number, totalRevenue: number }>> {
    const { data, error } = await supabase
        .from("analytics_events")
        .select("strategyUsed, type, revenueImpact")
        .not("strategyUsed", "is", null);

    if (error || !data) return {};

    const stats: Record<string, { attempts: number, successes: number, revenue: number }> = {};

    data.forEach(m => {
        const s = m.strategyUsed;
        if (!stats[s]) stats[s] = { attempts: 0, successes: 0, revenue: 0 };
        
        stats[s].attempts++;
        if (m.type === "ORDER_SUCCESS") {
            stats[s].successes++;
            stats[s].revenue += m.revenueImpact || 0;
        }
    });

    const result: Record<string, { successRate: number, totalRevenue: number }> = {};
    Object.keys(stats).forEach(s => {
        result[s] = {
            successRate: stats[s].successes / stats[s].attempts,
            totalRevenue: stats[s].revenue
        };
    });

    return result;
}

export function trackVisit(userId: string, sessionId: string) {
    return logSalesMetric({ type: "VISIT", userId, sessionId });
}

export function trackProductView(userId: string, sessionId: string, productId: number) {
    return logSalesMetric({ type: "VIEW_PRODUCT", userId, sessionId, metadata: { productId } });
}

export function trackAddToCart(userId: string, sessionId: string, productId: number, price: number) {
    return logSalesMetric({ type: "ADD_TO_CART", userId, sessionId, metadata: { productId, price } });
}

export function trackCheckoutStart(userId: string, sessionId: string, cartTotal: number) {
    return logSalesMetric({ type: "CHECKOUT_START", userId, sessionId, metadata: { cartTotal } });
}

export function trackAddressProvided(userId: string, sessionId: string) {
    return logSalesMetric({ type: "ADDRESS_PROVIDED", userId, sessionId });
}

export function trackOrderSuccess(userId: string, sessionId: string, orderId: string, amount: number) {
    return logSalesMetric({ type: "ORDER_SUCCESS", userId, sessionId, metadata: { orderId, amount } });
}

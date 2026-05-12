import { omniBus, OmniEvent } from "./events";
import { logSalesMetric } from "./analytics";

export function initAutomation() {
    console.log("[AUTOMATION] Engine Online. Listening for commerce events...");

    // 1. Listen for Cart Updates -> Track for abandonment
    omniBus.on(OmniEvent.CART_UPDATED, ({ userId, cart }) => {
        logSalesMetric({ type: "ADD_TO_CART", userId, sessionId: "automation", metadata: { subtotal: cart.subtotal } });
        
        // Logic: Schedule a "Cart Recovery" check in 1 hour
        // In production: Use QStash / Redis Queue
        console.log(`[AUTOMATION] Scheduled cart recovery check for user ${userId}`);
    });

    // 2. Listen for Completed Checkouts -> Upsell
    omniBus.on(OmniEvent.CHECKOUT_COMPLETED, ({ userId, orderId }) => {
        logSalesMetric({ type: "ORDER_SUCCESS", userId, sessionId: "automation", metadata: { orderId } });
        
        console.log(`[AUTOMATION] Triggering post-purchase survey for order ${orderId}`);
    });

    // 3. Listen for Failures -> Escalation
    omniBus.on(OmniEvent.TOOL_FAILED, ({ userId, tool, error }) => {
        logSalesMetric({ type: "ABANDONED", userId, sessionId: "automation", metadata: { tool, error } });
        console.warn(`[AUTOMATION] Tool ${tool} failed. Alerting support if needed.`);
    });
}

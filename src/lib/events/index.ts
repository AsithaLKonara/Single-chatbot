import { EventEmitter } from "events";

export enum OmniEvent {
    CART_UPDATED = "cart.updated",
    CART_CLEARED = "cart.cleared",
    CHECKOUT_STARTED = "checkout.started",
    CHECKOUT_COMPLETED = "checkout.completed",
    ORDER_CREATED = "order.created",
    TOOL_EXECUTED = "tool.executed",
    TOOL_FAILED = "tool.failed",
    REFLECTION_GENERATED = "reflection.generated",
    OUTCOME_SIGNAL = "outcome.signal",
    ANALYTICS_TRACK = "analytics.track"
}

class OmniBus extends EventEmitter {
    private static instance: OmniBus;

    private constructor() {
        super();
        this.setMaxListeners(50);
    }

    public static getInstance(): OmniBus {
        if (!OmniBus.instance) {
            OmniBus.instance = new OmniBus();
        }
        return OmniBus.instance;
    }

    public emitOmni(event: OmniEvent, payload: any) {
        console.log(`[EVENT] ${event}`, payload);
        this.emit(event, payload);
    }
}

export const omniBus = OmniBus.getInstance();

import { logSalesMetric } from "../analytics";

// Standard listener for analytics
omniBus.on(OmniEvent.ANALYTICS_TRACK, (data) => {
    logSalesMetric(data).catch(console.error);
});

// Specific event wiring for automatic sales tracking
omniBus.on(OmniEvent.CART_UPDATED, (data) => {
    omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, { 
        type: "ADD_TO_CART", 
        userId: data.userId, 
        sessionId: data.sessionId || "unknown", 
        metadata: data 
    });
});

omniBus.on(OmniEvent.CHECKOUT_STARTED, (data) => {
    omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, { 
        type: "CHECKOUT_START", 
        userId: data.userId, 
        sessionId: data.sessionId || "unknown", 
        metadata: data 
    });
});

omniBus.on(OmniEvent.ORDER_CREATED, (data) => {
    omniBus.emitOmni(OmniEvent.ANALYTICS_TRACK, { 
        type: "ORDER_SUCCESS", 
        userId: data.userId, 
        sessionId: data.sessionId || "unknown", 
        metadata: data 
    });
});

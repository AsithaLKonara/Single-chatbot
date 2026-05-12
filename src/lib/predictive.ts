import { CustomerProfile } from "./memory";
import { Cart } from "./cart";

export interface PredictiveSignals {
    purchaseIntent: number; // 0 to 1
    abandonmentRisk: number; // 0 to 1
    recommendedAction: "ACCELERATE" | "RESCUE" | "NURTURE" | "NONE";
}

/**
 * Calculates real-time predictive signals based on current session and history.
 */
export function calculatePredictiveSignals(
    profile: CustomerProfile | null,
    cart: Cart | null,
    sessionDurationMs: number,
    frictionCount: number
): PredictiveSignals {
    let intent = 0.2; // Baseline
    let risk = 0.1;

    // 1. Intent Signals
    if (cart && cart.items.length > 0) {
        intent += 0.3;
        if (cart.subtotal > 5000) intent += 0.2;
    }
    
    if (profile?.behavioralSignals?.totalOrders && profile.behavioralSignals.totalOrders > 2) {
        intent += 0.2;
    }

    // 2. Risk Signals
    if (frictionCount > 1) risk += 0.3;
    
    // Hesitation check: if session is long (>10 mins) but no checkout
    if (sessionDurationMs > 600000 && (!cart || cart.items.length === 0)) {
        risk += 0.4;
    }

    // price sensitivity risk
    if (profile?.behavioralSignals?.priceSensitivity === "HIGH" && frictionCount > 0) {
        risk += 0.2;
    }

    // 3. Recommended Action
    let action: PredictiveSignals["recommendedAction"] = "NONE";
    
    if (intent > 0.7 && risk < 0.3) {
        action = "ACCELERATE";
    } else if (risk > 0.5) {
        action = "RESCUE";
    } else if (intent > 0.4) {
        action = "NURTURE";
    }

    return {
        purchaseIntent: Math.min(intent, 1),
        abandonmentRisk: Math.min(risk, 1),
        recommendedAction: action
    };
}

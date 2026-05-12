import { CustomerProfile } from "./memory";
import { getSystemWeights } from "./governor";

export enum CommerceStrategy {
    PREMIUM = "PREMIUM",   // Quality, features, durability (High AOV)
    VALUE = "VALUE",       // Affordability, discounts, savings (Budget-conscious)
    FAST = "FAST",         // Speed, minimal text, direct checkout (Repeat buyers)
    SUPPORT = "SUPPORT"    // Clarity, step-by-step, patient (Confused/New users)
}

export interface StrategyProfile {
    strategy: CommerceStrategy;
    tone: string;
    tactic: string;
}

export function evaluateStrategy(
    profile?: CustomerProfile, 
    cart?: any, 
    performance?: Record<string, { successRate: number, totalRevenue: number }>
): StrategyProfile {
    // 1. Detect confusion/support need
    const recentFriction = profile?.outcomeHistory?.slice(-1)[0];
    if (recentFriction && recentFriction.sentiment === "negative") {
        return {
            strategy: CommerceStrategy.SUPPORT,
            tone: "Patient and explanatory",
            tactic: "Guide the user step-by-step and clarify any confusion."
        };
    }

    // 2. High-value / Premium detection
    const avgOrderValue = profile?.behavioralSignals?.avgOrderValue || 0;
    const currentCartValue = cart?.subtotal || 0;

    if (currentCartValue > 10000 || avgOrderValue > 5000) {
        return {
            strategy: CommerceStrategy.PREMIUM,
            tone: "Confident and quality-focused",
            tactic: "Emphasize premium features, durability, and brand value."
        };
    }

    // 3. Performance-based Autonomous Selection
    // If we have performance data, prefer the strategy with the highest success rate
    if (performance) {
        const sorted = Object.entries(performance).sort((a, b) => b[1].successRate - a[1].successRate);
        const bestStrategy = sorted[0]?.[0] as CommerceStrategy;
        
        if (bestStrategy && bestStrategy !== CommerceStrategy.SUPPORT) {
             // Basic implementation: prefer the overall best if no specific signal
             // In production, we'd use more sophisticated multi-armed bandit logic
             // return specific profiles based on the bestStrategy
        }
    }

    // 4. Repeat buyer efficiency
    if (profile?.behavioralSignals?.totalOrders && profile.behavioralSignals.totalOrders > 5) {
        return {
            strategy: CommerceStrategy.FAST,
            tone: "Minimal and efficient",
            tactic: "Focus on speed, use direct links, and minimize conversational fluff."
        };
    }

    // 5. Global Optimization Governor (Final fallback / Bias)
    // In a real implementation, we'd use these weights in a probability-based selection
    // for A/B testing strategies. For now, we use them to influence the default.
    return {
        strategy: CommerceStrategy.VALUE,
        tone: "Reassuring and value-driven",
        tactic: "Highlight affordability, discounts, and the best deals."
    };
}

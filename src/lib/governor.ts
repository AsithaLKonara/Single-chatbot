import { Redis } from "@upstash/redis";
import { getStrategyPerformance } from "./analytics";
import { CommerceStrategy } from "./strategy";

export interface GlobalKPIs {
    avgOrderValue: number;
    conversionRate: number;
    totalRevenue: number;
    topCategories: Record<string, number>;
}

export interface SystemWeights {
    strategyBias: Record<CommerceStrategy, number>;
    rankingWeights: {
        stock: number;
        conversion: number;
        similarity: number;
    };
}

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

const GOVERNOR_KEY = "omnichat:governor:weights";

/**
 * Retrieves the current system-wide optimized weights.
 */
export async function getSystemWeights(): Promise<SystemWeights> {
    const client = getRedis();
    if (client) {
        try {
            const cached = await client.get<SystemWeights>(GOVERNOR_KEY);
            if (cached) return cached;
        } catch (redisErr) {
            console.warn("[GOVERNOR] Redis weights fetch failed", redisErr);
        }
    }

    // Default weights
    return {
        strategyBias: {
            [CommerceStrategy.VALUE]: 0.4,
            [CommerceStrategy.PREMIUM]: 0.2,
            [CommerceStrategy.FAST]: 0.2,
            [CommerceStrategy.SUPPORT]: 0.2
        },
        rankingWeights: {
            stock: 0.5,
            conversion: 0.3,
            similarity: 0.2
        }
    };
}

/**
 * Periodically audits global performance and updates system weights.
 * This is the core "Self-Learning" loop at the business level.
 */
export async function optimizeSystemWeights(): Promise<void> {
    try {
        const performance = await getStrategyPerformance();
        const currentWeights = await getSystemWeights();
        
        // 1. Re-calculate Strategy Bias
        // Higher success rate = higher bias
        const totalRate = Object.values(performance).reduce((sum, p) => sum + p.successRate, 0);
        
        if (totalRate > 0) {
            Object.keys(performance).forEach(s => {
                const strategy = s as CommerceStrategy;
                currentWeights.strategyBias[strategy] = performance[s].successRate / totalRate;
            });
        }

        // 2. Adjust Ranking Weights
        // If global conversion rate is low, increase conversion weight vs stock
        const globalSuccessRate = totalRate / Object.keys(performance).length;
        if (globalSuccessRate < 0.1) {
            currentWeights.rankingWeights.conversion += 0.05;
            currentWeights.rankingWeights.stock -= 0.05;
        }

        // Persist the new "Ideal" system state
        const client = getRedis();
        if (client) {
            try {
                await client.set(GOVERNOR_KEY, currentWeights);
                console.log("[GOVERNOR] System weights optimized based on global performance.");
            } catch (redisErr) {
                console.warn("[GOVERNOR] Redis weights save failed", redisErr);
            }
        }
    } catch (err) {
        console.error("[GOVERNOR] Optimization failed:", err);
    }
}

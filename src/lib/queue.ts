// Redis-backed message queue for idempotent WhatsApp processing
// Prevents double-processing if Meta retries the webhook

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

// Mark a message as processing — returns false if already seen (duplicate)
export async function acquireMessageLock(messageId: string): Promise<boolean> {
    const client = getRedis();
    if (!client) return true; // allow all if Redis not configured

    const key = `wa:msg:${messageId}`;
    // NX = only set if not exists, EX = expire after 24h
    const result = await client.set(key, "1", { nx: true, ex: 86400 });
    return result === "OK";
}

// Release the lock (e.g. on processing failure so it can be retried)
export async function releaseMessageLock(messageId: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    await client.del(`wa:msg:${messageId}`);
}

// Store a reply for deduplication (optional caching of bot responses)
export async function cacheResponse(sessionKey: string, response: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    await client.set(`wa:resp:${sessionKey}`, response, { ex: 3600 });
}

export async function getCachedResponse(sessionKey: string): Promise<string | null> {
    const client = getRedis();
    if (!client) return null;
    return client.get<string>(`wa:resp:${sessionKey}`);
}

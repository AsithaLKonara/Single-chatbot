import { prisma } from "./prisma";
import { Redis } from "@upstash/redis";

export enum CheckoutStage {
    CART_REVIEW = "CART_REVIEW",
    CUSTOMER_INFO = "CUSTOMER_INFO",
    SHIPPING = "SHIPPING",
    PAYMENT = "PAYMENT",
    CONFIRMED = "CONFIRMED"
}

export interface CheckoutState {
    id: string;
    userId: string;
    cartId: string;
    stage: CheckoutStage;
    customerData?: any;
    shippingInfo?: any;
}

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

export async function getOrCreateCheckout(userId: string, cartId: string): Promise<CheckoutState> {
    const client = getRedis();
    const key = `checkout:${userId}`;

    if (client) {
        const cached = await client.get<CheckoutState>(key);
        if (cached && cached.cartId === cartId) return cached;
    }

    // Fallback to DB or create new
    let dbSession = await prisma.checkoutSession.findFirst({
        where: { userId, cartId, status: "pending" },
        orderBy: { createdAt: "desc" }
    });

    if (!dbSession) {
        dbSession = await prisma.checkoutSession.create({
            data: { userId, cartId, stage: CheckoutStage.CART_REVIEW }
        });
    }

    const state: CheckoutState = {
        id: dbSession.id,
        userId: dbSession.userId,
        cartId: dbSession.cartId,
        stage: dbSession.stage as CheckoutStage,
        customerData: dbSession.customerData,
        shippingInfo: dbSession.shippingInfo
    };

    if (client) {
        await client.set(key, state, { ex: 3600 }); // 1 hour
    }

    return state;
}

export const VALID_TRANSITIONS: Record<CheckoutStage, CheckoutStage[]> = {
    [CheckoutStage.CART_REVIEW]: [CheckoutStage.CUSTOMER_INFO],
    [CheckoutStage.CUSTOMER_INFO]: [CheckoutStage.CART_REVIEW, CheckoutStage.SHIPPING],
    [CheckoutStage.SHIPPING]: [CheckoutStage.CUSTOMER_INFO, CheckoutStage.PAYMENT],
    [CheckoutStage.PAYMENT]: [CheckoutStage.SHIPPING, CheckoutStage.CONFIRMED],
    [CheckoutStage.CONFIRMED]: []
};

export async function updateCheckoutStage(userId: string, stage: CheckoutStage, data?: any): Promise<CheckoutState> {
    const client = getRedis();
    const key = `checkout:${userId}`;
    
    // Get current state
    const current = await getOrCreateCheckout(userId, data?.cartId || "");

    // Validate transition
    const allowed = VALID_TRANSITIONS[current.stage];
    if (!allowed.includes(stage)) {
        console.warn(`[Checkout] Invalid transition: ${current.stage} -> ${stage}`);
        // In production, we might want to throw here, but for now we'll just log
    }

    const updateData: any = { stage };
    if (stage === CheckoutStage.CUSTOMER_INFO && data) {
        updateData.customerData = data;
    }
    if (stage === CheckoutStage.SHIPPING && data) {
        updateData.shippingInfo = data;
    }

    // Always update DB first (source of truth)
    const updated = await prisma.checkoutSession.update({
        where: { id: current.id },
        data: updateData
    });

    const newState: CheckoutState = {
        ...current,
        stage: updated.stage as CheckoutStage,
        customerData: updated.customerData || current.customerData,
        shippingInfo: updated.shippingInfo || current.shippingInfo
    };

    // Update cache
    if (client) {
        await client.set(key, newState, { ex: 3600 });
    }

    return newState;
}

export async function completeCheckout(userId: string, paymentId: string): Promise<void> {
    const client = getRedis();
    const key = `checkout:${userId}`;
    
    const current = await getOrCreateCheckout(userId, "");
    
    await prisma.checkoutSession.update({
        where: { id: current.id },
        data: { stage: CheckoutStage.CONFIRMED, status: "completed", paymentId }
    });

    if (client) {
        await client.del(key);
    }
}

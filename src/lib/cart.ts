import { Redis } from "@upstash/redis";
import { prisma } from "./prisma";
import { omniBus, OmniEvent } from "./events";

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    subtotal: number;
}

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

const CART_TTL = 60 * 60 * 24 * 7; // 7 days

export async function getCart(userId: string): Promise<Cart> {
    const client = getRedis();
    const key = `cart:${userId}`;

    if (client) {
        try {
            const cached = await client.get<Cart>(key);
            if (cached) return cached;
        } catch (err) {
            console.warn("[CART] Redis fetch failed, falling back to DB", err);
        }
    }

    // Fallback to database
    try {
        const dbCart = await prisma.cart.findFirst({
            where: { userId, status: "active" },
            include: { items: true },
        });

        if (!dbCart) {
            return { userId, items: [], subtotal: 0 };
        }

        const cart: Cart = {
            userId,
            items: dbCart.items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || undefined,
            })),
            subtotal: dbCart.subtotal,
        };

        // Cache it
        if (client) {
            try {
                await client.set(key, cart, { ex: CART_TTL });
            } catch (err) {
                console.warn("[CART] Redis cache save failed", err);
            }
        }

        return cart;
    } catch (error) {
        console.error("Cart retrieval error:", error);
        return { userId, items: [], subtotal: 0 };
    }
}

export async function addToCart(userId: string, item: CartItem): Promise<Cart> {
    const cart = await getCart(userId);
    const existingIndex = cart.items.findIndex((i) => i.productId === item.productId);

    if (existingIndex > -1) {
        cart.items[existingIndex].quantity += item.quantity;
    } else {
        cart.items.push(item);
    }

    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Save to Redis
    const client = getRedis();
    if (client) {
        try {
            await client.set(`cart:${userId}`, cart, { ex: CART_TTL });
        } catch (err) {
            console.warn("[CART] Redis save failed", err);
        }
    }

    omniBus.emitOmni(OmniEvent.CART_UPDATED, { userId, cart });

    // Async sync to DB
    syncCartToDb(userId, cart).catch(console.error);

    return cart;
}

export async function removeFromCart(userId: string, productId: number): Promise<Cart> {
    const cart = await getCart(userId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const client = getRedis();
    if (client) {
        try {
            await client.set(`cart:${userId}`, cart, { ex: CART_TTL });
        } catch (err) {
            console.warn("[CART] Redis save failed", err);
        }
    }

    syncCartToDb(userId, cart).catch(console.error);

    return cart;
}

export async function clearCart(userId: string): Promise<void> {
    const client = getRedis();
    if (client) {
        try {
            await client.del(`cart:${userId}`);
        } catch (err) {
            console.warn("[CART] Redis delete failed", err);
        }
    }

    try {
        await prisma.cart.updateMany({
            where: { userId, status: "active" },
            data: { status: "cleared" },
        });
    } catch (error) {
        console.error("Cart clear error:", error);
    }
}

async function syncCartToDb(userId: string, cart: Cart) {
    try {
        await prisma.$transaction(async (tx) => {
            // Find or create active cart
            let dbCart = await tx.cart.findFirst({
                where: { userId, status: "active" },
            });

            if (!dbCart) {
                dbCart = await tx.cart.create({
                    data: { userId, status: "active", subtotal: cart.subtotal },
                });
            } else {
                await tx.cart.update({
                    where: { id: dbCart.id },
                    data: { subtotal: cart.subtotal },
                });
            }

            // Delete existing items and re-insert
            await tx.cartItem.deleteMany({ where: { cartId: dbCart.id } });
            await tx.cartItem.createMany({
                data: cart.items.map((i) => ({
                    cartId: dbCart!.id,
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image,
                })),
            });
        });
    } catch (error) {
        console.error("Cart sync error:", error);
    }
}

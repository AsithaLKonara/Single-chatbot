import { Redis } from "@upstash/redis";

const WC_URL = process.env.WC_STORE_URL ?? "";
const WC_KEY = process.env.WC_CONSUMER_KEY ?? "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? "";

let redis: Redis | null = null;
function getRedis() {
    if (redis) return redis;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = Redis.fromEnv();
    }
    return redis;
}

// Basic-auth header
function authHeaders(): Record<string, string> {
    const token = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    return {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
    };
}

async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wcFetch<T>(path: string, options?: RequestInit, retries = 3): Promise<T | null> {
    if (!WC_URL || !WC_KEY) return null;
    
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(`${WC_URL}/wp-json/wc/v3${path}`, {
                ...options,
                headers: { ...authHeaders(), ...(options?.headers ?? {}) },
            });

            // If success, return data
            if (res.ok) {
                return (await res.json()) as T;
            }

            // Classification of errors
            if (res.status >= 400 && res.status < 500) {
                // Client error (400, 401, 404) - don't retry unless it's 429
                if (res.status !== 429) {
                    console.error(`[WooCommerce] Client Error ${path} → ${res.status}`);
                    return null;
                }
            }

            // If we're here, it's either 429 or 5xx
            console.warn(`[WooCommerce] Retry ${i + 1}/${retries} for ${path} (Status: ${res.status})`);
            lastError = new Error(`HTTP ${res.status}`);
        } catch (err) {
            console.error(`[WooCommerce] Attempt ${i + 1} failed:`, err);
            lastError = err;
        }
        
        if (i < retries - 1) {
            await wait(Math.pow(2, i) * 1000); // Exponential backoff: 1s, 2s, 4s
        }
    }

    console.error(`[WooCommerce] All retries failed for ${path}`, lastError);
    return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WCProduct {
    id: number;
    name: string;
    price: string;
    regular_price?: string;
    on_sale?: boolean;
    short_description: string;
    permalink: string;
    stock_status: string;
    stock_quantity?: number | null;
    images: { src: string }[];
}

export interface WCOrder {
    id: number;
    status: string;
    date_created: string;
    total: string;
    billing: { first_name: string; last_name: string; email: string; phone: string };
    shipping: { address_1: string; city: string; country: string };
    line_items: { name: string; quantity: number; total: string }[];
    meta_data: { key: string; value: string }[];
}

// ─── Product Queries ───────────────────────────────────────────────────────────

export async function searchProducts(query: string): Promise<WCProduct[]> {
    const client = getRedis();
    const cacheKey = `wc:search:${Buffer.from(query).toString("base64")}`;

    if (client) {
        try {
            const cached = await client.get<WCProduct[]>(cacheKey);
            if (cached) {
                console.log(`[WooCommerce] Cache hit for search: ${query}`);
                return cached;
            }
        } catch (redisErr) {
            console.warn("[WooCommerce] Redis cache get failed", redisErr);
        }
    }

    const data = await wcFetch<WCProduct[]>(
        `/products?search=${encodeURIComponent(query)}&per_page=5&status=publish`
    );
    const products = data ?? [];

    if (client && products.length > 0) {
        try {
            await client.set(cacheKey, products, { ex: 300 }); // 5 min cache
        } catch (redisErr) {
            console.warn("[WooCommerce] Redis cache set failed", redisErr);
        }
    }

    return products;
}

export async function getProduct(productId: number): Promise<WCProduct | null> {
    return wcFetch<WCProduct>(`/products/${productId}`);
}

// ─── Order Queries ─────────────────────────────────────────────────────────────

export async function getOrder(orderId: string | number): Promise<WCOrder | null> {
    return wcFetch<WCOrder>(`/orders/${orderId}`);
}

export async function getOrdersByPhone(phone: string): Promise<WCOrder[]> {
    const data = await wcFetch<WCOrder[]>(
        `/orders?search=${encodeURIComponent(phone)}&per_page=5`
    );
    return data ?? [];
}

// ─── Order Creation ────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
    customer: {
        name: string;
        phone: string;
        email: string;
        address: string;
        city: string;
        country: string;
    };
    items: { productId: number; quantity: number }[];
    paymentMethod?: string;
}

export async function createOrder(payload: CreateOrderPayload, idempotencyKey?: string): Promise<WCOrder | null> {
    // 1. Idempotency Check — search for existing order with this key in meta
    if (idempotencyKey) {
        const existing = await wcFetch<WCOrder[]>(
            `/orders?meta_key=_omnichat_idempotency_key&meta_value=${idempotencyKey}`
        );
        if (existing && existing.length > 0) {
            console.log(`[WooCommerce] Found existing order for key ${idempotencyKey}: #${existing[0].id}`);
            return existing[0];
        }
    }

    const body = {
        payment_method: payload.paymentMethod || "cod",
        payment_method_title: payload.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
        set_paid: false,
        billing: {
            first_name: payload.customer.name.split(" ")[0],
            last_name: payload.customer.name.split(" ").slice(1).join(" ") || "-",
            phone: payload.customer.phone,
            email: payload.customer.email,
            address_1: payload.customer.address,
            city: payload.customer.city,
            country: payload.customer.country,
        },
        shipping: {
            first_name: payload.customer.name.split(" ")[0],
            last_name: payload.customer.name.split(" ").slice(1).join(" ") || "-",
            address_1: payload.customer.address,
            city: payload.customer.city,
            country: payload.customer.country,
        },
        line_items: payload.items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity
        })),
        meta_data: idempotencyKey ? [
            { key: "_omnichat_idempotency_key", value: idempotencyKey }
        ] : [],
    };

    return wcFetch<WCOrder>("/orders", { method: "POST", body: JSON.stringify(body) });
}

export async function calculateShipping(city: string, items: any[]): Promise<{ method: string; cost: number }[]> {
    // Placeholder for actual WooCommerce shipping zones logic
    // Usually calls /shipping_methods or custom logic
    return [
        { method: "Standard Shipping", cost: city.toLowerCase() === "colombo" ? 250 : 450 },
        { method: "Express Delivery", cost: 800 }
    ];
}

// ─── Returns / Refunds ─────────────────────────────────────────────────────────

export async function requestReturn(orderId: string | number, reason: string): Promise<boolean> {
    // Update order status to "refund-requested" via meta or note
    const result = await wcFetch(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({
            status: "on-hold",
            customer_note: `Return requested: ${reason}`,
        }),
    });
    return result !== null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Extract tracking number from order meta_data
export function extractTracking(order: WCOrder): string | null {
    const meta = order.meta_data?.find(
        (m) => m.key === "_wc_shipment_tracking_number" || m.key === "tracking_number"
    );
    return meta?.value ?? null;
}

// Format an order summary for WhatsApp / chat
export function formatOrderSummary(order: WCOrder): string {
    const items = order.line_items.map((i) => `• ${i.name} x${i.quantity}`).join("\n");
    return [
        `📦 Order #${order.id}`,
        `Status: ${order.status.toUpperCase()}`,
        `Total: ${order.total}`,
        `Items:\n${items}`,
        `Shipping to: ${order.shipping.city}, ${order.shipping.country}`,
    ].join("\n");
}

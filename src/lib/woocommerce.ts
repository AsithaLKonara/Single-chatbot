// WooCommerce REST API v3 service layer

const WC_URL = process.env.WC_STORE_URL ?? "";
const WC_KEY = process.env.WC_CONSUMER_KEY ?? "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? "";

// Basic-auth header
function authHeaders(): Record<string, string> {
    const token = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    return {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
    };
}

async function wcFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
    if (!WC_URL || !WC_KEY) return null;
    try {
        const res = await fetch(`${WC_URL}/wp-json/wc/v3${path}`, {
            ...options,
            headers: { ...authHeaders(), ...(options?.headers ?? {}) },
        });
        if (!res.ok) {
            console.error(`WooCommerce ${path} → ${res.status}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.error("WooCommerce fetch error:", err);
        return null;
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WCProduct {
    id: number;
    name: string;
    price: string;
    short_description: string;
    permalink: string;
    stock_status: string;
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
    const data = await wcFetch<WCProduct[]>(
        `/products?search=${encodeURIComponent(query)}&per_page=5&status=publish`
    );
    return data ?? [];
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
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    country?: string;
    productId: number;
    quantity: number;
}

export async function createOrder(payload: CreateOrderPayload): Promise<WCOrder | null> {
    const body = {
        payment_method: "cod",
        payment_method_title: "Cash on Delivery",
        set_paid: false,
        billing: {
            first_name: payload.customerName.split(" ")[0],
            last_name: payload.customerName.split(" ").slice(1).join(" ") || "-",
            phone: payload.phone,
            email: payload.email ?? `${payload.phone}@wa.noemail`,
            address_1: payload.address,
            city: payload.city,
            country: payload.country ?? "LK",
        },
        shipping: {
            first_name: payload.customerName.split(" ")[0],
            last_name: payload.customerName.split(" ").slice(1).join(" ") || "-",
            address_1: payload.address,
            city: payload.city,
            country: payload.country ?? "LK",
        },
        line_items: [{ product_id: payload.productId, quantity: payload.quantity }],
    };

    return wcFetch<WCOrder>("/orders", { method: "POST", body: JSON.stringify(body) });
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

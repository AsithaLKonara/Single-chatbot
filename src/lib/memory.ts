import { supabase } from "./supabase";

// ─── Conversation Memory ────────────────────────────────────────────────────────

export async function saveMessage(
    sessionId: string,
    userId: string,
    message: string,
    response: string
): Promise<void> {
    await supabase.from("conversations").insert({
        session_id: sessionId,
        user_id: userId,
        message,
        response,
    });
}

export async function getHistory(
    sessionId: string,
    userId: string
): Promise<{ message: string; response: string }[]> {
    const { data } = await supabase
        .from("conversations")
        .select("message, response")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(8);

    return (data || []).reverse();
}

// ─── Customer Profile (Phase 7 — Smart Memory) ─────────────────────────────────

export interface CustomerProfile {
    phone: string;
    name?: string;
    last_order_id?: string;
    preferences?: Record<string, unknown>;
    created_at?: string;
}

// Retrieve a customer profile by WhatsApp phone number
export async function getCustomerProfile(phone: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

    if (error || !data) return null;
    return data as CustomerProfile;
}

// Create or update a customer record
export async function upsertCustomerProfile(
    phone: string,
    updates: Partial<Omit<CustomerProfile, "phone" | "created_at">>
): Promise<void> {
    await supabase
        .from("customers")
        .upsert({ phone, ...updates }, { onConflict: "phone" });
}

// Build a personalized greeting from profile data
export function buildCustomerContext(profile: CustomerProfile | null): string {
    if (!profile) return "";

    const parts: string[] = [];
    if (profile.name) parts.push(`Customer name: ${profile.name}`);
    if (profile.last_order_id) parts.push(`Last order ID: #${profile.last_order_id}`);
    if (profile.preferences && Object.keys(profile.preferences).length > 0) {
        parts.push(`Known preferences: ${JSON.stringify(profile.preferences)}`);
    }
    return parts.length > 0 ? `\nCustomer profile:\n${parts.join("\n")}` : "";
}

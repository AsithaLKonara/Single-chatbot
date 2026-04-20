// Automation engine — proactive messaging rules
// Called by cron job at /api/automation

import { getOrder, getOrdersByPhone } from "@/lib/woocommerce";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getCustomerProfile } from "@/lib/memory";

// ─── Delivered order follow-up ─────────────────────────────────────────────────
// Run after orders are marked "completed" — ask for a review

export async function processDeliveredOrders(orderIds: string[]): Promise<void> {
    for (const orderId of orderIds) {
        const order = await getOrder(orderId);
        if (!order || order.status !== "completed") continue;

        const phone = order.billing?.phone;
        if (!phone) continue;

        const profile = await getCustomerProfile(phone);
        const name = profile?.name ?? order.billing.first_name ?? "there";

        const message =
            `Hi ${name}! 🎉 Your order #${order.id} has been delivered.\n` +
            `We hope you love it! Could you spare a moment to leave a review? Your feedback helps us a lot.\n` +
            `Thank you for shopping with us! 🙏`;

        await sendWhatsAppMessage(phone, message);
        console.log(`[Automation] Delivery follow-up sent to ${phone} for order #${orderId}`);
    }
}

// ─── Delayed order notification ────────────────────────────────────────────────
// Run periodically — notify customers about orders stuck in "processing" > 3 days

export async function processDelayedOrders(orderIds: string[]): Promise<void> {
    for (const orderId of orderIds) {
        const order = await getOrder(orderId);
        if (!order) continue;

        const createdAt = new Date(order.date_created);
        const daysSinceCreated =
            (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        if (order.status !== "processing" || daysSinceCreated < 3) continue;

        const phone = order.billing?.phone;
        if (!phone) continue;

        const profile = await getCustomerProfile(phone);
        const name = profile?.name ?? order.billing.first_name ?? "there";

        const message =
            `Hi ${name}, we wanted to update you on order #${order.id}.\n` +
            `It's currently being prepared and will ship very soon. ` +
            `We apologize for the wait and appreciate your patience! 🙏\n` +
            `Reply with your order number anytime to check the latest status.`;

        await sendWhatsAppMessage(phone, message);
        console.log(`[Automation] Delay notification sent to ${phone} for order #${orderId}`);
    }
}

// ─── Re-order nudge ────────────────────────────────────────────────────────────
// For customers who haven't ordered in 30 days

export async function processReorderNudges(phones: string[]): Promise<void> {
    for (const phone of phones) {
        const profile = await getCustomerProfile(phone);
        const name = profile?.name ?? "there";

        const orders = await getOrdersByPhone(phone);
        if (!orders.length) continue;

        const lastOrder = orders[0];
        const daysSince =
            (Date.now() - new Date(lastOrder.date_created).getTime()) /
            (1000 * 60 * 60 * 24);

        if (daysSince < 30) continue;

        const lastItem = lastOrder.line_items?.[0]?.name ?? "your last item";

        const message =
            `Hi ${name}! 👋 It's been a while since your last order.\n` +
            `Would you like to reorder *${lastItem}* or browse our latest products?\n` +
            `Just reply and I'll help you out! 😊`;

        await sendWhatsAppMessage(phone, message);
        console.log(`[Automation] Re-order nudge sent to ${phone}`);
    }
}

// Suppress unused import warning
void getOrdersByPhone;

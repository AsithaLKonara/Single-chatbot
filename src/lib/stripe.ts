import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
});

export const PLANS = {
    FREE: { id: "free", name: "Free", limit: 1000 },
    PRO: { id: "pro", name: "Pro", limit: 50000 },
    ENTERPRISE: { id: "enterprise", name: "Enterprise", limit: 1000000 },
};

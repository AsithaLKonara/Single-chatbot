import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature")!;

    try {
        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            const userId = session.metadata.userId;
            const plan = session.metadata.plan;

            await prisma.user.update({
                where: { id: userId },
                data: { plan, stripeId: session.customer }
            });
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers.get("stripe-signature");
  let event;

  try {
    const rawBody = await req.text();
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Allow testing without webhook secret if not configured in dev
      event = JSON.parse(rawBody);
    }
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    const email = session.customer_details?.email || session.customer_email || session.metadata?.email;
    const plan = session.metadata?.plan || "single";
    const customerId = session.customer;
    
    if (email) {
      try {
        let newTier = "free";
        let newQuota = 1;
        
        if (plan === "weekly") {
          newTier = "weekly";
          newQuota = 1;
        } else if (plan === "agency") {
          newTier = "agency";
          newQuota = 5;
        } else if (plan === "multi") {
          newTier = "free"; // Single purchase, not a sub, but maybe quota changes?
          newQuota = 3;
        }

        // Update the user's subscription tier
        await query(
          "UPDATE users SET subscription_tier = ?, allowed_quota = ?, stripe_customer_id = ? WHERE email = ?",
          [newTier, newQuota, customerId, email]
        );
        
        // Also update the lead status to "Closed Won" if they exist in leads
        let packageName = "Premium Report";
        if (plan === "weekly") packageName = "Premium weekly";
        if (plan === "agency") packageName = "Premium agency";
        
        await query(
          "UPDATE leads SET status = 'Closed Won', packageRequest = ?, amountPaid = ? WHERE email = ?",
          [packageName, (session.amount_total / 100).toFixed(2), email]
        );

        console.log(`Stripe Webhook: Successfully upgraded user ${email} to ${newTier} plan.`);
      } catch (e) {
        console.error("Stripe Webhook Database Error:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}

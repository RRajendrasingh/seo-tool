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

  // BUG #12 FIX: In production, webhook secret MUST be set. Without it, anyone can
  // forge a fake checkout.session.completed event and upgrade accounts for free.
  if (!webhookSecret && process.env.NODE_ENV === "production") {
    console.error("CRITICAL SECURITY: STRIPE_WEBHOOK_SECRET is not set in production! Rejecting unverified webhook.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers.get("stripe-signature");
  let event;

  try {
    const rawBody = await req.text();
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Allow testing without webhook secret in development only
      console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev mode only).");
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
        if (plan === "weekly") {
          await query(
            "UPDATE users SET subscription_tier = 'weekly', allowed_quota = 3, stripe_customer_id = ? WHERE email = ?",
            [customerId, email]
          );
        } else if (plan === "agency") {
          await query(
            "UPDATE users SET subscription_tier = 'agency', allowed_quota = 25, stripe_customer_id = ? WHERE email = ?",
            [customerId, email]
          );
        } else if (plan === "multi") {
          await query(
            "UPDATE users SET subscription_tier = 'multi', allowed_quota = 100, stripe_customer_id = ? WHERE email = ?",
            [customerId, email]
          );
        } else {
          // single report — increment quota by 1
          await query(
            "UPDATE users SET allowed_quota = allowed_quota + 1, stripe_customer_id = COALESCE(stripe_customer_id, ?) WHERE email = ?",
            [customerId, email]
          );
        }
        
        // Securely update the specific lead's status to "Closed Won"
        let packageName = "Premium Report";
        if (plan === "weekly") packageName = "Premium weekly";
        if (plan === "agency") packageName = "Premium agency";
        
        const targetUrl = session.metadata?.url;
        if (targetUrl && targetUrl !== "domain-pending") {
          let cleanUrl = targetUrl.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
          
          const existingLead = await query("SELECT id FROM leads WHERE email = ? AND website LIKE ?", [email, `%${cleanUrl}%`]);
          if (existingLead && existingLead.length > 0) {
            await query(
              "UPDATE leads SET status = 'Closed Won', packageRequest = ?, amountPaid = ? WHERE id = ?",
              [packageName, (session.amount_total / 100).toFixed(2), existingLead[0].id]
            );
          } else {
            const newId = "lead_" + Date.now();
            await query(
              "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'Pending', 'Closed Won', ?, ?, ?)",
              [newId, session.customer_details?.name || "Customer", email, session.customer_details?.phone || "Not Provided", cleanUrl, new Date().toISOString(), packageName, (session.amount_total / 100).toFixed(2), `Stripe checkout session ${session.id}`]
            );
          }
        }

        // BUG #1 FIX: was `newTier` (ReferenceError for single/multi plans) — now uses `plan`
        console.log(`Stripe Webhook: Successfully upgraded user ${email} to ${plan} plan.`);
      } catch (e) {
        console.error("Stripe Webhook Database Error:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}

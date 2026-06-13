import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe helper with environment secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing in your .env.local variables");
  }
  return new Stripe(secretKey);
};

export async function POST(req) {
  try {
    const { url, name, email, phone } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Target website URL is required" }, { status: 400 });
    }

    let stripe;
    try {
      stripe = getStripe();
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create a new checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Executive SEO Audit Report",
              description: `Comprehensive multi-engine performance and SEO analysis checklist for ${url}`,
            },
            unit_amount: 2900, // $29.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&url=${encodeURIComponent(url)}`,
      cancel_url: `${siteUrl}/checkout?url=${encodeURIComponent(url)}`,
      customer_email: email || undefined,
      metadata: {
        url,
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session initialization error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

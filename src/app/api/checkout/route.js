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
    let { 
      url, 
      name, 
      email, 
      phone, 
      plan, 
      cmsPlatform, 
      businessNiche, 
      targetAudience 
    } = await req.json();

    if (!url && (plan === "weekly" || plan === "agency")) {
      url = "domain-pending";
    }

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

    let planName = "Premium Executive SEO Audit Report";
    let planDescription = `Comprehensive performance and SEO analysis checklist for ${url}`;
    let planAmount = 2900; // Default $29.00
    let isSubscription = false;

    if (plan === "multi") {
      planName = "3-Page Multi-Page SEO Pack";
      planDescription = `Deep audit covering up to 3 core pages on ${url}`;
      planAmount = 5900;
    } else if (plan === "weekly") {
      planName = "Weekly SEO Monitoring Subscription";
      planDescription = `Background scan every Monday with alerts for ${url}`;
      planAmount = 4900;
      isSubscription = true;
    } else if (plan === "agency") {
      planName = "White-Label Agency License";
      planDescription = `Up to 5 monitored domains with custom PDF branding templates for ${url}`;
      planAmount = 9900;
      isSubscription = true;
    }

    // Create a new checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planName,
              description: planDescription,
            },
            unit_amount: planAmount, // in cents
            recurring: isSubscription ? { interval: "month" } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&url=${encodeURIComponent(url)}`,
      cancel_url: `${siteUrl}/audit?url=${encodeURIComponent(url)}&canceled=true`,
      customer_email: email || undefined,
      metadata: {
        url,
        name,
        email,
        phone,
        plan: plan || "single",
        cmsPlatform: cmsPlatform || "",
        businessNiche: businessNiche || "",
        targetAudience: targetAudience || ""
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session initialization error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

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

    let planName = "Starter Single Report";
    let planDescription = `Comprehensive performance and SEO analysis checklist for ${url}`;
    let planAmount = 900; // $9.00
    let isSubscription = false;

    if (plan === "multi") {
      planName = "Enterprise Tracking";
      planDescription = `High-volume domain tracking and advanced technical crawling for ${url}`;
      planAmount = 19900; // $199.00
      isSubscription = true;
    } else if (plan === "weekly") {
      planName = "Pro Monitor (Monthly)";
      planDescription = `Weekly automated background scans with email alerts for ${url}`;
      planAmount = 2900; // $29.00
      isSubscription = true;
    } else if (plan === "agency") {
      planName = "Agency Sales Plan (Monthly)";
      planDescription = `Up to 25 monitored domains with white-label PDF templates for ${url}`;
      planAmount = 9900; // $99.00
      isSubscription = true;
    }

    // Create a new checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: {
        enabled: true,
      },
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

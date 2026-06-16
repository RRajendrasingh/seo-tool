import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing in your .env.local variables");
  }
  return new Stripe(secretKey);
};

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 1. Search for customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // 2. If not found, create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.full_name || "Valued Customer"
      });
      customerId = customer.id;
    }

    // 3. Create Stripe Customer Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/dashboard`
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (e) {
    console.error("Stripe portal session creation failed, falling back to mock portal:", e.message);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // Redirect to a simulated mock success/billing page
    return NextResponse.json({ url: `${siteUrl}/dashboard?billing_portal=simulated` });
  }
}

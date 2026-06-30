import { NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing in your .env.local variables");
  }
  return new Stripe(secretKey);
};

// GET: Verifies Stripe session and updates leads and subscriptions in the DB
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id query parameter is required" }, { status: 400 });
    }

    let stripe;
    try {
      stripe = getStripe();
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      try {
        const metadata = session.metadata;
        const email = metadata.email;
        const url = metadata.url;
        const name = metadata.name || "Client";
        const phone = metadata.phone || "Not Provided";
        const plan = metadata.plan || "single";
        const cmsPlatform = metadata.cmsPlatform || null;
        const businessNiche = metadata.businessNiche || null;
        const targetAudience = metadata.targetAudience || null;
        
        let cleanWebsite = url.trim().toLowerCase();
        cleanWebsite = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, "");
        cleanWebsite = cleanWebsite.split("/")[0];

        const { query } = require("@/utils/db");

        // 1. Update Leads Table (CRM integration)
        const leads = await query("SELECT id FROM leads WHERE website = ?", [cleanWebsite]);
        const amountPaid = plan === "multi" ? 199.00 : plan === "weekly" ? 29.00 : plan === "agency" ? 99.00 : 9.00;
        if (leads && leads.length > 0) {
          await query(
            "UPDATE leads SET status = 'Closed Won', packageRequest = ?, amountPaid = ?, notes = ? WHERE id = ?",
            [`Premium ${plan}`, amountPaid, `Paid via Stripe session ${sessionId}`, leads[0].id]
          );
        } else {
          const leadId = "lead_" + Date.now();
          await query(
            "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'Pending', 'Closed Won', ?, ?, ?)",
            [leadId, name, email || "stripe@unknown.com", phone, cleanWebsite, new Date().toISOString(), `Premium ${plan}`, amountPaid, `Stripe checkout session ${sessionId}`]
          );
        }

        // 2. Link to User Profile (Subscription & Monitors)
        if (email) {
          const users = await query("SELECT id, subscription_tier FROM users WHERE email = ?", [email]);
          if (users && users.length > 0) {
            const userId = users[0].id;
            const currentTier = users[0].subscription_tier || "free";
            if (plan === "weekly" || plan === "agency") {
              const newTier = (currentTier === "agency" && plan === "weekly") ? "agency" : plan;
              await query(
                "UPDATE users SET subscription_tier = ?, subscription_status = 'active' WHERE id = ?",
                [newTier, userId]
              );
              const monitorId = "mon_" + Math.random().toString(36).substring(2, 11);
              await query(
                "INSERT INTO monitored_domains (id, user_id, domain, cms_platform, business_niche, target_audience) VALUES (?, ?, ?, ?, ?, ?)",
                [monitorId, userId, cleanWebsite, cmsPlatform, businessNiche, targetAudience]
              );
            } else {
              const purchaseId = "prc_" + Math.random().toString(36).substring(2, 11);
              await query(
                "INSERT INTO purchased_audits (id, user_id, domain, pack_type, cms_platform, business_niche, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [purchaseId, userId, cleanWebsite, plan, cmsPlatform, businessNiche, targetAudience]
              );
            }
          }
        }
      } catch (dbErr) {
        console.error("Failed to upgrade DB records on verify-session GET:", dbErr);
      }

      return NextResponse.json({ 
        success: true, 
        url: session.metadata.url,
        metadata: session.metadata 
      });
    } else {
      return NextResponse.json({ success: false, status: session.payment_status });
    }
  } catch (error) {
    console.error("Stripe session verification GET error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST: Simulates payment updates for the Local Demo Payment flow
export async function POST(req) {
  try {
    const { url, email, name, plan, cmsPlatform, businessNiche, targetAudience } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { query } = require("@/utils/db");
    
    // Find or create mock user
    let users = await query("SELECT id, subscription_tier FROM users WHERE email = ?", [email]);
    let userId;
    let currentTier = "free";
    if (users && users.length > 0) {
      userId = users[0].id;
      currentTier = users[0].subscription_tier || "free";
    } else {
      userId = "usr_" + Math.random().toString(36).substring(2, 11);
      await query(
        "INSERT INTO users (id, email, full_name, auth_provider) VALUES (?, ?, ?, 'local')",
        [userId, email, name || "Jane Doe"]
      );
    }

    let cleanWebsite = url.trim().toLowerCase();
    cleanWebsite = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, "");
    cleanWebsite = cleanWebsite.split("/")[0];

    // Create or update a Closed Won lead for consistency in local checkout simulation
    const amountPaid = plan === "multi" ? 199.00 : plan === "weekly" ? 29.00 : plan === "agency" ? 99.00 : 9.00;
    const existingLeads = await query("SELECT id FROM leads WHERE email = ? AND website = ?", [email, cleanWebsite]);
    if (existingLeads && existingLeads.length > 0) {
      await query(
        "UPDATE leads SET status = 'Closed Won', packageRequest = ?, amountPaid = ?, notes = ?, date = ? WHERE id = ?",
        [`Premium ${plan}`, amountPaid, `Local checkout simulation (Updated)`, new Date().toISOString(), existingLeads[0].id]
      );
    } else {
      const leadId = "lead_" + Date.now();
      await query(
        "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'Pending', 'Closed Won', ?, ?, ?)",
        [leadId, name || "Client", email, "Not Provided", cleanWebsite, new Date().toISOString(), `Premium ${plan}`, amountPaid, `Local checkout simulation`]
      );
    }

    // Update user sub details or purchases in DB
    if (plan === "weekly" || plan === "agency") {
      const newTier = (currentTier === "agency" && plan === "weekly") ? "agency" : plan;
      await query(
        "UPDATE users SET subscription_tier = ?, subscription_status = 'active' WHERE id = ?",
        [newTier, userId]
      );
      
      const monitorId = "mon_" + Math.random().toString(36).substring(2, 11);
      await query(
        "INSERT INTO monitored_domains (id, user_id, domain, cms_platform, business_niche, target_audience) VALUES (?, ?, ?, ?, ?, ?)",
        [monitorId, userId, cleanWebsite, cmsPlatform || null, businessNiche || null, targetAudience || null]
      );
    } else {
      const purchaseId = "prc_" + Math.random().toString(36).substring(2, 11);
      await query(
        "INSERT INTO purchased_audits (id, user_id, domain, pack_type, cms_platform, business_niche, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [purchaseId, userId, cleanWebsite, plan || "single", cmsPlatform || null, businessNiche || null, targetAudience || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mock session post error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

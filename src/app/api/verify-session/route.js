import { NextResponse } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing in your .env.local variables");
  }
  return new Stripe(secretKey);
};

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

    // Retrieve full checkout session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      try {
        const metadata = session.metadata;
        const email = metadata.email;
        const url = metadata.url;
        const name = metadata.name || "Client";
        const phone = metadata.phone || "Not Provided";
        
        let cleanWebsite = url.trim().toLowerCase();
        cleanWebsite = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, "");
        cleanWebsite = cleanWebsite.split("/")[0];

        // Search for existing lead in MySQL database
        const { query } = require("@/utils/db");
        let leads = [];
        if (email) {
          leads = await query("SELECT id, notes FROM leads WHERE email = ? AND website = ?", [email, cleanWebsite]);
        }
        if (leads.length === 0 && cleanWebsite) {
          leads = await query("SELECT id, notes FROM leads WHERE website = ?", [cleanWebsite]);
        }

        if (leads && leads.length > 0) {
          const leadId = leads[0].id;
          const oldNotes = leads[0].notes || "";
          const newNotes = oldNotes 
            ? `${oldNotes}\n[Stripe Payment] Upgraded to Premium Report ($29) via session ${sessionId}.`
            : `Upgraded to Premium Report ($29) via session ${sessionId}.`;

          await query(
            "UPDATE leads SET status = 'Closed Won', packageRequest = 'Premium Report', amountPaid = 29.00, notes = ? WHERE id = ?",
            [newNotes, leadId]
          );
        } else {
          // Create a new lead directly in the database
          const leadId = "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
          await query(
            "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, 0, 'Pending', 'Closed Won', 'Premium Report', 29.00, ?)",
            [leadId, name, email || "stripe_customer@unknown.com", phone, cleanWebsite, new Date().toISOString(), `Stripe direct checkout. Session: ${sessionId}`]
          );
        }
      } catch (dbErr) {
        console.error("Failed to upgrade lead on verify-session:", dbErr);
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
    console.error("Stripe session verification error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

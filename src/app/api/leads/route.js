import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function verifyAdmin(request) {
  const passcode = request.headers.get("x-admin-passcode");
  const expected = process.env.ADMIN_PASSCODE || "admin123";
  return passcode === expected;
}

// GET: Fetch leads
export async function GET(request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const leads = await query("SELECT * FROM leads ORDER BY date DESC, id DESC");
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads from database" }, { status: 500 });
  }
}

// POST: Add new lead
export async function POST(request) {
  try {
    const leadData = await request.json();

    if (!leadData.email || !leadData.website) {
      return NextResponse.json({ error: "Email and website are required" }, { status: 400 });
    }

    // Separate quota logic for Free vs Paid Audits
    let isPaidTier = false;
    let allowedQuota = 0;
    const userQuery = await query("SELECT subscription_tier, allowed_quota FROM users WHERE email = ?", [leadData.email.trim()]);
    if (userQuery && userQuery.length > 0) {
      const tier = userQuery[0].subscription_tier;
      allowedQuota = userQuery[0].allowed_quota || 0;
      if (tier === "weekly" || tier === "agency" || tier === "multi") {
        isPaidTier = true;
        if (allowedQuota === 0) {
          if (tier === "weekly") allowedQuota = 3;
          if (tier === "agency") allowedQuota = 25;
          if (tier === "multi") allowedQuota = 100;
        }
      }
    }

    if (isPaidTier) {
      if (tier !== "agency" && tier !== "multi") {
        // Paid user (Weekly): Enforce their specific allowedQuota, ignoring free audits
        const leadCountResult = await query("SELECT COUNT(*) as count FROM leads WHERE email = ? AND packageRequest = 'Paid Audit'", [leadData.email.trim()]);
        const paidAuditsCount = leadCountResult[0]?.count || 0;
        if (paidAuditsCount >= allowedQuota) {
          return NextResponse.json(
            { error: `You have reached your limit of ${allowedQuota} paid audits for your plan.` },
            { status: 403 }
          );
        }
      }
    } else {
      // Free user: Enforce 2 free audits, ignoring any paid audits they might have had before
      const leadCountResult = await query("SELECT COUNT(*) as count FROM leads WHERE email = ? AND packageRequest = 'Free Audit'", [leadData.email.trim()]);
      const freeAuditsCount = leadCountResult[0]?.count || 0;
      if (freeAuditsCount >= 2) {
        return NextResponse.json(
          { error: `You have reached your limit of 2 free audits for your email. Please upgrade to run more audits.` },
          { status: 403 }
        );
      }
    }

    // Enforce database limit
    const countResult = await query("SELECT COUNT(*) as count FROM leads");
    const leadCount = countResult[0]?.count || 0;
    
    if (leadCount >= 50000) {
      return NextResponse.json({ error: "Database limit reached. A maximum of 50000 leads can be stored." }, { status: 403 });
    }

    // Clean URL
    let cleanWebsite = leadData.website.trim().toLowerCase();
    cleanWebsite = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, "");
    cleanWebsite = cleanWebsite.split("/")[0];

    const id = leadData.id || "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const name = leadData.name ? leadData.name.trim() : "Client";
    const phone = leadData.phone ? leadData.phone.trim() : "Not Provided";
    const dateStr = leadData.date || new Date().toISOString();
    const seoScore = leadData.seoScore || 0;
    const grade = leadData.grade || "Pending";
    const status = leadData.status || "New";
    // Mark the audit as Free or Paid to keep quotas separate
    const packageRequest = leadData.packageRequest || (isPaidTier ? "Paid Audit" : "Free Audit");
    const amountPaid = leadData.amountPaid || 0.00;
    const notes = leadData.notes || "";

    await query(
      "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, leadData.email.trim(), phone, cleanWebsite, dateStr, seoScore, grade, status, packageRequest, amountPaid, notes]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to save lead:", error);
    return NextResponse.json({ error: error.message || "Failed to save lead to database" }, { status: 500 });
  }
}

// PUT: Update lead
export async function PUT(request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json({ error: "Lead ID and updates are required" }, { status: 400 });
    }

    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(updates)) {
      if ([ "name", "email", "phone", "website", "seoScore", "grade", "status", "packageRequest", "amountPaid", "notes" ].includes(key)) {
        fields.push(`\`${key}\` = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE leads SET ${fields.join(", ")} WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 500 });
  }
}

// DELETE: Delete lead
export async function DELETE(request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lead ID parameter is required" }, { status: 400 });
    }

    if (id === "all") {
      await query("DELETE FROM leads");
    } else {
      await query("DELETE FROM leads WHERE id = ?", [id]);
    }
    return NextResponse.json({ success: true, message: id === "all" ? "All leads cleared successfully" : "Lead deleted successfully" });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json({ error: error.message || "Failed to delete lead" }, { status: 500 });
  }
}

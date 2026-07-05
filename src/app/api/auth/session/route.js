import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ session: null });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ session: null });
    }

    const { query } = require("@/utils/db");
    const users = await query(
      "SELECT subscription_tier, subscription_status, agency_name, agency_logo_id FROM users WHERE email = ?",
      [decoded.email]
    );

    let dbDetails = {
      subscription_tier: "free",
      subscription_status: "inactive",
      agency_name: null,
      agency_logo_id: null
    };

    if (users && users.length > 0) {
      dbDetails = users[0];
    }

    // Calculate dynamic quota based on Closed Won subscriptions
    const purchasedSubs = await query(
      "SELECT packageRequest, COUNT(*) as count FROM leads WHERE email = ? AND status = 'Closed Won' GROUP BY packageRequest",
      [decoded.email]
    );

    let allowedQuota = 0;
    if (purchasedSubs && purchasedSubs.length > 0) {
      for (const row of purchasedSubs) {
        if (row.packageRequest === "Premium weekly") {
          allowedQuota += row.count * 3;
        } else if (row.packageRequest === "Premium agency") {
          allowedQuota += row.count * 25;
        } else if (row.packageRequest === "Premium multi") {
          allowedQuota += row.count * 100;
        }
      }
    }

    if (allowedQuota === 0) {
      const tier = dbDetails.subscription_tier || "free";
      if (tier === "weekly") allowedQuota = 3;
      if (tier === "agency") allowedQuota = 25;
      if (tier === "multi") allowedQuota = 100;
    }
    
    const freeAuditsCount = await query(
      "SELECT COUNT(*) as count FROM leads WHERE email = ? AND website != 'domain-pending' AND packageRequest = 'Free Audit'",
      [decoded.email]
    );
    const freeAuditsRun = freeAuditsCount[0]?.count || 0;
    
    const paidAuditsCount = await query(
      "SELECT COUNT(*) as count FROM leads WHERE email = ? AND website != 'domain-pending' AND packageRequest = 'Paid Audit'",
      [decoded.email]
    );
    const paidAuditsRun = paidAuditsCount[0]?.count || 0;
    
    return NextResponse.json({ 
      session: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider,
        picture: decoded.picture || null,
        subscription_tier: dbDetails.subscription_tier || "free",
        subscription_status: dbDetails.subscription_status || "inactive",
        agency_name: dbDetails.agency_name,
        agency_logo_id: dbDetails.agency_logo_id,
        allowed_quota: allowedQuota,
        free_audits_allowed: 2,
        free_audits_run: freeAuditsRun,
        paid_audits_run: paidAuditsRun
      }
    });
  } catch (err) {
    console.error("Session GET API error:", err);
    return NextResponse.json({ session: null });
  }
}

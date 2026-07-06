import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let isPaidTier = false;
    let allowedQuota = 0;
    const userQuery = await query("SELECT subscription_tier, allowed_quota FROM users WHERE email = ?", [email.trim()]);
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
      if (tier === "agency" || tier === "multi") {
        // Agency and Multi have unlimited manual audits
        return NextResponse.json({ success: true, isPaidTier });
      }

      const leadCountResult = await query("SELECT COUNT(*) as count FROM leads WHERE email = ? AND packageRequest = 'Paid Audit' AND status != 'Failed'", [email.trim()]);
      const paidAuditsCount = leadCountResult[0]?.count || 0;
      if (paidAuditsCount >= allowedQuota) {
        return NextResponse.json(
          { error: `You have reached your limit of ${allowedQuota} paid audits for your plan.` },
          { status: 403 }
        );
      }
    } else {
      const leadCountResult = await query("SELECT COUNT(*) as count FROM leads WHERE email = ? AND packageRequest = 'Free Audit' AND status != 'Failed'", [email.trim()]);
      const freeAuditsCount = leadCountResult[0]?.count || 0;
      if (freeAuditsCount >= 2) {
        return NextResponse.json(
          { error: `You have reached your limit of 2 free audits for your email. Please upgrade to run more audits.` },
          { status: 403 }
        );
      }
    }

    const countResult = await query("SELECT COUNT(*) as count FROM leads");
    const leadCount = countResult[0]?.count || 0;
    if (leadCount >= 50000) {
      return NextResponse.json({ error: "Database limit reached. A maximum of 50000 leads can be stored." }, { status: 403 });
    }

    return NextResponse.json({ success: true, isPaidTier });
  } catch (error) {
    console.error("Failed to check quota:", error);
    return NextResponse.json({ error: error.message || "Failed to check quota" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_monitored } = await req.json();

    if (!id || typeof is_monitored !== "boolean") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Check user's current monitored count
    if (is_monitored) {
      // First, find allowed quota
      const userRes = await query("SELECT subscription_tier, allowed_quota FROM users WHERE id = ?", [decoded.id]);
      const tier = userRes[0]?.subscription_tier || "free";
      
      let allowedQuota = userRes[0]?.allowed_quota || 0;
      
      // Calculate dynamic quota if needed
      const purchasedSubs = await query(
        "SELECT packageRequest, COUNT(*) as count FROM leads WHERE email = ? AND status = 'Closed Won' GROUP BY packageRequest",
        [decoded.email]
      );

      let dynamicQuota = 0;
      if (purchasedSubs && purchasedSubs.length > 0) {
        for (const row of purchasedSubs) {
          if (row.packageRequest === "Premium weekly") dynamicQuota += row.count * 3;
          else if (row.packageRequest === "Premium agency") dynamicQuota += row.count * 25;
          else if (row.packageRequest === "Premium multi") dynamicQuota += row.count * 100;
        }
      }

      if (dynamicQuota > 0) {
        allowedQuota = dynamicQuota;
      } else if (allowedQuota === 0) {
        if (tier === "weekly") allowedQuota = 3;
        else if (tier === "agency") allowedQuota = 25;
        else if (tier === "multi") allowedQuota = 100;
      }

      if (allowedQuota === 0) {
        return NextResponse.json({ error: "You need a Pro Monitor, Agency, or Enterprise plan to monitor domains." }, { status: 403 });
      }

      const monitoredCountRes = await query(
        "SELECT COUNT(*) as count FROM leads WHERE email = ? AND is_monitored = 1",
        [decoded.email]
      );
      const currentlyMonitored = monitoredCountRes[0]?.count || 0;

      if (currentlyMonitored >= allowedQuota) {
        return NextResponse.json({ error: `You have reached your limit of ${allowedQuota} monitored domains. Unmonitor another domain first.` }, { status: 403 });
      }
    }

    // Update the record
    await query(
      "UPDATE leads SET is_monitored = ? WHERE id = ? AND email = ?",
      [is_monitored ? 1 : 0, id, decoded.email]
    );

    return NextResponse.json({ success: true, is_monitored });

  } catch (error) {
    console.error("Monitor API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

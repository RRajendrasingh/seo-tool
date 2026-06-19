import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

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
    const rows = await query("SELECT * FROM monitored_domains WHERE user_id = ?", [user.id]);
    return NextResponse.json({ monitors: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { domain, cmsPlatform, businessNiche, targetAudience } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "");
    cleanDomain = cleanDomain.split("/")[0];

    // Calculate quota dynamically based on Closed Won subscriptions
    const purchasedSubs = await query(
      "SELECT packageRequest, COUNT(*) as count FROM leads WHERE email = ? AND status = 'Closed Won' GROUP BY packageRequest",
      [user.email]
    );

    let allowedQuota = 0;
    if (purchasedSubs && purchasedSubs.length > 0) {
      for (const row of purchasedSubs) {
        if (row.packageRequest === "Premium weekly") {
          allowedQuota += row.count * 1;
        } else if (row.packageRequest === "Premium agency") {
          allowedQuota += row.count * 5;
        }
      }
    }

    if (allowedQuota === 0) {
      const users = await query("SELECT subscription_tier FROM users WHERE id = ?", [user.id]);
      if (users && users.length > 0) {
        const tier = users[0].subscription_tier;
        if (tier === "weekly") allowedQuota = 1;
        if (tier === "agency") allowedQuota = 5;
      }
    }

    if (allowedQuota === 0) {
      return NextResponse.json({ error: "Weekly Monitoring or Agency plan required to add monitors" }, { status: 403 });
    }

    // Check quota limits
    const existing = await query("SELECT COUNT(*) as count FROM monitored_domains WHERE user_id = ?", [user.id]);
    const currentCount = existing[0].count;
    if (currentCount >= allowedQuota) {
      return NextResponse.json({ error: `Your subscription quota is limited to ${allowedQuota} domains. Please upgrade to add more.` }, { status: 400 });
    }

    const id = "mon_" + Math.random().toString(36).substring(2, 11);
    await query(
      "INSERT INTO monitored_domains (id, user_id, domain, cms_platform, business_niche, target_audience) VALUES (?, ?, ?, ?, ?, ?)",
      [id, user.id, cleanDomain, cmsPlatform || null, businessNiche || null, targetAudience || null]
    );

    // Also seed a mock history curve for this new domain if not already existing
    const historyExists = await query("SELECT COUNT(*) as count FROM audit_history WHERE domain = ?", [cleanDomain]);
    if (historyExists[0].count === 0) {
      const h1 = "h_" + Math.random().toString(36).substring(2, 6);
      const h2 = "h_" + Math.random().toString(36).substring(2, 6);
      await query(
        "INSERT INTO audit_history (id, domain, performance_score, accessibility_score, best_practices_score, seo_score, scanned_at) VALUES (?, ?, 78, 80, 85, 82, ?), (?, ?, 85, 88, 90, 89, ?)",
        [h1, cleanDomain, "2026-06-08 08:00:00", h2, cleanDomain, "2026-06-15 08:00:00"]
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Monitor ID is required" }, { status: 400 });
    }

    await query("DELETE FROM monitored_domains WHERE id = ? AND user_id = ?", [id, user.id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

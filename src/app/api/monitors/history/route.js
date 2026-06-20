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

export async function GET(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
  }

  try {
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "");
    cleanDomain = cleanDomain.split("/")[0];

    // Verify ownership (unless it's the default demo domain)
    if (cleanDomain !== "localhost:3000" && cleanDomain !== "localhost") {
      const ownership = await query(
        "SELECT COUNT(*) as count FROM monitored_domains WHERE user_id = ? AND domain = ?",
        [user.id, cleanDomain]
      );
      if (ownership[0].count === 0) {
        return NextResponse.json({ error: "Forbidden: You do not monitor this domain" }, { status: 403 });
      }
    }

    const history = await query(
      "SELECT * FROM audit_history WHERE domain = ? OR domain = ? OR domain LIKE ? ORDER BY scanned_at ASC LIMIT 10",
      [cleanDomain, `http://${cleanDomain}`, `%${cleanDomain}%`]
    );

    return NextResponse.json({ history });
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
    const data = await req.json();
    const { domain, performance_score, seo_score, accessibility_score, best_practices_score, full_report_json, avg_score, grade } = data;
    
    if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });

    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

    const id = "h_" + Math.random().toString(36).substring(2, 10);
    const scannedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await query(
      "INSERT INTO audit_history (id, domain, performance_score, accessibility_score, best_practices_score, seo_score, scanned_at, avg_score, grade, full_report_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, cleanDomain, performance_score || 0, accessibility_score || 0, best_practices_score || 0, seo_score || 0, scannedAt, avg_score || 0, grade || "F", full_report_json ? JSON.stringify(full_report_json) : null]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to save audit history:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

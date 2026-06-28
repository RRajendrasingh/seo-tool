import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
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
    const { leadId, reportJson, seoScore, grade } = await request.json();
    if (!leadId || !reportJson) {
      return NextResponse.json({ error: "leadId and reportJson are required" }, { status: 400 });
    }
    const rows = await query(
      "SELECT id FROM leads WHERE id = ? AND email = ?",
      [leadId, decoded.email]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Lead not found or access denied" }, { status: 403 });
    }
    const reportString = typeof reportJson === "string" ? reportJson : JSON.stringify(reportJson);
    // Update report snapshot + real score + grade so dashboard history is accurate
    await query(
      "UPDATE leads SET report_data = ?, seoScore = ?, grade = ? WHERE id = ? AND email = ?",
      [reportString, seoScore || 0, grade || "Pending", leadId, decoded.email]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save report data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

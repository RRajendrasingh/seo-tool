import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
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
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
    }
    const rows = await query(
      "SELECT id, website, date, seoScore, grade, packageRequest, report_data FROM leads WHERE id = ? AND email = ?",
      [id, decoded.email]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Audit not found or access denied." },
        { status: 403 }
      );
    }
    const lead = rows[0];
    if (lead.report_data) {
      try {
        const reportData = typeof lead.report_data === "string"
          ? JSON.parse(lead.report_data)
          : lead.report_data;
        return NextResponse.json({
          found: true,
          report: reportData,
          meta: { website: lead.website, date: lead.date, seoScore: lead.seoScore, grade: lead.grade, packageRequest: lead.packageRequest }
        });
      } catch (parseError) {
        console.error("Failed to parse stored report_data:", parseError);
      }
    }
    return NextResponse.json({
      found: false,
      meta: { website: lead.website, date: lead.date, seoScore: lead.seoScore, grade: lead.grade, packageRequest: lead.packageRequest }
    });
  } catch (error) {
    console.error("Failed to retrieve audit report:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

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
    const { leadId, reportJson, seoScore, grade, packageRequest } = await request.json();
    if (!leadId || !reportJson) {
      return NextResponse.json({ error: "leadId and reportJson are required" }, { status: 400 });
    }
    let rows = await query(
      "SELECT id, packageRequest FROM leads WHERE id = ? AND email = ?",
      [leadId, decoded.email]
    );
    
    // If local leadId fails (e.g., guest user upgraded via webhook which created a new lead), fallback to matching website
    if (!rows || rows.length === 0) {
      if (reportJson && reportJson.url) {
        let cleanUrl = reportJson.url.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
        rows = await query(
          "SELECT id, packageRequest FROM leads WHERE email = ? AND website LIKE ? ORDER BY date DESC LIMIT 1",
          [decoded.email, `%${cleanUrl}%`]
        );
      }
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Lead not found or access denied" }, { status: 403 });
    }
    
    // Use the verified ID from the database
    const verifiedLeadId = rows[0].id;
    const currentPackage = rows[0].packageRequest;
    
    // Only upgrade the tag, don't downgrade it
    const newPackageRequest = (packageRequest === "Premium Report" || currentPackage === "Premium Report") ? "Premium Report" : currentPackage;

    const reportString = typeof reportJson === "string" ? reportJson : JSON.stringify(reportJson);
    // Update report snapshot + real score + grade so dashboard history is accurate
    await query(
      "UPDATE leads SET report_data = ?, seoScore = ?, grade = ?, packageRequest = ? WHERE id = ? AND email = ?",
      [reportString, seoScore || 0, grade || "Pending", newPackageRequest, verifiedLeadId, decoded.email]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save report data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

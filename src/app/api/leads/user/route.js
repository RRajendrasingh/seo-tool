import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const rows = await query(
      "SELECT id, website, date, seoScore, grade, packageRequest FROM leads WHERE email = ? ORDER BY date DESC, id DESC",
      [decoded.email]
    );

    return NextResponse.json({ audits: rows });
  } catch (error) {
    console.error("Failed to fetch user audits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

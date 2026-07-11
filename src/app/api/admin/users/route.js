import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function verifyAdmin(request) {
  const passcode = request.headers.get("x-admin-passcode");
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  return passcode === expected;
}

export async function GET(request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Select core columns (excluding password_hash for security)
    const users = await query(
      "SELECT id, email, full_name, auth_provider, email_verified, subscription_tier, subscription_status, allowed_quota, created_at FROM users ORDER BY created_at DESC"
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users for admin console:", error);
    return NextResponse.json({ error: "Failed to fetch users from database" }, { status: 500 });
  }
}

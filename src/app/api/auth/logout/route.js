import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logout API error:", err);
    return NextResponse.json({ error: "Failed to log out cleanly." }, { status: 500 });
  }
}

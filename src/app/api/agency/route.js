import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { agencyName, logoData, mimeType } = await req.json();

    let logoId = null;
    if (logoData) {
      logoId = "img_" + Math.random().toString(36).substring(2, 11);
      // Clean up base64 header if present (e.g. data:image/png;base64,...)
      const cleanData = logoData.replace(/^data:image\/\w+;base64,/, "");
      
      await query(
        "INSERT INTO uploads (id, data, mimeType) VALUES (?, ?, ?)",
        [logoId, cleanData, mimeType || "image/png"]
      );
    }

    // Update users table
    if (logoId) {
      await query(
        "UPDATE users SET agency_name = ?, agency_logo_id = ? WHERE id = ?",
        [agencyName || "My Agency", logoId, user.id]
      );
    } else {
      await query(
        "UPDATE users SET agency_name = ? WHERE id = ?",
        [agencyName || "My Agency", user.id]
      );
    }

    return NextResponse.json({ success: true, logoId });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await query("SELECT agency_name, agency_logo_id FROM users WHERE id = ?", [user.id]);
    if (!users || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const agencyName = users[0].agency_name || "";
    const logoId = users[0].agency_logo_id;
    let logoData = null;

    if (logoId) {
      const uploads = await query("SELECT data, mimeType FROM uploads WHERE id = ?", [logoId]);
      if (uploads && uploads.length > 0) {
        logoData = `data:${uploads[0].mimeType};base64,${uploads[0].data}`;
      }
    }

    return NextResponse.json({ agencyName, logoData });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

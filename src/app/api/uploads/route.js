import { query } from "@/utils/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

// BUG H-7 FIX: Server-side MIME type whitelist — never trust client-supplied type
const ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml"];

export async function POST(request) {
  // BUG C-4 FIX: Require authentication — anonymous users cannot write to DB
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, mimeType } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // Clean base64 string prefix if present (e.g. "data:image/webp;base64,")
    let base64Data = data;
    let mime = mimeType || "image/webp";

    if (data.startsWith("data:")) {
      const match = data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mime = match[1];
        base64Data = match[2];
      }
    }

    // BUG H-7 FIX: Validate MIME type server-side — reject non-image types
    if (!ALLOWED_MIME_TYPES.includes(mime.toLowerCase())) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Generate unique ID
    const imgId = "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    // Save to database
    await query(
      "INSERT INTO uploads (id, data, mimeType) VALUES (?, ?, ?)",
      [imgId, base64Data, mime]
    );

    // Determine clean file extension based on mimeType
    let ext = "webp";
    if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
    else if (mime.includes("png")) ext = "png";
    else if (mime.includes("gif")) ext = "gif";
    else if (mime.includes("svg")) ext = "svg";

    const imageUrl = `/api/uploads/${imgId}.${ext}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ error: "Failed to save image. Please try again." }, { status: 500 });
  }
}


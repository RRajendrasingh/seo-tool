import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
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
    return NextResponse.json({ error: error.message || "Failed to save image to database" }, { status: 500 });
  }
}

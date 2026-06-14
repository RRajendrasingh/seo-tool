import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response("Image ID is required", { status: 400 });
    }

    // Strip extension if present (e.g., img_xxxxx.webp -> img_xxxxx)
    const cleanId = id.split(".")[0];

    // Fetch from database
    const rows = await query("SELECT data, mimeType FROM uploads WHERE id = ?", [cleanId]);

    if (!rows || rows.length === 0) {
      return new Response("Image not found", { status: 404 });
    }

    const { data, mimeType } = rows[0];

    // Convert base64 data to binary buffer
    const imageBuffer = Buffer.from(data, "base64");

    // Return binary response with cache headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": mimeType || "image/webp",
        "Content-Length": imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to serve image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

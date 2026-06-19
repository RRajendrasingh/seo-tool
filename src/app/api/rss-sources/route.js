import { NextResponse } from "next/server";
import { query } from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sources = await query("SELECT * FROM rss_sources ORDER BY created_at DESC");
    return NextResponse.json({ success: true, sources: sources || [] });
  } catch (error) {
    console.error("GET RSS Sources error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, url, category, author } = await req.json();
    if (!name || !url) return NextResponse.json({ success: false, error: "Name and URL required" }, { status: 400 });

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await query(
      "INSERT INTO rss_sources (id, name, url, category, author) VALUES (?, ?, ?, ?, ?)",
      [id, name, url, category || "", author || "System"]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST RSS Source error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await query("DELETE FROM rss_sources WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE RSS Source error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, name, url, category, author } = await req.json();
    if (!id || !name || !url) return NextResponse.json({ success: false, error: "ID, Name, and URL required" }, { status: 400 });

    await query(
      "UPDATE rss_sources SET name=?, url=?, category=?, author=? WHERE id=?",
      [name, url, category || "", author || "System", id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT RSS Source error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

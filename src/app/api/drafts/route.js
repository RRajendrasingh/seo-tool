import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/drafts — Returns all draft posts for admin review
export async function GET() {
  try {
    const drafts = await query(
      "SELECT * FROM posts WHERE status = 'draft' ORDER BY date DESC"
    );
    return NextResponse.json(
      drafts.map((d) => ({ ...d, featured: !!d.featured }))
    );
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
  }
}

// POST /api/drafts — Publish or discard a draft
// Body: { id: "draft_xxx", action: "publish" | "discard" }
export async function POST(request) {
  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: "id and action required" }, { status: 400 });
    }

    const post = await query("SELECT id, featured FROM posts WHERE id = ?", [id]);
    if (!post || post.length === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (action === "publish") {
      await query("UPDATE posts SET status = 'published' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, message: "Draft published successfully" });
    }

    if (action === "discard") {
      await query("DELETE FROM posts WHERE id = ? AND status = 'draft'", [id]);
      return NextResponse.json({ success: true, message: "Draft discarded" });
    }

    return NextResponse.json({ error: "Invalid action. Use publish or discard." }, { status: 400 });
  } catch (error) {
    console.error("Draft action failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

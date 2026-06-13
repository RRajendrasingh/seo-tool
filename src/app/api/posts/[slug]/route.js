import { query } from "@/utils/db";
import { NextResponse } from "next/server";

// GET: Fetch single post
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const posts = await query("SELECT * FROM posts WHERE slug = ?", [slug]);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = {
      ...posts[0],
      featured: !!posts[0].featured
    };

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json({ error: "Failed to fetch post details" }, { status: 500 });
  }
}

// DELETE: Delete post
export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;

    let wasFeatured = false;
    
    // Find post to see if it was featured
    const identifier = slug.startsWith("post_") ? "id" : "slug";
    const postCheck = await query(`SELECT featured FROM posts WHERE ${identifier} = ?`, [slug]);
    
    if (postCheck && postCheck[0]) {
      wasFeatured = !!postCheck[0].featured;
    }

    await query(`DELETE FROM posts WHERE ${identifier} = ?`, [slug]);

    // Self-healing: if we deleted a featured post, make the next newest post featured
    if (wasFeatured) {
      const nextPost = await query("SELECT id FROM posts ORDER BY id DESC LIMIT 1");
      if (nextPost && nextPost[0]) {
        await query("UPDATE posts SET featured = 1 WHERE id = ?", [nextPost[0].id]);
      }
    }

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 500 });
  }
}

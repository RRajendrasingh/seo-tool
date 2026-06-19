import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch posts (supports ?status=draft for admin, defaults to published only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // 'draft', 'published', or null (all published)

    let posts;
    if (statusFilter === "draft") {
      posts = await query("SELECT * FROM posts WHERE status = 'draft' ORDER BY date DESC");
    } else if (statusFilter === "all") {
      posts = await query("SELECT * FROM posts ORDER BY date DESC");
    } else {
      // Default: only published posts for the public news page
      posts = await query("SELECT * FROM posts WHERE status = 'published' OR status IS NULL ORDER BY date DESC");
    }

    const formattedPosts = posts.map(post => ({
      ...post,
      featured: !!post.featured,
      status: post.status || "published",
    }));

    return NextResponse.json(formattedPosts, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59" },
    });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts from database" }, { status: 500 });
  }
}

// POST: Add new post
export async function POST(request) {
  try {
    const postData = await request.json();

    if (!postData.title || !postData.desc) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const id = "post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const dateStr = postData.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const featured = postData.featured ? 1 : 0;

    // Reset other featured flags if new post is featured
    if (featured === 1) {
      await query("UPDATE posts SET featured = 0");
    }

    await query(
      "INSERT INTO posts (id, slug, title, `desc`, content, category, date, readTime, author, featuredImage, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        postData.slug,
        postData.title,
        postData.desc,
        postData.content || "",
        postData.category || "Core Updates",
        dateStr,
        postData.readTime || "1 min read",
        postData.author || "Martin",
        postData.featuredImage || "",
        featured,
        postData.status || "published",
      ]
    );

    return NextResponse.json({ success: true, id, slug: postData.slug });
  } catch (error) {
    console.error("Failed to save post:", error);
    return NextResponse.json({ error: error.message || "Failed to save post to database" }, { status: 500 });
  }
}

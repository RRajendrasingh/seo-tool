import { query } from "@/utils/db";
import { NextResponse } from "next/server";

// GET: Fetch all posts
export async function GET() {
  try {
    const posts = await query("SELECT * FROM posts");
    
    // Sort posts by date descending (latest first)
    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Map database featured boolean/integer 1/0 to javascript boolean true/false
    const formattedPosts = sortedPosts.map(post => ({
      ...post,
      featured: !!post.featured
    }));

    return NextResponse.json(formattedPosts, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59"
      }
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
      "INSERT INTO posts (id, slug, title, `desc`, content, category, date, readTime, author, featuredImage, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        featured
      ]
    );

    return NextResponse.json({ success: true, id, slug: postData.slug });
  } catch (error) {
    console.error("Failed to save post:", error);
    return NextResponse.json({ error: error.message || "Failed to save post to database" }, { status: 500 });
  }
}

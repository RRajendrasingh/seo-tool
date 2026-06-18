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

// PUT: Update post
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const postData = await request.json();

    if (!postData.title || !postData.desc) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const identifier = slug.startsWith("post_") ? "id" : "slug";
    
    // Check if the post exists
    const checkPost = await query(`SELECT id, featured FROM posts WHERE ${identifier} = ?`, [slug]);
    if (!checkPost || checkPost.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    const dbPostId = checkPost[0].id;
    const featured = postData.featured ? 1 : 0;

    // Safe-guard unique slug constraint
    if (postData.slug) {
      const slugCheck = await query("SELECT id FROM posts WHERE slug = ? AND id != ?", [postData.slug, dbPostId]);
      if (slugCheck && slugCheck.length > 0) {
        return NextResponse.json({ error: "An article with this URL slug already exists. Please choose a different slug." }, { status: 400 });
      }
    }

    // Reset other featured flags if this post is featured
    if (featured === 1) {
      await query("UPDATE posts SET featured = 0 WHERE id != ?", [dbPostId]);
    }

    const dateStr = postData.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    await query(
      "UPDATE posts SET slug = ?, title = ?, `desc` = ?, content = ?, category = ?, date = ?, readTime = ?, author = ?, featuredImage = ?, featured = ?, status = ? WHERE id = ?",
      [
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
        dbPostId
      ]
    );

    return NextResponse.json({ success: true, id: dbPostId, slug: postData.slug });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ error: error.message || "Failed to update post in database" }, { status: 500 });
  }
}


export const dynamic = "force-dynamic";

import { query } from "@/utils/db";
import { DEFAULT_POSTS } from "@/utils/postsStore";
import PostDetailClient from "./PostDetailClient";

// Pre-seed static parameters for default posts during static builds
export async function generateStaticParams() {
  return [
    { slug: "google-core-update-2026" },
    { slug: "ai-search-overviews" },
    { slug: "multi-location-local-seo" },
    { slug: "static-site-core-web-vitals" },
    { slug: "google-business-profile-proximity" },
  ];
}

// Generate dynamic metadata for search engines and social platforms
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  let post = null;
  try {
    const posts = await query("SELECT * FROM posts WHERE slug = ?", [slug]);
    if (posts && posts.length > 0) {
      post = posts[0];
    }
  } catch (e) {
    console.error("generateMetadata: Database fetch failed:", e);
  }

  if (!post) {
    post = DEFAULT_POSTS.find((p) => p.slug === slug) || null;
  }

  if (post) {
    return {
      title: `${post.title} | SEOIntellect News`,
      description: post.desc,
      openGraph: {
        title: post.title,
        description: post.desc,
        images: [
          {
            url: post.featuredImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
            width: 1200,
            height: 720,
            alt: post.title,
          },
        ],
      },
    };
  }
  return {
    title: "News Update | SEOIntellect",
    description: "Stay updated with search engine ranking intelligence and local SEO blueprints.",
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  
  let initialPost = null;
  try {
    const posts = await query("SELECT * FROM posts WHERE slug = ?", [slug]);
    if (posts && posts.length > 0) {
      initialPost = {
        ...posts[0],
        featured: !!posts[0].featured
      };
    }
  } catch (error) {
    console.error("Failed to load post SSR details:", error);
    // fallback
    const fb = DEFAULT_POSTS.find((p) => p.slug === slug);
    if (fb) initialPost = fb;
  }

  return <PostDetailClient slug={slug} initialPost={initialPost} />;
}

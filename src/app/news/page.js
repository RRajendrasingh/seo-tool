export const dynamic = "force-dynamic";

import { query } from "@/utils/db";
import NewsClient from "./NewsClient";

export const metadata = {
  title: "Search Intelligence & Market News | SEOIntellect",
  description: "Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.",
  openGraph: {
    title: "Search Intelligence & Market News | SEOIntellect",
    description: "Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
        width: 1200,
        height: 720,
        alt: "SEOIntellect Search Intelligence & Market News",
      },
    ],
  },
};

export default async function NewsPage() {
  let initialPosts = [];
  try {
    const posts = await query("SELECT * FROM posts");
    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    initialPosts = sortedPosts.map(post => ({
      ...post,
      featured: !!post.featured
    }));
  } catch (error) {
    console.error("NewsPage SSR failed to load posts:", error);
    // fallback to pre-seeded list
    const { DEFAULT_POSTS } = require("@/utils/postsStore");
    // Sort default posts too
    initialPosts = [...DEFAULT_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return <NewsClient initialPosts={initialPosts} />;
}

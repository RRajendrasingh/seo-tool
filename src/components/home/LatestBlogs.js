import Link from "next/link";
import { query } from "@/utils/db";
import LatestBlogsGrid from "./LatestBlogsGrid";

export default async function LatestBlogs() {
  let latestPosts = [];

  try {
    const posts = await query("SELECT * FROM posts WHERE status = 'published' OR status IS NULL");
    
    // Sort by date descending
    const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Grab the top 3
    latestPosts = sortedPosts.slice(0, 3);
  } catch (error) {
    console.error("LatestBlogs SSR failed to load posts:", error);
    // Fallback if DB is down or connection fails during static export
    const { DEFAULT_POSTS } = require("@/utils/postsStore");
    const sortedFallback = [...DEFAULT_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    latestPosts = sortedFallback.slice(0, 3);
  }

  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <section className="border-t border-slate-900 bg-slate-950 py-24 sm:py-32" aria-labelledby="latest-insights-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
          <span className="inline-block text-xs uppercase tracking-widest text-cyan-400 font-extrabold bg-cyan-950/30 px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-subtle">
            Search Intelligence
          </span>
          <h2 id="latest-insights-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-center">
            Latest Market Insights
          </h2>
          <p className="text-slate-400 text-center max-w-lg mx-auto text-sm">
            Actionable SEO playbooks, algorithm updates, and technical web development strategies from our engineering team.
          </p>
        </div>

        <LatestBlogsGrid posts={latestPosts} />

        <div className="mt-12 text-center">
          <Link
            href="/news/"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900/40 border border-zinc-800 px-6 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]"
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  );
}

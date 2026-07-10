import Link from "next/link";
import Image from "next/image";
import { query } from "@/utils/db";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link 
              key={post.id}
              href={`/news/${post.slug}/`}
              className="group flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                <Image
                  src={post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-md bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-cyan-400 ring-1 ring-inset ring-cyan-500/20 shadow-lg">
                    {post.category || "SEO Strategies"}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 relative">
                {/* Subtle Glow inside card */}
                <div className="absolute top-0 right-0 -z-10 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold leading-tight text-white group-hover:text-cyan-300 transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                    {post.desc}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between text-[11px] font-medium text-zinc-500 border-t border-zinc-800/60 pt-4">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readTime || "3 min read"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewsClient({ initialPosts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPosts(data))
      .catch((e) => console.error(e));
  }, []);

  // Derive categories dynamically from posts list
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))];

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured || activeCategory !== "All");

  return (
    <div className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/3 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Search Intelligence &amp; Market News
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400">
          Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.
        </p>
      </div>

      {/* Categories Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 rounded-xl bg-zinc-900/60 p-1.5 border border-zinc-850 backdrop-blur-md w-max mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/10"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-10 sm:space-y-12">
        {/* Featured Post Card (Only shown when category is 'All') */}
        {activeCategory === "All" && featuredPost && (
          <Link
            href={`/news/${featuredPost.slug}/`}
            className="cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch group overflow-hidden block"
          >
            {/* Featured Image */}
            <div className="lg:col-span-5 h-64 lg:h-auto relative overflow-hidden">
              {featuredPost.featuredImage ? (
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-zinc-950 border-r border-zinc-850/80 flex items-center justify-center text-7xl select-none">
                  📰
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-zinc-900/80" />
              <span className="absolute top-4 left-4 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                ⭐ Featured
              </span>
            </div>

            {/* Info */}
            <div className="lg:col-span-7 p-8 lg:p-10 space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                <span className="rounded-full bg-violet-500/10 px-3 py-1 font-semibold text-violet-300">
                  {featuredPost.category}
                </span>
                <span>{featuredPost.date}</span>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="text-xl font-bold text-white sm:text-2xl group-hover:text-violet-400 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{featuredPost.desc}</p>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-555">By {featuredPost.author}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 group-hover:text-violet-300">
                  Read Article
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.id || post.title}
              href={`/news/${post.slug}/`}
              className="cursor-pointer rounded-2xl border border-zinc-880 bg-zinc-900/30 flex flex-col justify-between hover:border-zinc-700 transition-all group overflow-hidden block"
            >
              <div className="space-y-4">
                {/* Card Image */}
                <div className="h-44 relative overflow-hidden">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-950 border-b border-zinc-850/80 flex items-center justify-center text-5xl select-none group-hover:scale-[1.01] transition-transform">
                      📰
                    </div>
                  )}
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-zinc-900/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700/50">
                    {post.category}
                  </span>
                </div>

                <div className="px-6 space-y-2">
                  <div className="flex items-center gap-3 text-xxs text-zinc-555">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                    {post.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 mt-4 mb-5 border-t border-zinc-850 pt-4 flex items-center justify-between text-xxs">
                <span className="text-zinc-555">By {post.author}</span>
                <span className="inline-flex items-center gap-1 text-violet-400 group-hover:text-violet-300 font-semibold">
                  Read
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup Card */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-3xl bg-zinc-900/40 border border-zinc-850 p-8 md:p-12 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
          <div className="space-y-2 md:max-w-sm">
            <h3 className="text-lg font-bold text-white">Subscribe to SEOIntellect</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Get bi-weekly briefings on Google algorithm releases, ranking blueprints, and custom static web developer frameworks directly in your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing!");
            }}
            className="flex w-full md:w-auto flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewsClient({ initialPosts = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPosts(data))
      .catch((e) => console.error(e));
  }, []);

  // Derive categories dynamically from posts list
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = searchQuery ? null : posts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => searchQuery || !p.featured || activeCategory !== "All");

  return (
    <div className="bg-zinc-950 min-h-screen py-8 sm:py-16 lg:py-24 relative isolate overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/3 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Search Intelligence &amp; Market News
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400">
          Stay informed with the latest search engine updates, local SEO playbooks, and development strategies.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-md px-4 mt-6 sm:mt-8">
        <div className="flex items-center gap-2.5 w-full bg-zinc-900/40 border border-zinc-800 focus-within:border-violet-500 rounded-xl py-3 px-3.5 backdrop-blur-md transition-all">
          <svg
            className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search articles by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: 'transparent' }}
            className="w-full bg-transparent border-0 p-0 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] text-zinc-400 hover:text-white font-bold px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Popular Locations Links Bar */}
      <div className="mx-auto max-w-md px-4 mt-3 text-center">
        <p className="text-[10px] text-zinc-500 leading-normal">
          Popular SEO Markets:{" "}
          <Link href="/seo-services/new-york/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">New York</Link> •{" "}
          <Link href="/seo-services/los-angeles/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Los Angeles</Link> •{" "}
          <Link href="/seo-services/chicago/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Chicago</Link> •{" "}
          <Link href="/seo-services/houston/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Houston</Link> •{" "}
          <Link href="/seo-services/austin/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Austin</Link> •{" "}
          <Link href="/seo-services/" className="text-violet-400 hover:text-violet-300 font-bold underline transition-colors">All Locations →</Link>
        </p>
      </div>

      {/* Categories Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="overflow-x-auto pb-2 no-scrollbar">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 space-y-8 sm:space-y-12">
        {/* Featured Post Card (Only shown when category is 'All') */}
        {activeCategory === "All" && featuredPost && (
          <Link
            href={`/news/${featuredPost.slug}/`}
            className="cursor-pointer rounded-3xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch group overflow-hidden block"
          >
            {/* Featured Image */}
            <div className="lg:col-span-5 h-40 sm:h-56 lg:h-auto relative overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-zinc-900/80" />
              <span className="absolute top-4 left-4 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                ⭐ Featured
              </span>
            </div>

            {/* Info */}
            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-2.5 sm:space-y-4 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xxs sm:text-xs font-medium text-zinc-500">
                <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 font-semibold text-violet-300">
                  {featuredPost.category}
                </span>
                <span>{featuredPost.date}</span>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2 lg:line-clamp-none">
                {featuredPost.title}
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">{featuredPost.desc}</p>
              <div className="pt-2 sm:pt-4 flex items-center justify-between">
                <span className="text-xxs sm:text-xs text-zinc-555">By {featuredPost.author}</span>
                <span className="inline-flex items-center gap-1.5 text-xxs sm:text-xs font-bold text-violet-400 group-hover:text-violet-300">
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
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id || post.title}
                href={`/news/${post.slug}/`}
                className="cursor-pointer rounded-2xl border border-zinc-880 bg-zinc-900/30 flex flex-col justify-between hover:border-zinc-700 transition-all group overflow-hidden block"
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Card Image */}
                  <div className="h-32 sm:h-44 relative overflow-hidden border-b border-zinc-850/30">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-5xl select-none group-hover:scale-[1.01] transition-transform">
                        📰
                      </div>
                    )}
                    {/* Gradient overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
                    <span
                      style={{ color: '#ffffff' }}
                      className="absolute bottom-3 left-3 rounded-full bg-black/75 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold border border-white/10"
                    >
                      {post.category}
                    </span>
                  </div>

                  <div className="px-4 sm:px-6 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-555">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {post.desc}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-6 mt-3 mb-4 border-t border-zinc-850 pt-3 flex items-center justify-between text-xxs">
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
        ) : (
          <div className="text-center py-16 border border-zinc-850/40 bg-zinc-900/10 rounded-3xl max-w-md mx-auto backdrop-blur-md">
            <span className="text-4xl block mb-4">🔍</span>
            <h3 className="text-sm font-semibold text-white">No articles found</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed px-6">
              We couldn&apos;t find any articles matching &quot;{searchQuery}&quot; in this category. Try adjusting your query or resetting the filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xxs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}
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

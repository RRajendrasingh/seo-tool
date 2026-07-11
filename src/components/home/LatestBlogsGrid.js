"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LatestBlogsGrid({ posts }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update dot indicator on scroll
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth;
    const gap = 16; // gap-4 = 16px
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollToIndex = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth;
    const gap = 16;
    el.scrollTo({ left: i * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <div>
      {/* ── Mobile Layout: Horizontal Scroll Carousel ───────────── */}
      <div className="block md:hidden">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-label="Latest insights carousel"
        >
          {posts.map((post) => (
            <article
              key={post.id || post.slug}
              className="flex-none w-[82vw] snap-start"
            >
              <Link 
                href={`/news/${post.slug}/`}
                className="group flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 overflow-hidden h-full"
              >
                <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"}
                    alt={post.title}
                    fill
                    sizes="82vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-cyan-400 ring-1 ring-inset ring-cyan-500/20 shadow-lg">
                      {post.category || "SEO Strategies"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 relative">
                  <div className="absolute top-0 right-0 -z-10 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold leading-tight text-white group-hover:text-cyan-300 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {post.desc}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-zinc-500 border-t border-zinc-800/60 pt-3">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readTime || "3 min read"}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Carousel position">
          {posts.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-550 ${
                i === activeIndex
                  ? "w-5 h-2 bg-cyan-400"
                  : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop Layout: Standard 3-col Grid ─────────────────── */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link 
            key={post.id || post.slug}
            href={`/news/${post.slug}/`}
            className="group flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 overflow-hidden"
          >
            <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
              <Image
                src={post.featuredImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-md bg-zinc-950/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-cyan-400 ring-1 ring-inset ring-cyan-500/20 shadow-lg">
                  {post.category || "SEO Strategies"}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 relative">
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
    </div>
  );
}

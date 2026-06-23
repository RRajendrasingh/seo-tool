"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PostDetailClient({ slug, initialPost }) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (!initialPost) {
      fetch(`/api/posts/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setPost(data))
        .catch((e) => console.error(e));
    }
  }, [slug, initialPost]);

  // Dynamically update document title and openGraph image tags on mount for client navigation
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | SEOIntellect News`;

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", post.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", post.desc);

      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", post.featuredImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80");
    }
  }, [post]);



  if (!post) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-400 text-sm py-16 sm:py-24">
        <div className="max-w-md text-center space-y-6 px-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-xl font-bold text-white">Article Not Found</h1>
          <p className="text-zinc-550 leading-relaxed text-xs">
            The news article you are looking for might have been deleted by the administrator, or the URL path is invalid.
          </p>
          <Link
            href="/news/"
            className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            ← Back to News Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12 sm:py-20 relative isolate text-left overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/3 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/news/"
            className="text-xs font-semibold text-zinc-500 hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News Feed
          </Link>
        </div>

        {/* Hero Cover Image */}
        {post.featuredImage ? (
          <div className="relative overflow-hidden rounded-3xl border border-zinc-880 mb-8 bg-zinc-900/10">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto block rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent rounded-3xl" />
            <span className="absolute top-5 left-5 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              {post.category}
            </span>
          </div>
        ) : (
          <div className="relative h-44 bg-zinc-900 flex items-center justify-center text-7xl select-none border border-zinc-880 rounded-3xl mb-8">
            📰
            <span className="absolute top-5 left-5 rounded-full bg-violet-600/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              {post.category}
            </span>
          </div>
        )}

        {/* Article Container */}
        <div className="space-y-6">
          {/* Metadata info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-300">{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          {/* Short Description Block */}
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed border-l-2 border-violet-600 pl-4 italic bg-zinc-900/10 py-1">
            {post.desc}
          </p>

          {/* Rich HTML body */}
          {post.content ? (
            <div
              className="prose prose-invert prose-sm max-w-none pt-4
                prose-headings:text-white prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-900 prose-h2:pb-2
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-zinc-200
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-zinc-300
                prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-p:mb-5
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-em:text-zinc-400
                prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-ul:list-disc prose-ul:mb-5
                prose-li:text-sm sm:prose-li:text-base prose-li:my-1.5
                prose-blockquote:border-violet-600 prose-blockquote:text-zinc-400 prose-blockquote:not-italic prose-blockquote:bg-zinc-900/20 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-code:text-violet-300 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:p-4
                prose-table:text-xs sm:prose-table:text-sm prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:border-zinc-700 prose-th:text-zinc-300 prose-th:p-2.5 prose-th:bg-zinc-900
                prose-td:border-zinc-800 prose-td:text-zinc-400 prose-td:p-2.5"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-zinc-550 text-sm">No additional content body is available for this article.</p>
          )}

          {/* Bottom Navigation controls */}
          <div className="border-t border-zinc-850 pt-8 mt-12 flex items-center justify-between">
            <Link
              href="/news/"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to News Feed
            </Link>
            <div className="flex items-center gap-3 text-[10px] text-zinc-550">
              <span className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-880">{post.category}</span>
              <span className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-880">{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

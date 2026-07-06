"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function NewsInteractiveFilter({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentCategory = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(currentSearch);

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== currentSearch) {
        router.push(`${pathname}?${createQueryString("search", localSearch)}`, { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, currentSearch, pathname, router, createQueryString]);

  const handleCategoryClick = (cat) => {
    router.push(`${pathname}?${createQueryString("category", cat === "All" ? "" : cat)}`, { scroll: false });
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mx-auto max-w-md px-4 mt-6 sm:mt-8">
        <div className="flex items-center gap-2.5 w-full bg-zinc-900/40 border border-zinc-800 focus-within:border-violet-500 rounded-xl py-3 px-3.5 backdrop-blur-md transition-all">
          <svg
            className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <label htmlFor="news-search" className="sr-only">Search articles</label>
          <input
            id="news-search"
            type="text"
            placeholder="Search articles by title, description..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-transparent border-0 p-0 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-0"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              aria-label="Clear search"
              className="text-[10px] text-zinc-400 hover:text-white font-bold px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="overflow-x-auto pb-2 no-scrollbar" role="tablist" aria-label="News Categories">
          <div className="flex gap-2 rounded-xl bg-zinc-900/60 p-1.5 border border-zinc-850 backdrop-blur-md w-max mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={currentCategory === cat}
                onClick={() => handleCategoryClick(cat)}
                className={`rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  currentCategory === cat
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/10"
                    : "text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

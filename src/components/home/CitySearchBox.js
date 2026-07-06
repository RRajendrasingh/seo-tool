"use client";

import { useState } from "react";
import Link from "next/link";
import { citiesDb } from "@/data/cities";

export default function CitySearchBox() {
  const [citySearch, setCitySearch] = useState("");

  const defaultCities = [
    { name: "New York", slug: "new-york", abbr: "NY", color: "group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]" },
    { name: "Los Angeles", slug: "los-angeles", abbr: "LA", color: "group-hover:border-orange-500/30 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]" },
    { name: "Chicago", slug: "chicago", abbr: "CH", color: "group-hover:border-sky-500/30 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]" },
    { name: "Houston", slug: "houston", abbr: "HO", color: "group-hover:border-rose-500/30 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]" },
    { name: "Phoenix", slug: "phoenix", abbr: "PH", color: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]" },
    { name: "San Diego", slug: "san-diego", abbr: "SD", color: "group-hover:border-teal-500/30 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]" },
    { name: "San Jose", slug: "san-jose", abbr: "SJ", color: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]" },
    { name: "Austin", slug: "austin", abbr: "AU", color: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]" }
  ];

  const displayedCities = citySearch.trim() === "" 
    ? defaultCities 
    : Object.entries(citiesDb)
        .filter(([slug, data]) => data.name.toLowerCase().includes(citySearch.toLowerCase()))
        .slice(0, 8)
        .map(([slug, data]) => ({
          name: data.name,
          slug: slug,
          abbr: data.name.substring(0, 2).toUpperCase(),
          color: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
        }));

  return (
    <>
      <div className="max-w-md mx-auto mt-8 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <label htmlFor="city-search" className="sr-only">Search your city</label>
        <input
          id="city-search"
          type="text"
          placeholder="Search your city..."
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="w-full bg-zinc-900/40 border border-zinc-800 rounded-full py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all backdrop-blur-md"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto mt-8">
        {displayedCities.map((city) => (
          <Link
            key={city.slug}
            href={`/seo-services/${city.slug}/`}
            className={`group rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-500 relative overflow-hidden h-40 sm:h-44 hover:-translate-y-1 ${city.color}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-zinc-700/50 bg-zinc-900/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] flex items-center justify-center group-hover:border-zinc-500/50 transition-colors duration-500">
                <span className="text-sm sm:text-base font-mono font-medium tracking-widest text-zinc-400 group-hover:text-white transition-colors duration-500">
                  {city.abbr}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors duration-500">
                {city.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

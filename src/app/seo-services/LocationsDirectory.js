"use client";

import { useState } from "react";
import Link from "next/link";

const countryFlags = {
  "United States": "🇺🇸"
};

export default function LocationsDirectory({ citiesDb }) {
  const [searchQuery, setSearchQuery] = useState("");

  const citiesArray = Object.keys(citiesDb).map((slug) => ({
    slug,
    ...citiesDb[slug]
  }));

  // Filter cities based on search query
  const filteredCities = citiesArray.filter((city) => {
    return (
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.niche.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group by country (USA only)
  const countries = ["United States"];
  const groupedCities = {
    "United States": filteredCities.sort((a, b) => a.name.localeCompare(b.name))
  };

  const totalResults = filteredCities.length;

  return (
    <div className="bg-zinc-950 min-h-screen relative isolate py-12 overflow-x-hidden">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-x-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1 text-xs font-semibold text-violet-300">
            <span>USA Local SEO Network</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Targeted{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Locations Directory
            </span>
          </h1>

          <p className="text-base leading-7 text-zinc-400 max-w-2xl mx-auto">
            We pre-render high-performance SEO landing pages for key business hubs across the United States. Browse our active markets below.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mx-auto max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Active Markets", val: `${citiesArray.length} Cities` },
            { label: "Target Country", val: "United States" },
            { label: "Static Speed", val: "100/100" },
            { label: "Pre-rendered Pages", val: "Active" }
          ].map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 backdrop-blur-sm">
              <span className="text-xxs uppercase tracking-wider font-bold text-zinc-500 block">
                {stat.label}
              </span>
              <span className="text-lg font-bold text-white mt-1 block">
                {stat.val}
              </span>
            </div>
          ))}
        </div>

        {/* Filter and Search Bar Container */}
        <div className="mx-auto max-w-4xl mt-12 p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city or niche (e.g., HVAC, SaaS)..."
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="text-xxs text-zinc-500 flex justify-between items-center">
            <span>Type to filter immediately. All pages are search engine optimized.</span>
            <span className="font-mono bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded-full text-zinc-400">
              Showing {totalResults} of {citiesArray.length} locations
            </span>
          </div>
        </div>

        {/* Directory Listing */}
        <div className="mx-auto max-w-6xl mt-16 space-y-16">
          {countries.map((country) => {
            const citiesInCountry = groupedCities[country] || [];
            if (citiesInCountry.length === 0) return null;

            return (
              <div key={country} className="space-y-6">
                {/* Section Title */}
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <span className="text-3xl" role="img" aria-label="country-flag">
                    {countryFlags[country]}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{country}</h2>
                    <p className="text-xxs text-zinc-500">
                      {citiesInCountry.length} targeted cities and business clusters
                    </p>
                  </div>
                </div>

                {/* Cities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {citiesInCountry.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/seo-services/${city.slug}/`}
                      className="group flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:border-violet-500/20 hover:bg-zinc-900/30 transition-all duration-300"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                            {city.name}
                          </span>
                          <span className="text-xxs font-mono text-zinc-600 group-hover:text-violet-400 transition-colors">
                            →
                          </span>
                        </div>
                        <span className="text-[10px] leading-tight text-zinc-500 group-hover:text-zinc-400 transition-colors block">
                          {city.niche}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[9px] text-zinc-600 border-t border-zinc-900/60 pt-2.5">
                        <span>Comp: {city.competitiveness}</span>
                        <span>Size: {city.marketSize}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {totalResults === 0 && (
            <div className="text-center py-20 rounded-3xl border border-zinc-900 bg-zinc-900/5">
              <span className="text-4xl">🔍</span>
              <h3 className="text-base font-bold text-white mt-4">No Locations Found</h3>
              <p className="text-xs text-zinc-500 mt-2">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

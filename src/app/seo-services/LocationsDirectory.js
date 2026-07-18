"use client";

import { useState } from "react";
import Link from "next/link";

const USFlag = () => (
  <svg viewBox="0 0 7410 3900" className="w-9 h-6 rounded shadow-sm border border-zinc-800/40 object-cover shrink-0 select-none">
    <rect width="7410" height="3900" fill="#b22234"/>
    <path d="M0,300h7410v300H0zm0,600h7410v300H0zm0,600h7410v300H0zm0,600h7410v300H0zm0,600h7410v300H0zm0,600h7410v300H0z" fill="#fff"/>
    <rect width="2964" height="2100" fill="#3c3b6e"/>
    <g fill="#fff">
      {/* Row 1 */}
      <circle cx="247" cy="175" r="40" /><circle cx="741" cy="175" r="40" /><circle cx="1235" cy="175" r="40" /><circle cx="1729" cy="175" r="40" /><circle cx="2223" cy="175" r="40" /><circle cx="2717" cy="175" r="40" />
      {/* Row 2 */}
      <circle cx="494" cy="350" r="40" /><circle cx="988" cy="350" r="40" /><circle cx="1482" cy="350" r="40" /><circle cx="1976" cy="350" r="40" /><circle cx="2470" cy="350" r="40" />
      {/* Row 3 */}
      <circle cx="247" cy="525" r="40" /><circle cx="741" cy="525" r="40" /><circle cx="1235" cy="525" r="40" /><circle cx="1729" cy="525" r="40" /><circle cx="2223" cy="525" r="40" /><circle cx="2717" cy="525" r="40" />
      {/* Row 4 */}
      <circle cx="494" cy="700" r="40" /><circle cx="988" cy="700" r="40" /><circle cx="1482" cy="700" r="40" /><circle cx="1976" cy="700" r="40" /><circle cx="2470" cy="700" r="40" />
      {/* Row 5 */}
      <circle cx="247" cy="875" r="40" /><circle cx="741" cy="875" r="40" /><circle cx="1235" cy="875" r="40" /><circle cx="1729" cy="875" r="40" /><circle cx="2223" cy="875" r="40" /><circle cx="2717" cy="875" r="40" />
      {/* Row 6 */}
      <circle cx="494" cy="1050" r="40" /><circle cx="988" cy="1050" r="40" /><circle cx="1482" cy="1050" r="40" /><circle cx="1976" cy="1050" r="40" /><circle cx="2470" cy="1050" r="40" />
      {/* Row 7 */}
      <circle cx="247" cy="1225" r="40" /><circle cx="741" cy="1225" r="40" /><circle cx="1235" cy="1225" r="40" /><circle cx="1729" cy="1225" r="40" /><circle cx="2223" cy="1225" r="40" /><circle cx="2717" cy="1225" r="40" />
      {/* Row 8 */}
      <circle cx="494" cy="1400" r="40" /><circle cx="988" cy="1400" r="40" /><circle cx="1482" cy="1400" r="40" /><circle cx="1976" cy="1400" r="40" /><circle cx="2470" cy="1400" r="40" />
      {/* Row 9 */}
      <circle cx="247" cy="1575" r="40" /><circle cx="741" cy="1575" r="40" /><circle cx="1235" cy="1575" r="40" /><circle cx="1729" cy="1575" r="40" /><circle cx="2223" cy="1575" r="40" /><circle cx="2717" cy="1575" r="40" />
    </g>
  </svg>
);

const countryFlags = {
  "United States": "us"
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
    <main className="bg-zinc-950 min-h-screen relative isolate py-12 overflow-x-hidden">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-3xl text-center space-y-6">
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
        </header>

        {/* Stats Row */}
        <section aria-label="Directory Statistics" className="mx-auto max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Active Markets", val: `${citiesArray.length} Cities` },
            { label: "Target Country", val: "United States" },
            { label: "Static Speed", val: "100/100" },
            { label: "Pre-rendered Pages", val: "Active" }
          ].map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-5 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wider font-bold text-zinc-500 block">
                {stat.label}
              </span>
              <span className="text-lg font-bold text-white mt-1 block">
                {stat.val}
              </span>
            </div>
          ))}
        </section>

        {/* Filter and Search Bar Container */}
        <section aria-label="Search and Filter" className="directory-search-container mx-auto max-w-4xl mt-12 p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full group">
              <span className="absolute left-3.5 top-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city or niche (e.g., HVAC, SaaS)..."
                className="directory-search-input w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-all shadow-inner focus:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
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

          <div className="text-xs text-zinc-500 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <span>Type to filter immediately. All pages are search engine optimized.</span>
            <span className="text-xs font-mono bg-violet-500/10 px-3 py-1 border border-violet-500/25 rounded-full text-violet-400 font-bold whitespace-nowrap self-start sm:self-auto">
              Showing {totalResults} of {citiesArray.length} locations
            </span>
          </div>
        </section>

        {/* Directory Listing */}
        <section aria-label="Locations Grid" className="mx-auto max-w-6xl mt-16 space-y-16">
          {countries.map((country) => {
            const citiesInCountry = groupedCities[country] || [];
            if (citiesInCountry.length === 0) return null;

            return (
              <div key={country} className="space-y-6">
                {/* Section Title */}
                <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                  {country === "United States" ? (
                    <USFlag />
                  ) : (
                    <span className="text-4xl shadow-sm leading-none">🌐</span>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{country}</h2>
                    <p className="text-xs text-zinc-500">
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
                      className="directory-card group flex flex-col justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:bg-zinc-900/20 transition-all duration-300"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                            {city.name}
                          </span>
                          <span className="text-xs font-mono text-zinc-600 group-hover:text-violet-400 transition-colors">
                            →
                          </span>
                        </div>
                        <span className="text-xs leading-tight text-zinc-500 group-hover:text-zinc-400 transition-colors block">
                          {city.niche}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs font-medium text-zinc-500 group-hover:text-zinc-400 border-t border-zinc-900/60 pt-2.5">
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
            <div className="text-center py-20 rounded-3xl border border-zinc-900 bg-zinc-900/5 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-zinc-650 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-base font-bold text-white mt-4">No Locations Found</h3>
              <p className="text-xs text-zinc-500 mt-2">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

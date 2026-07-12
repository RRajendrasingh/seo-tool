import Link from "next/link";
import { notFound } from "next/navigation";
import { citiesDb } from "@/data/cities";
import GoogleSerpPreview from "./GoogleSerpPreview";
import InteractiveEstimator from "./InteractiveEstimator";

// Generates static paths for all cities during build time (Next.js Static Export requirement)
export async function generateStaticParams() {
  return Object.keys(citiesDb).map((slug) => ({
    location: slug,
  }));
}

// Generate dynamic page metadata (Title & Meta Description & Canonical)
export async function generateMetadata({ params }) {
  const { location } = await params;
  const city = citiesDb[location];
  
  if (!city) {
    return {
      title: "Local SEO Services | SEOIntellect",
      description: "Hyper-targeted local search engine optimization.",
    };
  }

  const title = `Best SEO Services in ${city.name} | Outrank Competitors in ${city.country}`;
  const description = `Dominate local search in ${city.name}, ${city.country}. ${city.description} Get your free AI-powered website audit today.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://seointellect-ai.vercel.app/seo-services/${location}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://seointellect-ai.vercel.app/seo-services/${location}/`,
      siteName: "SEOIntellect",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [
      ...city.topKeywords,
      `seo services in ${city.name.toLowerCase()}`,
      `seo agency ${city.name.toLowerCase()}`,
      `local seo ${city.name.toLowerCase()}`,
    ],
  };
}

export default async function LocationPage({ params }) {
  const { location } = await params;
  const city = citiesDb[location];

  if (!city) {
    notFound();
  }

  // Sequential interlinking shift: selects 6 cities dynamically to rotate link equity
  const keys = Object.keys(citiesDb);
  const currentIndex = keys.indexOf(location);
  const otherLocations = [];
  for (let i = 1; i <= 6; i++) {
    const targetIndex = (currentIndex + i) % keys.length;
    otherLocations.push(keys[targetIndex]);
  }

  // Generate simulated coordinates based on city name hash for rich search schema
  const charSum = city.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lat = (30 + (charSum % 15) + 0.3541).toFixed(4);
  const lng = (-100 + (charSum % 40) + 0.1245).toFixed(4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `SEOIntellect Services ${city.name}`,
    "description": city.description,
    "url": `https://seointellect-ai.vercel.app/seo-services/${location}/`,
    "telephone": "+1-888-502-3921",
    "priceRange": "$$",
    "image": "https://seointellect-ai.vercel.app/assets/images/local-seo-audit.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressCountry": city.country === "United States" ? "US" : city.country === "United Kingdom" ? "GB" : city.country === "India" ? "IN" : "AU",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": parseFloat(lat),
      "longitude": parseFloat(lng)
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "serviceArea": {
      "@type": "AdministrativeArea",
      "name": city.name
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "SEO & Web Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Local SEO Audit & Optimization"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Generative Search Engine Optimization (GEO)"
          }
        }
      ]
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How long does it take to rank locally in ${city.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Local SEO generally yields results faster than generic global SEO. For low to medium competition terms, you may see positive movements in 4-8 weeks. Highly competitive search terms in ${city.name} typically take 3-6 months of technical optimization and continuous local authority building.`
        }
      },
      {
        "@type": "Question",
        "name": `Do you optimize Google Business Profiles for ${city.name} clients?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes. Google Business Profile optimization is the cornerstone of local search. We optimize category selection, business descriptions, geo-tagged photos, reviews templates, and locally structured schema maps to boost your proximity signals.`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="bg-zinc-950 min-h-screen relative isolate overflow-x-hidden text-left pb-12">
        {/* Dynamic ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-violet-600/5 via-fuchsia-600/3 to-transparent blur-[120px] pointer-events-none rounded-full" />
        
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12 sm:pt-8 lg:pt-10 lg:pb-16 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Panel: Dynamic Copy & Forms */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-block text-xs uppercase tracking-widest text-violet-400 font-extrabold bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse-subtle">
                Targeted Local SEO • {city.country}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                SEO Services in{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                  {city.name}
                </span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                {city.description} We fix technical speed bottlenecks, optimize your local keywords, and ensure your site is structured to rank high in {city.name} search results.
              </p>

              {/* Lead Capture Form: Pre-filled Dynamic URL input */}
              <div className="mx-auto lg:mx-0 max-w-lg p-1.5 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 focus-within:border-violet-500/50 focus-within:shadow-[0_0_25px_rgba(139,92,246,0.12)]">
                <form action="/audit/" method="GET" className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-grow flex items-center px-3 gap-2">
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <input
                      type="url"
                      name="url"
                      required
                      placeholder="Enter website (e.g. yourbusiness.com)"
                      style={{ backgroundColor: 'transparent' }}
                      className="w-full bg-transparent py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none min-w-0 border-0 ring-0 focus:ring-0 focus:border-0"
                    />
                  </div>
                  <input type="hidden" name="ref" value={location} />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex-shrink-0 cursor-pointer"
                  >
                    Analyze {city.name} Site
                  </button>
                </form>
              </div>
              <p className="text-xs text-zinc-500">
                Instantly run a speed and metadata audit for any company in {city.name}.
              </p>
            </div>

            {/* Right Panel: Google SERP Preview simulator */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-fuchsia-600/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />
              <GoogleSerpPreview
                cityName={city.name}
                mainKeyword={city.topKeywords[0] || `seo services in ${city.name}`}
              />
            </div>
            
          </div>
        </div>

        {/* Local Insights Stats (Three Premium Cards) */}
        <div className="mx-auto max-w-5xl px-6 py-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="group rounded-3xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-extrabold tracking-widest text-zinc-500">Market Reach</span>
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black text-white block tracking-tight">{city.marketSize}</span>
                <span className="text-xs text-zinc-500 leading-normal mt-1 block">Local audience search volume</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group rounded-3xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between border-l-2 border-l-violet-600/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-extrabold tracking-widest text-zinc-500">Primary Focus</span>
                <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-extrabold text-violet-400 block truncate">{city.niche}</span>
                <span className="text-xs text-zinc-500 leading-normal mt-1.5 block">High-growth target industry</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group rounded-3xl border border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase font-extrabold tracking-widest text-zinc-500">Competition</span>
                <svg className="w-4 h-4 text-fuchsia-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black text-fuchsia-400 block tracking-tight">{city.competitiveness}</span>
                <span className="text-xs text-zinc-500 leading-normal mt-1 block">Niche optimization difficulty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Local SEO Opportunity Calculator */}
        <div className="mx-auto max-w-5xl px-6 py-6 relative z-10">
          <InteractiveEstimator cityName={city.name} />
        </div>


        {/* Simple 3-Step Process */}
        <div className="mx-auto max-w-5xl px-6 py-12 relative z-10 border-t border-zinc-900/60 [.light_&]:border-slate-200">
          <div className="text-center space-y-4 mb-12">
            <span className="inline-block text-[10px] uppercase tracking-widest text-violet-400 font-extrabold bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              How It Works
            </span>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl [.light_&]:text-slate-900 leading-tight">
              Get Local Customers in 3 Easy Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-6 space-y-3 hover:border-zinc-800 transition-all [.light_&]:bg-white [.light_&]:border-slate-200">
              <span className="text-2xl font-black text-violet-500">01</span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider [.light_&]:text-slate-900">Run a Free Audit</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Enter your website URL at the top of the page. Our diagnostic tool scans your website's speed, mobile responsiveness, and ranking structures in 20 seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-6 space-y-3 hover:border-zinc-800 transition-all [.light_&]:bg-white [.light_&]:border-slate-200 border-l-2 border-l-violet-600/40">
              <span className="text-2xl font-black text-violet-500">02</span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider [.light_&]:text-slate-900">Get Your AI Checklist</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We generate a prioritized, easy-to-understand checklist showing you exactly what code to fix, which keywords to inject, and how to improve your scores.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-6 space-y-3 hover:border-zinc-800 transition-all [.light_&]:bg-white [.light_&]:border-slate-200">
              <span className="text-2xl font-black text-violet-500">03</span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider [.light_&]:text-slate-900">Claim the Top Spots</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Apply the fixes to rank high in the Google Map Pack and organic local search, or choose one of our managed campaigns to let our team handle everything.
              </p>
            </div>
          </div>
        </div>

        {/* Core Local Strategy Details */}
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl [.light_&]:text-slate-900 leading-tight">
                Why General SEO Fails in {city.name} <span className="text-zinc-500 font-medium">(And What Works)</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Standard SEO doesn't work for local businesses. Local customers search differently—they search on mobile devices, look at map locations, and want immediate answers. Here is how we help you capture buyers in {city.name}:
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex gap-3.5">
                  <div className="mt-1 flex-shrink-0 p-1.5 bg-zinc-900/80 border border-zinc-850 rounded-xl text-violet-400 h-9 w-9 flex items-center justify-center text-sm shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Google Map Pack Optimization</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      We sync metadata, schemas, and coordinates to ensure your profile appears in the 3-Pack local maps for searches in {city.name}.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <div className="mt-1 flex-shrink-0 p-1.5 bg-zinc-900/80 border border-zinc-850 rounded-xl text-fuchsia-400 h-9 w-9 flex items-center justify-center text-sm shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hyper-Fast Mobile Page Speed</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Mobile searches represent over 60% of search queries. If your site takes more than 3 seconds to load on mobile connections, you lose up to 50% of your potential leads in {city.name}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Localized Keywords Checklist */}
            <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 -z-10 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Target Keywords in {city.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-normal">
                We target high-intent keyword variations that your prospects in {city.name} are searching right now:
              </p>
              <ul className="space-y-3 pt-2">
                {city.topKeywords.map((kw) => (
                  <li key={kw} className="flex items-center gap-2.5 font-mono text-xs text-zinc-300 bg-zinc-900/20 px-3.5 py-2.5 border border-zinc-850 rounded-xl">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{kw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Local SEO FAQs Section */}
        <div className="border-t border-zinc-900 bg-zinc-950/20 py-20 relative z-10">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-left">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl text-center mb-12 leading-tight">
              Local SEO FAQs for {city.name}
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 hover:border-zinc-800 transition-colors">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  How long does it take to rank locally in {city.name}?
                </h4>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  Local SEO generally yields results faster than generic global SEO. For low to medium competition terms, you may see positive movements in 4-8 weeks. Highly competitive search terms in {city.name} typically take 3-6 months of technical optimization and continuous local authority building.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/10 hover:border-zinc-800 transition-colors">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Do you optimize Google Business Profiles for {city.name} clients?
                </h4>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  Yes. Google Business Profile optimization is the cornerstone of local search. We optimize category selection, business descriptions, geo-tagged photos, reviews templates, and locally structured schema maps to boost your proximity signals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Internal Interlinking Grid */}
        <div className="border-t border-zinc-900 bg-zinc-950/40 py-16 relative z-10">
          <div className="mx-auto max-w-4xl px-6 text-left">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 text-center sm:text-left">
              Other Local Markets We Serve
            </h3>
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              {otherLocations.map((slug) => (
                <Link
                  key={slug}
                  href={`/seo-services/${slug}/`}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900/20 hover:bg-zinc-900/50 border border-zinc-850 px-4 py-2 rounded-full transition-all duration-300 hover:border-violet-500/30"
                >
                  <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>SEO in {citiesDb[slug].name}</span>
                </Link>
              ))}
              <Link
                href="/seo-services/"
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-950/10 hover:bg-violet-950/20 border border-violet-850/30 px-4 py-2 rounded-full transition-all duration-300 font-bold"
              >
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Explore All USA Locations →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="mx-auto max-w-7xl px-6 py-12 text-center relative z-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-violet-500/10 p-12 space-y-6 max-w-4xl mx-auto shadow-xl">
            <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-violet-600/5 rounded-full blur-[100px]" />
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl leading-tight">
              Dominate {city.name} Google Rankings
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-xs leading-relaxed">
              Do not let competitors capture customers in your area. Run a free audit of your current digital setup now or purchase our Premium AI report for a complete breakdown.
            </p>
            <div className="flex justify-center gap-3.5 pt-2">
              <Link
                href="/audit/"
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md shadow-white/5 hover:scale-[1.01] active:scale-[0.99]"
              >
                Start Free Audit
              </Link>
              <Link
                href="/services/#plans"
                className="rounded-xl border border-zinc-800 bg-transparent px-5 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                View Pricing & Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

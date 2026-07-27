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
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Full-Service Managed SEO & Complete Project Handling"
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
        "name": `Can you handle our complete SEO project in ${city.name} end-to-end?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! We provide full-service managed SEO campaigns for businesses in ${city.name}. Our specialists handle everything: technical speed optimization, schema code injections, Google Business Profile management, local link building, and monthly performance reports.`
        }
      },
      {
        "@type": "Question",
        "name": `How long does it take to rank locally in ${city.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Local SEO generally yields results faster than generic global SEO. For low to medium competition terms, you may see positive movements in 4-8 weeks. Highly competitive search terms in ${city.name} typically take 3-6 months of technical optimization and continuous local authority building.`
        }
      }
    ]
  };

  const localServices = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
        </svg>
      ),
      title: "End-to-End Managed SEO & Complete Project Handling",
      desc: `Don't have an in-house SEO team in ${city.name}? Our specialists handle your entire SEO project end-to-end: technical audits, on-page fixes, local link building, GBP management, and monthly ranking growth.`,
      badge: "FULL-SERVICE MANAGED",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Google Map Pack & Local GBP Ranking",
      desc: `Target high-intent local buyer keywords in ${city.name}. We optimize Google Business Profile signals, local citations, and geo-grid coordinates to secure top 3 map pack placements.`,
      badge: "LOCAL PACK #1",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Generative Engine Optimization (GEO/AEO)",
      desc: `Ensure your brand is cited by ChatGPT Search, Perplexity, and Google AI Overviews. We inject structured JSON-LD entity markup tailored for ${city.name} business queries.`,
      badge: "AI CITATION READY",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Technical Speed & Core Web Vitals Audit",
      desc: `Eliminate LCP and CLS bottlenecks. We compile Next.js static exports to guarantee 0.3s lightning load times on mobile devices across ${city.name}.`,
      badge: "100/100 SPEED",
    },
  ];

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
      <main className="bg-zinc-950 text-zinc-300 selection:bg-violet-500/30 selection:text-violet-200 [.light_&]:bg-slate-50 [.light_&]:text-slate-900 relative overflow-x-hidden text-left pb-16 font-sans">
        
        {/* Crisp Linear Background Grid Mesh & Ambient Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none [.light_&]:from-violet-500/10" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" aria-hidden="true" />

        {/* Hero Section */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-mono text-zinc-400 [.light_&]:text-slate-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white [.light_&]:hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/seo-services/" className="hover:text-white [.light_&]:hover:text-slate-900 transition-colors">SEO Services</Link>
            <span>/</span>
            <span className="text-violet-400 [.light_&]:text-violet-600 font-bold">{city.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Panel: Dynamic Copy & Forms */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-mono tracking-wider uppercase rounded-md shadow-sm [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-700">
                  <span className="w-2 h-2 bg-violet-500" />
                  <span>TARGETED LOCAL SEO & MANAGED CAMPAIGNS • {city.country}</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] [.light_&]:text-slate-900">
                SEO Services in{" "}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-white bg-clip-text text-transparent [.light_&]:from-violet-600 [.light_&]:via-indigo-600 [.light_&]:to-slate-900">
                  {city.name}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed [.light_&]:text-slate-600">
                {city.description} We handle your complete SEO project end-to-end — fixing technical speed bottlenecks, optimizing local search entities, and building high-authority local rankings in {city.name}.
              </p>

              {/* Lead Capture Form: Pre-filled Dynamic URL input */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <form action="/audit/" method="GET" className="relative flex items-center">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1 1 14 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="url"
                      defaultValue=""
                      placeholder={`Enter ${city.name} business URL (e.g. yourbusiness.com)`}
                      className="w-full pl-10 pr-36 py-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-sm shadow-sm transition-all [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-900"
                    />
                  </div>
                  <input type="hidden" name="ref" value={location} />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-md flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <span>Analyze {city.name}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-4 text-xs font-mono text-zinc-400 [.light_&]:text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> Free Audit</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> Complete SEO Handling</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> Local Map Pack</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Google SERP Preview simulator */}
            <div className="lg:col-span-5 relative">
              <GoogleSerpPreview
                cityName={city.name}
                mainKeyword={city.topKeywords[0] || `seo services in ${city.name}`}
              />
            </div>
            
          </div>
        </header>

        {/* Local Insights Stats (Three Crisp SaaS Cards) */}
        <section aria-label="Local Market Statistics" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 flex flex-col justify-between shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 [.light_&]:border-slate-200">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-500 [.light_&]:text-slate-500">Market Reach</span>
                <span className="text-xs font-mono text-emerald-400 [.light_&]:text-emerald-600 font-bold">HIGH DEMAND</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white block tracking-tight [.light_&]:text-slate-900">{city.marketSize}</span>
                <span className="text-xs font-mono text-zinc-400 mt-1 block [.light_&]:text-slate-600">Local audience search volume</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 flex flex-col justify-between shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 [.light_&]:border-slate-200">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-500 [.light_&]:text-slate-500">Primary Industry</span>
                <span className="text-xs font-mono text-violet-400 [.light_&]:text-violet-600 font-bold">TARGET SECTOR</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white block tracking-tight [.light_&]:text-slate-900">{city.niche}</span>
                <span className="text-xs font-mono text-zinc-400 mt-1 block [.light_&]:text-slate-600">Dominant buyer demographic</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 flex flex-col justify-between shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 [.light_&]:border-slate-200">
                <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-500 [.light_&]:text-slate-500">Project Delivery</span>
                <span className="text-xs font-mono text-emerald-400 [.light_&]:text-emerald-600 font-bold">100% MANAGED</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white block tracking-tight [.light_&]:text-slate-900">Complete SEO Handling</span>
                <span className="text-xs font-mono text-zinc-400 mt-1 block [.light_&]:text-slate-600">End-to-end technical & link growth</span>
              </div>
            </div>

          </div>
        </section>

        {/* SEO Services Delivered in City (4 Core Pillars) */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" aria-label="Services offered">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 [.light_&]:text-violet-700 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                FULL-SERVICE SEO & MANAGED CAPABILITIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              Complete SEO Services Delivered in {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed [.light_&]:text-slate-600">
              Whether you want automated software or complete managed SEO project handling — we deliver results in {city.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localServices.map((srv, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-8 hover:border-zinc-700 transition-all shadow-xl flex flex-col justify-between [.light_&]:bg-white [.light_&]:border-slate-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 [.light_&]:text-violet-600">
                      {srv.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 [.light_&]:text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white [.light_&]:text-slate-900">{srv.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed [.light_&]:text-slate-600">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 [.light_&]:border-slate-200 flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 [.light_&]:text-slate-500">Targeting {city.name}</span>
                  <Link
                    href={`/contact/?ref=${location}`}
                    className="text-violet-400 hover:text-violet-300 [.light_&]:text-violet-600 [.light_&]:hover:text-violet-700 font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Request Managed SEO Proposal</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Estimator Component */}
        <section aria-label="ROI Estimator" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <InteractiveEstimator cityName={city.name} />
        </section>

        {/* Dual Conversion Funnel Banner: Self-Serve SaaS & High-Ticket Agency Consultancy */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-900 [.light_&]:border-slate-200" id="pricing">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden [.light_&]:bg-white [.light_&]:border-slate-300">
            <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none [.light_&]:bg-violet-500/5" />
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 [.light_&]:text-violet-700 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                COMPLETE SEO PROJECT HANDLING & SAAS PLANS
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              Want Our Team to Handle Your Complete SEO Project in {city.name}?
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed [.light_&]:text-slate-600">
              From automated audit tools to full-service managed SEO campaigns — choose self-serve software or book a 15-minute strategy call to let our team handle your entire project.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/contact/?plan=growth-seo&ref=${location}`}
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Book 15-Min Strategy Call</span>
              </Link>

              <Link
                href="/pricing/?tab=managed_seo"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-700/80 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all shadow-md hover:border-violet-500/40 active:scale-[0.98] [.light_&]:bg-slate-100 [.light_&]:border-slate-300 [.light_&]:text-slate-900 [.light_&]:hover:bg-slate-200 flex items-center justify-center gap-2"
              >
                <span>View Managed &amp; SaaS Plans</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Interlinking Footer Matrix for Sequential Location Equity */}
        <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 border-t border-zinc-900 [.light_&]:border-slate-200 relative z-10">
          <div className="mb-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 [.light_&]:text-slate-400">
              Explore Neighboring US Local SEO Networks
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            {otherLocations.map((slug) => {
              const otherCity = citiesDb[slug];
              return (
                <Link
                  key={slug}
                  href={`/seo-services/${slug}/`}
                  className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3 hover:border-violet-500/40 transition-all text-zinc-300 hover:text-white flex flex-col gap-1 shadow-sm [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-700"
                >
                  <span className="font-bold text-white text-sm [.light_&]:text-slate-900">{otherCity.name}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{otherCity.state} • SEO Blueprint →</span>
                </Link>
              );
            })}
          </div>
        </footer>

      </main>
    </>
  );
}

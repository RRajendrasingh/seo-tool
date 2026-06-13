import Link from "next/link";
import { notFound } from "next/navigation";
import { citiesDb } from "@/data/cities";

// Generates static paths for all cities during build time (Next.js Static Export requirement)
export async function generateStaticParams() {
  return Object.keys(citiesDb).map((slug) => ({
    location: slug,
  }));
}

// Generate dynamic page metadata (Title & Meta Description)
export async function generateMetadata({ params }) {
  const { location } = await params;
  const city = citiesDb[location];
  
  if (!city) {
    return {
      title: "Local SEO Services | SEOIntellect",
      description: "Hyper-targeted local search engine optimization.",
    };
  }

  return {
    title: `Best SEO Services in ${city.name} | Outrank Competitors in ${city.country}`,
    description: `Dominate local search in ${city.name}, ${city.country}. ${city.description} Get your free AI-powered website audit today.`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `SEOIntellect Services ${city.name}`,
    "description": city.description,
    "url": `https://seointellect-ai.vercel.app/seo-services/${location}/`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressCountry": city.country === "United States" ? "US" : city.country === "United Kingdom" ? "GB" : city.country === "India" ? "IN" : "AU",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-zinc-950 min-h-screen relative isolate">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-x-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1 text-xs font-semibold text-violet-300">
            <span>Targeted Local SEO • {city.country}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            SEO Services in{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              {city.name}
            </span>
          </h1>

          <p className="text-base sm:text-lg leading-8 text-zinc-400 max-w-3xl mx-auto">
            {city.description} We optimize code structures, content intent, and local citations to place your business at the top of Google rankings in {city.name}.
          </p>

          {/* Lead Capture Form: Directly Links to /audit page with pre-filled details */}
          <div className="mx-auto max-w-lg mt-10 p-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
            <form action="/audit/" method="GET" className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                name="url"
                required
                placeholder="Enter website (e.g. yourbusiness.com)"
                className="flex-grow bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none min-w-0"
              />
              <input type="hidden" name="ref" value={location} />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex-shrink-0"
              >
                Analyze {city.name} Site
              </button>
            </form>
          </div>
          <p className="text-xxs text-zinc-500 mt-2">
            Instantly run a speed and metadata audit for any company in {city.name}.
          </p>
        </div>
      </div>

      {/* Local Insights Stats */}
      <div className="border-y border-zinc-900 bg-zinc-950/60 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Target Audience Reach
              </dt>
              <dd className="text-3xl font-extrabold text-white">{city.marketSize}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Primary Local Focus
              </dt>
              <dd className="text-xl font-bold text-violet-400 mt-2">{city.niche}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Niche Competition
              </dt>
              <dd className="text-3xl font-extrabold text-fuchsia-400">{city.competitiveness}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Core Local Strategy details */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Why General SEO Fails in {city.name} (And What Works)
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Standard, generic SEO strategies don’t capture regional buyers. Local searches are characterized by specific buying intent, map locations, and mobile search queries.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="mt-1 flex-shrink-0 p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-violet-400">
                  📍
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Google Map Pack Optimization</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    We sync metadata, schemas, and coordinates to ensure your profile appears in the 3-Pack local maps for searches in {city.name}.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 flex-shrink-0 p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-fuchsia-400">
                  📱
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Hyper-Fast Mobile Page Speed</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                    Mobile searches represent over 60% of search queries. If your site takes more than 3 seconds to load on mobile connections, you lose up to 50% of your potential leads in {city.name}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Localized keywords checklist */}
          <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
            <h3 className="text-base font-bold text-white">
              Target Keywords in {city.name}
            </h3>
            <p className="text-xs text-zinc-400">
              We target high-intent keyword variations that your prospects are searching right now:
            </p>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              {city.topKeywords.map((kw) => (
                <li key={kw} className="flex items-center gap-2 font-mono bg-zinc-950 px-3 py-2 border border-zinc-850 rounded-lg">
                  <span className="text-emerald-400">✓</span>
                  <span>{kw}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Local SEO FAQs */}
      <div className="border-t border-zinc-900 bg-zinc-950/40 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl text-center mb-12">
            Local SEO FAQs for {city.name}
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-900/30">
              <h4 className="text-sm font-bold text-white">
                How long does it take to rank locally in {city.name}?
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Local SEO generally yields results faster than generic global SEO. For low to medium competition terms, you may see positive movements in 4-8 weeks. Highly competitive search terms in {city.name} typically take 3-6 months of technical optimization and continuous local authority building.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-900/30">
              <h4 className="text-sm font-bold text-white">
                Do you optimize Google Business Profiles (Google Maps) for {city.name} clients?
              </h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Yes. Google Business Profile optimization is the cornerstone of local search. We optimize category selection, business descriptions, geo-tagged photos, reviews templates, and locally structured schema maps to boost your proximity signals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-violet-900/10 via-fuchsia-900/5 to-zinc-950 border border-violet-500/10 p-12 space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            Dominate {city.name} Google Rankings
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto text-xs leading-relaxed">
            Do not let competitors capture customers in your area. Run a free audit of your current digital setup now or purchase our Premium AI report for a complete breakdown.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/audit/"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md"
            >
              Start Free Audit
            </Link>
            <Link
              href="/services/#plans"
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-all"
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

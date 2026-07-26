import Link from "next/link";
import PricingCard from "@/components/PricingCard";
import CitySearchBox from "@/components/home/CitySearchBox";
import FaqAccordion from "@/components/home/FaqAccordion";
import AuditCtaForm from "@/components/home/AuditCtaForm";
import PlatformFeatures from "@/components/home/PlatformFeatures";
import VideoIntro from "@/components/home/VideoIntro";
import LatestBlogs from "@/components/home/LatestBlogs";

export const metadata = {
  title: "SEOIntellect AI | Technical Website Auditor, AEO/GEO Diagnostic Tool & SEO Services",
  description: "Audit your website instantly for traditional SEO rankings, Core Web Vitals speed, and Generative Engine Optimization (GEO/AEO) to secure ChatGPT & Gemini citations.",
  keywords: [
    "AI SEO audit",
    "Generative Engine Optimization",
    "GEO",
    "AEO",
    "technical site auditor",
    "website speed audit",
    "SEO services"
  ],
  openGraph: {
    title: "SEOIntellect AI | Technical Website Auditor, AEO/GEO Diagnostic Tool & SEO Services",
    description: "Audit your website instantly for traditional SEO rankings, Core Web Vitals speed, and Generative Engine Optimization (GEO/AEO) to secure ChatGPT & Gemini citations.",
    type: "website",
    url: "https://seointellect-ai.vercel.app/",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
        width: 1200,
        height: 720,
        alt: "SEOIntellect AI Search Intelligence & Auditing Platform",
      },
    ],
  },
};

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SEOIntellect AI",
      "url": "https://seointellect-ai.vercel.app/",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SEOIntellect AI Website Auditor",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SEOIntellect AI",
      "url": "https://seointellect-ai.vercel.app/",
      "logo": "https://seointellect-ai.vercel.app/logo.png",
      "sameAs": [
        "https://twitter.com/seointellect",
        "https://github.com/seointellect"
      ],
    }
  ];

  const pricingPlans = [
    {
      name: "Starter Report",
      price: "$9",
      period: ".99 / once",
      desc: "Perfect for a quick, deep Lighthouse analysis. Instantly export a premium PDF report to share with developers.",
      features: [
        "1 Deep Lighthouse Analysis",
        "Instant Premium PDF Export",
        "Core Web Vitals Check",
        "Priority Queue Processing",
        "Saves report to account",
      ],
      buttonText: "Get Starter Report",
      href: "/checkout?plan=single",
      popular: false,
    },
    {
      name: "Pro Monitor",
      price: "$29",
      period: "/month (recurring)",
      desc: "Ideal for freelancers. Automate your search monitoring. Let our engine run scans weekly and notify you of drops.",
      features: [
        "Up to 3 monitored domains",
        "Weekly automated background audits",
        "Email alerts on metrics drop",
        "Interactive score trend lines",
        "Access report history",
      ],
      buttonText: "Start Pro Plan",
      href: "/checkout?plan=weekly",
      popular: true,
    },
    {
      name: "Agency Sales",
      price: "$99",
      period: "/month (recurring)",
      desc: "The ultimate sales enablement tool. Generate gorgeous custom PDF audit files featuring your logo and agency name.",
      features: [
        "Up to 25 monitored domains",
        "White-label PDF Reports",
        "Custom agency logo & branding",
        "Unlimited one-time PDF exports",
        "Priority email support",
      ],
      buttonText: "Start Agency Plan",
      href: "/checkout?plan=agency",
      popular: false,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month (recurring)",
      desc: "Built for scale. High-volume domain tracking and API access for integrating SEO data into your own dashboards.",
      features: [
        "Up to 100 monitored domains",
        "Dedicated Account Manager",
        "API Access (Coming Soon)",
        "Advanced technical crawling",
        "Custom SLAs",
      ],
      buttonText: "Contact Sales",
      href: "/checkout?plan=multi",
      popular: false,
    },
  ];

  const faqItems = [
    {
      q: "What is AEO and GEO optimization?",
      a: "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) optimize your site's copy, structure, and schema markup so that generative AI answer tools (like ChatGPT Search, Claude, and Google AI Overviews) extract and cite your website as the primary source when responding to user questions.",
    },
    {
      q: "How does the SEO Audit tool run for free?",
      a: "The tool connects directly to the official Google PageSpeed/Lighthouse APIs from your browser. There are no backend database servers or paid third-party scraping limits, making the audit 100% free and always active.",
    },
    {
      q: "Can static Next.js exports be hosted on Hostinger Premium plans?",
      a: "Yes! By compiling Next.js into a static export ('output: export'), the website compiles into pure HTML, CSS, and JS files. These run perfectly on Hostinger's standard shared web servers, meaning you get extremely fast loading speeds and zero server costs.",
    },
    {
      q: "How long does it take to see local SEO improvements?",
      a: "Dynamic city pages typically index and start capturing localized buyer keywords within 4 to 8 weeks. Highly competitive search keywords generally take 3 to 6 months of continuous link and authority optimization.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="relative isolate overflow-hidden bg-zinc-950 text-zinc-300 selection:bg-violet-500/30 selection:text-violet-200 [.light_&]:bg-slate-50 [.light_&]:text-slate-900 font-sans">
        {/* Crisp Linear Background Grid & Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" aria-hidden="true" />

        {/* 1. HERO SECTION */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Copy & Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-mono tracking-wider uppercase rounded-md shadow-sm [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-700">
                  <span className="w-2 h-2 bg-violet-500" />
                  <span>Next-Gen AI Search & SEO Intelligence</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] [.light_&]:text-slate-900">
                Dominate <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-white bg-clip-text text-transparent [.light_&]:from-violet-600 [.light_&]:via-indigo-600 [.light_&]:to-slate-900">AI Search Engine</span> Rankings.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed [.light_&]:text-slate-600">
                Automated technical audits, generative engine optimization (GEO) scoring, and instant white-label PDF reports for modern growth teams.
              </p>

              <div className="pt-2 max-w-xl">
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
                      placeholder="Enter website URL (e.g. example.com)"
                      className="w-full pl-10 pr-32 py-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-sm shadow-sm transition-all [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-md flex items-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <span>Run Audit</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
                <div className="flex items-center gap-6 mt-4 text-xs font-mono text-zinc-400 [.light_&]:text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> Free Audit</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> Instant PDF</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400" /> GEO Ready</span>
                </div>
              </div>
            </div>

            {/* Right Metric Box */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 backdrop-blur-md shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800 [.light_&]:border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400" />
                    <span className="text-xs font-mono text-zinc-300 font-semibold [.light_&]:text-slate-700">AUDIT METRICS</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 [.light_&]:bg-slate-100 [.light_&]:border-slate-300">SYSTEM: ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-xs text-zinc-400 font-mono block mb-1 [.light_&]:text-slate-500">OVERALL SCORE</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white [.light_&]:text-slate-900">94</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">GRADE A+</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-xs text-zinc-400 font-mono block mb-1 [.light_&]:text-slate-500">AI GEO CITATION</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-violet-400">92%</span>
                      <span className="text-xs text-violet-300 font-mono font-bold">HIGH</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-zinc-300 [.light_&]:text-slate-700">LCP & Performance</span>
                    <span className="text-emerald-400 font-bold">0.8s (98%)</span>
                  </div>
                  <div className="p-3 rounded-md bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-zinc-300 [.light_&]:text-slate-700">ChatGPT Search Visibility</span>
                    <span className="text-violet-400 font-bold">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* 2. TRUST LOGOS (Immediate Social Proof after Hero) */}
        <section className="relative z-10 py-10 border-y border-zinc-900 [.light_&]:border-slate-200" aria-labelledby="trust-logos">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span id="trust-logos" className="text-xs font-mono uppercase tracking-widest text-zinc-500 [.light_&]:text-slate-400 block">
              Trusted by Growth Leaders & SEO Professionals Worldwide
            </span>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-zinc-400 font-mono font-bold text-sm tracking-widest opacity-60">
              <span>AHREFS</span>
              <span>SEMRUSH</span>
              <span>MOZ</span>
              <span>HUBSPOT</span>
              <span>VERCEL</span>
              <span>CLOUDFLARE</span>
            </div>
          </div>
        </section>

        {/* 3. VIDEO INTRO DEMO */}
        <section className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md">
                PRODUCT DEMO
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight [.light_&]:text-slate-900">
              See How SEOIntellect AI Audits Your Site in Seconds
            </h2>
          </div>
          <VideoIntro />
        </section>

        {/* 4. PLATFORM FEATURES & BENTO SECTION */}
        <PlatformFeatures />

        {/* 5. ALTERNATING FEATURE DEEP DIVES */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200 space-y-24" aria-label="Features">
          {/* Feature 1: Technical SEO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono uppercase rounded-md inline-block">
                  CORE ENGINE
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight [.light_&]:text-slate-900">
                Automated Technical SEO & Core Web Vitals Audits
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed [.light_&]:text-slate-600">
                Our lightweight crawler scans headers, image alt attributes, OpenGraph matrices, and SSL parameters. It gives you a clean checklist of exactly what search engines parse.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-300 [.light_&]:text-slate-700">
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Meta length review</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Image alt description gaps</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Header sequence order</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> SSL & HTTPS params</li>
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 font-mono text-xs space-y-3 shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
                <div className="flex justify-between pb-2 border-b border-zinc-800 [.light_&]:border-slate-200 text-zinc-500">
                  <span>CRAWL_RESULT: PARSING_CHECKLIST</span>
                  <span className="text-emerald-400 font-bold">100% Crawled</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-zinc-300 [.light_&]:text-slate-700">Title Elements Checklist</span>
                    <span className="text-emerald-400 font-bold">Passed</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-zinc-300 [.light_&]:text-slate-700">Headings Sequence</span>
                    <span className="text-emerald-400 font-bold">Passed</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <span className="text-zinc-400 [.light_&]:text-slate-600">Alt Image Tag Review</span>
                    <span className="text-amber-400 font-bold">2 Gaps Found</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: GEO & AEO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 lg:order-2 space-y-4">
              <div>
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono uppercase rounded-md inline-block">
                  FUTURE-PROOF TECH
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight [.light_&]:text-slate-900">
                Generative Engine Optimization (GEO) & AEO
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed [.light_&]:text-slate-600">
                Search is shifting to direct answers. We configure JSON-LD schemas and format content hierarchies to ensure your site is selected and cited by ChatGPT Search & Gemini.
              </p>
            </div>
            <div className="lg:col-span-6 lg:order-1">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 font-mono text-xs space-y-3 shadow-xl [.light_&]:bg-white [.light_&]:border-slate-300">
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 space-y-2.5 font-sans [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                  <div className="text-[11px] text-zinc-500 border-b border-zinc-800 pb-2 flex gap-2">
                    <span className="font-mono text-violet-400 font-bold">PROMPT:</span>
                    <span>"Who is the best local web dev agency in Mumbai?"</span>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed [.light_&]:text-slate-700">
                    <span className="text-indigo-400 font-bold block mb-1">✦ AI ENGINE ANSWER:</span>
                    According to organic technical crawls, <strong className="text-white [.light_&]:text-slate-900">SEOIntellect</strong> provides the fastest statically exported Next.js pages <span className="bg-indigo-950 px-1 py-0.5 rounded text-indigo-400 border border-indigo-500/30 text-[9px] font-bold">[1]</span>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. LOCAL SEO CITY SEARCH */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" aria-labelledby="local-seo">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                NATIONAL FOOTPRINT
              </span>
            </div>
            <h2 id="local-seo" className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              Targeted Local SEO Services & Coverage Map
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed [.light_&]:text-slate-600">
              Explore our rankings blueprints for key US business hubs.
            </p>
          </div>
          <CitySearchBox />
        </section>

        {/* 7. CUSTOMER REVIEWS (Right before Pricing) */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" aria-labelledby="testimonials">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                CUSTOMER REVIEWS
              </span>
            </div>
            <h2 id="testimonials" className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              Trusted by Growth Builders
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed [.light_&]:text-slate-600">
              See how modern teams scale organic traffic and secure citations on next-generation search grids.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "The AI audit gave us a detailed, actionable checklist of alt images and header sequences. In 3 weeks, our core web vitals hit 100%, and search traffic is up 42%.",
                name: "Sarah Jenkins",
                role: "VP of Growth, CloudFlow",
                rating: "★★★★★",
              },
              {
                text: "Our dynamic city landing pages indexed incredibly fast. Having individual, high-performance static pages for Delhi, LA, and London increased our conversions by 180%.",
                name: "Arjun Mehta",
                role: "Founder, ByteCraft",
                rating: "★★★★★",
              },
              {
                text: "Integrating standard organization schema markup verified our entities. We are now cited and summarized as the top response on ChatGPT Search.",
                name: "David Miller",
                role: "SEO Lead, FinArch Solutions",
                rating: "★★★★★",
              },
            ].map((test, index) => (
              <article
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 text-left hover:border-zinc-700 transition-all [.light_&]:bg-white [.light_&]:border-slate-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-amber-400 text-sm tracking-widest">{test.rating}</div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic [.light_&]:text-slate-700">
                    &quot;{test.text}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-zinc-800/80 [.light_&]:border-slate-200 pt-4">
                  <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white [.light_&]:text-slate-900">{test.name}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono block [.light_&]:text-slate-500">{test.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 8. PRICING TIERS */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" id="pricing" aria-labelledby="pricing-heading">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                SUBSCRIPTION TIERS
              </span>
            </div>
            <h2 id="pricing-heading" className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              Affordable SEO Audit & GEO Monitoring Plans
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed [.light_&]:text-slate-600">
              Choose the plan duration that fits your project. No setup fees, no contracts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>

        {/* 9. LATEST BLOGS */}
        <section className="relative z-10 border-t border-zinc-900 [.light_&]:border-slate-200 py-16">
          <LatestBlogs />
        </section>

        {/* 10. FAQ SECTION */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" id="faq" aria-labelledby="faq-heading">
          <div className="text-center mb-14">
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md shadow-sm">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4 [.light_&]:text-slate-900">
              SEO Auditor & GEO Optimization FAQ
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed [.light_&]:text-slate-600">
              Answers to common concerns about Next.js static speed, AI citation guidelines, and local target SEO audits.
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </section>

        {/* 11. FINAL CTA BANNER */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200 text-center" aria-label="Call to action">
          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-8 sm:p-12 space-y-6 max-w-4xl mx-auto shadow-2xl [.light_&]:bg-white [.light_&]:border-slate-300">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white [.light_&]:text-slate-900">
              Ready to Dominate Your Market?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto [.light_&]:text-slate-600">
              Enter your domain below to generate an instant, AI-powered technical audit report.
            </p>
            <AuditCtaForm />
          </div>
        </section>
      </main>
    </>
  );
}

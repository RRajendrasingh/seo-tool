import Link from "next/link";
import PricingCard from "@/components/PricingCard";
import HeroMockupTabs from "@/components/home/HeroMockupTabs";
import CitySearchBox from "@/components/home/CitySearchBox";
import FaqAccordion from "@/components/home/FaqAccordion";
import AuditCtaForm from "@/components/home/AuditCtaForm";
import PlatformFeatures from "@/components/home/PlatformFeatures";
import VideoIntro from "@/components/home/VideoIntro";
import LatestBlogs from "@/components/home/LatestBlogs";

export const metadata = {
  title: "SEOIntellect AI | AI-Powered SEO Audits & Local SEO Services",
  description: "Analyze your website's ranking signals instantly. Get detailed AI action checklists, optimize for ChatGPT and Gemini citation grids, and capture local customers globally.",
  keywords: [
    "AI SEO audit",
    "Generative Engine Optimization",
    "GEO",
    "AEO",
    "local SEO agency",
    "website speed audit",
    "website audit tool"
  ],
  openGraph: {
    title: "SEOIntellect AI | AI-Powered SEO Audits & Local SEO Services",
    description: "Analyze your website's ranking signals instantly. Get detailed AI action checklists, optimize for ChatGPT and Gemini citation grids, and capture local customers globally.",
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

  const workflowSteps = [
    {
      num: "01",
      title: "Audit Your Domain",
      desc: "Scan 30+ technical performance parameters and structure data using Google Lighthouse APIs in 20 seconds.",
    },
    {
      num: "02",
      title: "Deploy recommendations",
      desc: "Implement direct, code-ready checklist recommendations to fix speed bottlenecks and HTML semantic issues.",
    },
    {
      num: "03",
      title: "Establish AEO citations",
      desc: "Align your entity graphs and format content matrices to be crawled and cited by Gemini and ChatGPT search agents.",
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
      
      <main className="relative isolate overflow-hidden bg-slate-950 text-slate-300">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" aria-hidden="true" />
        {/* Glow Rings */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" aria-hidden="true" />
        <div className="absolute top-1/3 left-10 -z-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" aria-hidden="true" />

        {/* 1. HERO SECTION */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="inline-flex items-center gap-x-2.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-4 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-sm select-none transition-all duration-300 hover:border-cyan-500/40">
                <span className="flex text-amber-400" aria-hidden="true">★★★★★</span>
                <span className="h-3 w-px bg-zinc-800" aria-hidden="true" />
                <span>5.0 Rating by 1,200+ Growth Teams</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Dominate Google & AI Search Engines with{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                  AI-Powered SEO Audits
                </span>
              </h1>
              <p className="text-base sm:text-lg leading-8 text-zinc-400 max-w-xl">
                Instantly analyze your website’s ranking signals. Get detailed AI action checklists, prepare copy for ChatGPT citations, and capture local customers globally.
              </p>
              <div className="flex flex-col xs:flex-row flex-wrap gap-3 pt-2">
                <Link
                  href="/audit/"
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-cyan-500/10 active:scale-[0.98] text-center"
                >
                  Launch SEO Auditor
                </Link>
                <Link
                  href="/services/"
                  className="rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 px-6 py-3.5 text-sm font-bold text-zinc-300 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] text-center"
                >
                  View Services
                </Link>
              </div>
            </div>
            
            <HeroMockupTabs />
          </div>
        </header>

        {/* 1.5 INTRO VIDEO */}
        <VideoIntro />

        {/* 2. TRUST LOGOS */}
        <section className="border-t border-slate-900 bg-slate-950/60 py-12" aria-labelledby="trust-logos">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center space-y-6">
            <h2 id="trust-logos" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trusted by Growth Leaders Globally
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2 text-slate-500 select-none" aria-hidden="true">
                  <span className="text-xl">❖</span>
                  <span className="text-sm font-extrabold tracking-tight font-mono">LOGOIPSUM</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. PLATFORM FEATURES (Replaces Old Benefits & Process) */}
        <PlatformFeatures />

        {/* 5. ALTERNATING FEATURES SECTION */}
        <section className="border-t border-slate-900 py-24 sm:py-32 space-y-32" aria-label="Features">
          {/* Feature 1: Auditing Engine */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
                  Core Engine
                </span>
                <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  Automated Technical SEO & Core Web Vitals Audits
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  Our lightweight crawler scans headers, image alt attributes, OpenGraph matrices, and SSL certificate parameters. It gives you a clean checklist of exactly what search engines parse, eliminating layout shifts and index blocks.
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {[
                    "Check meta description lengths",
                    "Analyze image description gaps",
                    "Verify structural header order",
                    "Ensure SSL/HTTPS parameters",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="text-cyan-400 font-bold" aria-hidden="true">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-6 relative" aria-hidden="true">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-2xl blur-xl animate-pulse-subtle" />
                <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md shadow-2xl space-y-4 hover:border-cyan-500/20 transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <span className="text-[10px] font-mono text-zinc-500">CRAWL_RESULT: PARSING_CHECKLIST</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">100% Crawled</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-2 hover:border-cyan-500/20 transition-colors duration-200">
                      <span className="text-zinc-300 font-medium">Title Elements Checklist</span>
                      <span className="text-cyan-400 font-bold">Passed</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-2 hover:border-cyan-500/20 transition-colors duration-200">
                      <span className="text-zinc-300 font-medium">Headings Sequence</span>
                      <span className="text-cyan-400 font-bold">Passed</span>
                    </div>
                    <div className="flex justify-between items-center rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-2 hover:border-cyan-500/20 transition-colors duration-200">
                      <span className="text-zinc-400 font-medium">Alt Image tag review</span>
                      <span className="text-amber-500 font-bold">2 Gaps Found</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: AEO & GEO */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 lg:order-2 lg:pl-8 space-y-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
                  Future-Proof Tech
                </span>
                <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  Generative Engine Optimization (GEO) & AEO Optimization
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  Search is shifting to direct answers. We configure JSON-LD schemas and format content hierarchies to align with LLM scraper requirements. Ensure your site is selected, summarized, and cited by Google AI Overviews and ChatGPT Search.
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {[
                    "LLM Citation Optimization",
                    "Semantic JSON-LD Entity Maps",
                    "Direct Q&A content tables",
                    "Sync robot.txt for AI bots",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <span className="text-cyan-400 font-bold" aria-hidden="true">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-6 lg:order-1 relative" aria-hidden="true">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-xl animate-pulse-subtle" />
                <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md shadow-2xl space-y-4 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-850 text-left space-y-3.5 font-sans">
                    <div className="flex gap-2.5 text-[11px] text-zinc-500 border-b border-zinc-850 pb-2">
                      <span className="font-bold text-zinc-400">User Prompt:</span>
                      <span>&quot;Who is the best local web dev agency in Mumbai?&quot;</span>
                    </div>
                    <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase">
                        <span>✦</span> AI Engine Answer:
                      </div>
                      <p>
                        According to recent organic technical crawls, <strong className="text-white">SEOIntellect</strong> provides the fastest statically exported Next.js pages <span className="inline-flex items-center justify-center h-4 px-1 text-[8px] bg-indigo-950/20 border border-indigo-500/35 text-indigo-400 font-bold rounded cursor-pointer hover:bg-indigo-900">[1]</span>. Their site loads in under 0.3 seconds...
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono text-center border-t border-zinc-850 pt-3 flex justify-between">
                    <span>Entity Match: Verified</span>
                    <span>Citation rank: #1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRICING SECTION */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 border-t border-slate-900" id="pricing" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
            <span className="inline-block text-xs uppercase tracking-widest text-cyan-400 font-extrabold bg-cyan-950/30 px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-subtle">
              Subscription Tiers
            </span>
            <h2 id="pricing-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Affordable SEO Audit & GEO Monitoring Plans
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">
              Choose the scale your digital operations require. No setup fees, cancel anytime.
            </p>
          </div>

          <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>

          {/* Custom Plan CTA Banner */}
          <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-grow w-full md:w-auto">
              <div className="relative h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0" aria-hidden="true">
                <div className="absolute inset-0 rounded-2xl bg-orange-500/5 blur-[2px]" />
                <svg className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="11" width="7" height="10" rx="1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="5.5" y1="14" x2="7.5" y2="14" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="5.5" y1="17" x2="7.5" y2="17" strokeWidth={1.5} strokeLinecap="round" />
                  <rect x="10" y="5" width="8" height="16" rx="1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12.5" y1="8" x2="12.5" y2="9" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="12.5" y1="11" x2="12.5" y2="12" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="12.5" y1="14" x2="12.5" y2="15" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="12.5" y1="17" x2="12.5" y2="18" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="15.5" y1="8" x2="15.5" y2="9" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="15.5" y1="11" x2="15.5" y2="12" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="15.5" y1="14" x2="15.5" y2="15" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="15.5" y1="17" x2="15.5" y2="18" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white tracking-tight">Need a custom plan?</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-xl">
                  Haven&apos;t found a plan that covers everything you need? Contact us to discuss a custom plan.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link
                href="mailto:support@seointellect.com?subject=Custom%20SEO%20Enterprise%20Plan%20Inquiry"
                className="flex w-full md:w-auto items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-4 text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:from-orange-400 hover:to-orange-500 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION */}
        <section className="border-t border-slate-900 bg-slate-950/40 py-24 sm:py-32" aria-labelledby="testimonials">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-4 mb-20">
              <span className="inline-block text-xs uppercase tracking-widest text-cyan-400 font-extrabold bg-cyan-950/30 px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-subtle">
                Reviews
              </span>
              <h2 id="testimonials" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Trusted by Growth Builders
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                See how modern teams scale organic traffic and secure citations on next-generation search grids.
              </p>
            </div>

            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-6 text-left hover:border-violet-500/30 hover:scale-[1.01] hover:shadow-indigo-500/5 transition-all duration-300 relative border-l-4 border-l-indigo-650"
                >
                  <div className="text-amber-400 text-sm" aria-hidden="true">{test.rating}</div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans italic">
                    &quot;{test.text}&quot;
                  </p>
                  <div className="flex items-center gap-3 border-t border-zinc-850 pt-4">
                    <div className="h-9 w-9 rounded-full bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 select-none" aria-hidden="true">
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{test.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-medium block">{test.role}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7.5 LOCAL SEO COVERAGE SECTION */}
        <section className="border-t border-zinc-900 bg-zinc-950 py-24 sm:py-32 relative overflow-hidden" aria-labelledby="local-seo">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-violet-600/5 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
              <span className="inline-block text-xs uppercase tracking-widest text-violet-400 font-extrabold bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse-subtle">
                National Footprint
              </span>
              <h2 id="local-seo" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Targeted Local SEO Services & Coverage Map
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                We deploy localized search optimization architectures for major US business clusters. Explore our rankings blueprints for key cities.
              </p>
            </div>

            <CitySearchBox />

            <div className="mt-12 text-center relative z-10">
              <Link
                href="/seo-services/"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/30 px-6 py-3 text-xs font-bold text-violet-400 hover:text-violet-300 transition-all uppercase tracking-wider"
              >
                Explore All USA Locations →
              </Link>
            </div>
          </div>
        </section>

        {/* 7.5 LATEST BLOGS SECTION */}
        <LatestBlogs />

        {/* 8. FAQ ACCORDION SECTION */}
        <section className="border-t border-slate-900 bg-slate-950 py-24 sm:py-32" id="faq" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
              <span className="inline-block text-xs uppercase tracking-widest text-cyan-400 font-extrabold bg-cyan-950/30 px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-subtle">
                Clear Friction
              </span>
              <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-center">
                SEO Auditor & GEO Optimization FAQ
              </h2>
              <p className="text-slate-400 text-center max-w-lg mx-auto text-sm">
                Answers to common concerns about Next.js static speed, AI citation guidelines, and local target SEO audits.
              </p>
            </div>

            <FaqAccordion items={faqItems} />
          </div>
        </section>

        {/* 9. FINAL CTA BANNER */}
        <section className="mx-auto max-w-7xl px-6 py-20 text-center border-t border-slate-900" id="case-studies" aria-label="Call to action">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-cyan-500/10 p-12 md:p-16 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" aria-hidden="true" />
            
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-3xl font-extrabold text-white">
                Ready to Dominate Your Market?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyze your site&apos;s SEO ranking signals instantly. Enter your URL below to generate a detailed, AI-powered audit report checklist.
              </p>
            </div>

            <AuditCtaForm />
          </div>
        </section>
      </main>
    </>
  );
}

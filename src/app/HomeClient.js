"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { citiesDb } from "@/data/cities";
import PricingCard from "@/components/PricingCard";

export default function HomeClient() {
  const [url, setUrl] = useState("");
  const [activeMockupTab, setActiveMockupTab] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const router = useRouter();

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    router.push(`/audit/?url=${encodeURIComponent(targetUrl)}`);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const services = [
    {
      title: "AI-Powered SEO Audits",
      desc: "Get instantaneous, detailed audits compiling HTML structure, meta headers, speed scores, and custom AI action items.",
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      link: "/services/#seo",
    },
    {
      title: "AEO & GEO Optimization",
      desc: "Prepare your content for citation in Google AI Overviews, ChatGPT Search, Perplexity, and Gemini response frameworks.",
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      link: "/services/#aeo-geo",
    },
    {
      title: "Hyper-Targeted Local SEO",
      desc: "Dominate search results in specific cities across the USA using our dynamic location landing pages.",
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: "/seo-services/new-york/",
    },
    {
      title: "High-Performance Web Dev",
      desc: "Fast load times are critical for Google. We build custom, statically exported Next.js websites tailored for optimal speed.",
      icon: (
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      link: "/services/#web-dev",
    },
  ];

  const featuredCities = [
    { name: "New York", code: "new-york", flag: "🇺🇸" },
    { name: "Los Angeles", code: "los-angeles", flag: "🇺🇸" },
    { name: "Chicago", code: "chicago", flag: "🇺🇸" },
    { name: "Houston", code: "houston", flag: "🇺🇸" },
    { name: "Phoenix", code: "phoenix", flag: "🇺🇸" },
    { name: "San Francisco", code: "san-francisco", flag: "🇺🇸" },
  ];

  const pricingPlans = [
    {
      name: "Free Audit Plan",
      price: "$0",
      period: "/once (no account)",
      desc: "Analyze any public page immediately to parse structural HTML and core performance benchmarks.",
      features: [
        "1 standard ad-hoc SEO crawl",
        "PageSpeed performance check",
        "Critical tags & checklist",
        "Interactive web-view report",
        "Basic online audit advice",
      ],
      buttonText: "Run Free Audit",
      href: "/audit",
      popular: false,
    },
    {
      name: "PDF Report Packs",
      price: "$29",
      period: "/once (saves to account)",
      desc: "Unlock downloadable client PDF reports and multi-page packages for comprehensive domain checks.",
      features: [
        "Single PDF Download ($29)",
        "3-Page Audit Package ($59)",
        "Saves reports to account",
        "SEO Consulting call option",
        "No recurring fees or contracts",
      ],
      buttonText: "Get Report Packs",
      href: "/checkout?plan=pack",
      popular: false,
    },
    {
      name: "Weekly Monitoring",
      price: "$49",
      period: "/month (recurring)",
      desc: "Automate your search monitoring. Let our engine run scans every Monday morning and notify you of drops.",
      features: [
        "Weekly background audits",
        "Email alerts on metrics drop",
        "Interactive score trend lines",
        "Access report history",
        "Requires account creation",
      ],
      buttonText: "Start Monitoring",
      href: "/checkout?plan=weekly",
      popular: true,
    },
    {
      name: "White-Label Agency",
      price: "$99",
      period: "/month (recurring)",
      desc: "Ideal for agencies pitching clients. Generate custom PDF audit files featuring your logo and agency name.",
      features: [
        "Up to 5 monitored domains",
        "Custom agency logo & name",
        "Branded client PDF exports",
        "Remove SEOIntellect logo",
        "Headless report delivery API",
      ],
      buttonText: "Go White-Label",
      href: "/checkout?plan=agency",
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
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-300">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />

      {/* Glow Rings */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 left-10 -z-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" />

      {/* 1. HERO SECTION */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Rating Badge */}
            <div className="inline-flex items-center gap-x-2.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-4 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-sm select-none transition-all duration-300 hover:border-cyan-500/40">
              <span className="flex text-amber-400">★★★★★</span>
              <span className="h-3 w-px bg-zinc-800" />
              <span>5.0 Rating by 1,200+ Growth Teams</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              Dominate Search Engines with{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                AI-Powered SEO
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg leading-8 text-zinc-400 max-w-xl">
              Instantly analyze your website’s ranking signals. Get detailed AI action checklists, prepare copy for ChatGPT citations, and capture local customers globally.
            </p>

            {/* Action Buttons */}
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

          {/* Hero Right: Live Interactive Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur opacity-25 animate-pulse-subtle" />
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-lg shadow-2xl space-y-6 transition-all duration-500 hover:scale-[1.01] hover:border-violet-500/30">
              
              {/* Simulated Browser Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 flex-shrink-0" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 flex-shrink-0" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 flex-shrink-0" />
                  <span className="ml-2 text-[9px] font-mono text-zinc-550 select-none hidden xs:inline">
                    ENGINE_STATUS: ACTIVE
                  </span>
                </div>
                <div className="flex gap-1.5 bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded-lg flex-shrink-0">
                  <span className="h-2 w-2 rounded-full bg-cyan-450 animate-pulse mt-1 flex-shrink-0" />
                  <span className="text-[10px] font-mono text-zinc-400 select-none truncate max-w-[100px] sm:max-w-none">
                    mysite-audit.com
                  </span>
                </div>
              </div>

              {/* Tabs Selectors */}
              <div className="flex border-b border-zinc-800 pb-px gap-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "inspector", label: "Meta Inspector" },
                  { id: "performance", label: "Performance" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMockupTab(tab.id)}
                    className={`pb-2.5 text-xs font-bold transition-all duration-200 border-b-2 px-2.5 cursor-pointer relative ${
                      activeMockupTab === tab.id
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Interactive Tab Panels */}
              {activeMockupTab === "overview" && (
                <div className="space-y-5 animate-[slideDown_0.25s_ease-out]">
                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Grade Card */}
                    <div className="col-span-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-center space-y-1 hover:border-cyan-500/30 transition-all duration-300">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Grade</span>
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-500 block drop-shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                        A
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium block">Top 5%</span>
                    </div>
                    {/* Score Parameters */}
                    <div className="col-span-2 space-y-2.5">
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                        <span>Average SEO Score</span>
                        <span className="text-cyan-400 font-extrabold">94%</span>
                      </div>
                      <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" style={{ width: "94%" }} />
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Domain matches 34 out of 36 standard search indexing requirements.
                      </p>
                    </div>
                  </div>

                  {/* AI reviewer panel */}
                  <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4 space-y-1.5 hover:bg-indigo-500/10 transition-colors duration-300">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                      Assessment
                    </span>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans italic">
                      &quot;HTML structure is highly crawlable. Heading sequence matches search recommendations. Recommended fix: Add Schema Organization markup to verify entities on ChatGPT and Perplexity citation grids.&quot;
                    </p>
                  </div>
                </div>
              )}

              {activeMockupTab === "inspector" && (
                <div className="space-y-3.5 max-h-48 overflow-y-auto animate-[slideDown_0.25s_ease-out] pr-1">
                  {[
                    { status: "pass", label: "Title tag length (58 chars) - Optimal" },
                    { status: "warning", label: "Meta description is too long (185 chars) - Target: < 160" },
                    { status: "pass", label: "Canonical URL reference configured" },
                    { status: "pass", label: "H1 sequence configured: 'Unlocking Organic SaaS...'" },
                    { status: "warning", label: "3 image assets missing descriptive alt labels" },
                    { status: "pass", label: "OpenGraph tags parsed successfully" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-zinc-850 bg-zinc-950/40 p-2.5 text-xs transition-colors duration-200 hover:bg-zinc-900/30">
                      {item.status === "pass" ? (
                        <span className="text-emerald-400 font-bold text-sm leading-none">✓</span>
                      ) : (
                        <span className="text-amber-500 font-bold text-sm leading-none">⚠</span>
                      )}
                      <span className={item.status === "pass" ? "text-zinc-300" : "text-zinc-400 font-medium"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeMockupTab === "performance" && (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 animate-[slideDown_0.25s_ease-out]">
                  {[
                    { name: "Speed Index", value: "0.4s", score: 99 },
                    { name: "First Contentful Paint", value: "0.2s", score: 98 },
                    { name: "Largest Contentful Paint", value: "1.1s", score: 95 },
                    { name: "Cumulative Layout Shift", value: "0.01", score: 100 },
                  ].map((metric) => (
                    <div key={metric.name} className="rounded-xl border border-zinc-850 bg-zinc-950 p-4 space-y-2 hover:border-cyan-500/20 transition-all duration-300">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{metric.name}</span>
                        <span className="text-[11px] text-cyan-400 font-bold">{metric.value}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-medium">Score:</span>
                        <span className="font-extrabold text-emerald-400">{metric.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 text-[10px] text-zinc-500 gap-2">
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-450" />
                  SSL Certified
                </span>
                <span className="text-right">Audit compiled in 18s</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. TRUST LOGOS / AUTHORITY BAR */}
      <div className="border-t border-slate-900 bg-slate-950/60 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Trusted by Growth Leaders Globally
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors select-none">
                <span className="text-xl">❖</span>
                <span className="text-sm font-extrabold tracking-tight font-mono">LOGOIPSUM</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BENEFITS SECTION */}
      <div className="border-t border-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-20">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/10">
              Why Choose SEOIntellect
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Engineered for Real Ranking Outcomes
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              Skip generic advice. Our system focuses on technical factors that directly impact crawling, speed indexing, and organic visibility.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Driven Checklists",
                desc: "Get code-ready HTML improvements and semantic guidelines tailored specifically for your site's structure.",
                icon: (
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
              {
                title: "Targeted Local Hubs",
                desc: "Deploy lightning-fast location pages to index and capture high-value queries in 700+ cities globally.",
                icon: (
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: "Statically Exported Speed",
                desc: "Pass Core Web Vitals automatically. Next.js static exports load in 0.3s and eliminate database latency.",
                icon: (
                  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/30 hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-850">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PROCESS SECTION */}
      <div className="border-t border-slate-900 bg-slate-950/40 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-20">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold bg-indigo-950/30 px-3.5 py-1.5 rounded-full border border-indigo-500/10">
              The Blueprint
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Our 3-Step Growth Process
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              A streamlined, friction-free lifecycle built to take your site from crawl-blocked to search-engine dominated.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((step, index) => (
              <div
                key={step.num}
                className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 space-y-4 relative group"
              >
                <span className="absolute top-6 right-8 text-5xl font-black text-slate-800/20 select-none font-mono">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors pt-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ALTERNATING FEATURES SECTION */}
      <div className="border-t border-slate-900 py-24 sm:py-32 space-y-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Feature 1: Auditing Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Column 1: Info */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-semibold text-cyan-400">
                Core Engine
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Automated Metadata & Structure Audits
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
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Mockup */}
            <div className="lg:col-span-6 relative">
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
            
            {/* Column 1: Mockup on Left */}
            <div className="lg:col-span-6 lg:order-2 lg:pl-8 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
                Future-Proof Tech
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Generative AI Engine Optimization (GEO)
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
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Simulated AI Citation UI */}
            <div className="lg:col-span-6 lg:order-1 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-xl animate-pulse-subtle" />
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md shadow-2xl space-y-4 hover:border-indigo-500/20 transition-all duration-300">
                
                {/* Simulated ChatGPT chat screen */}
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
      </div>

      {/* 6. PRICING SECTION */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 border-t border-slate-900" id="pricing">
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/10">
            Subscription Tiers
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, Transparent Pricing Plans
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
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-grow w-full md:w-auto">
            {/* Building Outline Icon with rounded circular background */}
            <div className="relative h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
              {/* Subtle background glow */}
              <div className="absolute inset-0 rounded-2xl bg-orange-500/5 blur-[2px]" />
              <svg className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Left/Front building */}
                <rect x="3" y="11" width="7" height="10" rx="1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <line x1="5.5" y1="14" x2="7.5" y2="14" strokeWidth={1.5} strokeLinecap="round" />
                <line x1="5.5" y1="17" x2="7.5" y2="17" strokeWidth={1.5} strokeLinecap="round" />
                
                {/* Right/Back building */}
                <rect x="10" y="5" width="8" height="16" rx="1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                {/* Windows of back building */}
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
              <h4 className="text-xl font-bold text-white tracking-tight">Need a custom plan?</h4>
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
      </div>

      {/* 7. TESTIMONIALS SECTION */}
      <div className="border-t border-slate-900 bg-slate-950/40 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4 mb-20">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/10">
              Reviews
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-6 text-left hover:border-violet-500/30 hover:scale-[1.01] hover:shadow-indigo-500/5 transition-all duration-300 relative border-l-4 border-l-indigo-650"
              >
                <div className="text-amber-400 text-sm">{test.rating}</div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans italic">
                  &quot;{test.text}&quot;
                </p>
                <div className="flex items-center gap-3 border-t border-zinc-850 pt-4">
                  <div className="h-9 w-9 rounded-full bg-indigo-950/45 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 select-none">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-medium block">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7.5 LOCAL SEO COVERAGE SECTION */}
      <div className="border-t border-zinc-900 bg-zinc-950 py-24 sm:py-32 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-violet-600/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <span className="inline-block text-xs uppercase tracking-widest text-violet-400 font-extrabold bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse-subtle">
              National Footprint
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Local SEO Service Coverage
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              We deploy localized search optimization architectures for major US business clusters. Explore our rankings blueprints for key cities.
            </p>
            
            {/* City Search Box */}
            <div className="max-w-md mx-auto mt-8 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search your city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-full py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all backdrop-blur-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {(citySearch.trim() === "" 
              ? [
                  { name: "New York", slug: "new-york", abbr: "NY", color: "group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]" },
                  { name: "Los Angeles", slug: "los-angeles", abbr: "LA", color: "group-hover:border-orange-500/30 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]" },
                  { name: "Chicago", slug: "chicago", abbr: "CH", color: "group-hover:border-sky-500/30 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]" },
                  { name: "Houston", slug: "houston", abbr: "HO", color: "group-hover:border-rose-500/30 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]" },
                  { name: "Phoenix", slug: "phoenix", abbr: "PH", color: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]" },
                  { name: "San Diego", slug: "san-diego", abbr: "SD", color: "group-hover:border-teal-500/30 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]" },
                  { name: "San Jose", slug: "san-jose", abbr: "SJ", color: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]" },
                  { name: "Austin", slug: "austin", abbr: "AU", color: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]" }
                ]
              : Object.entries(citiesDb)
                  .filter(([slug, data]) => data.name.toLowerCase().includes(citySearch.toLowerCase()))
                  .slice(0, 8)
                  .map(([slug, data]) => ({
                    name: data.name,
                    slug: slug,
                    abbr: data.name.substring(0, 2).toUpperCase(),
                    color: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                  }))
            ).map((city) => (
              <Link
                key={city.slug}
                href={`/seo-services/${city.slug}/`}
                className={`group rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-500 relative overflow-hidden h-40 sm:h-44 hover:-translate-y-1 ${city.color}`}
              >
                {/* Premium Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center gap-5">
                  {/* Luxury Monogram Logo */}
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-zinc-700/50 bg-zinc-900/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] flex items-center justify-center group-hover:border-zinc-500/50 transition-colors duration-500">
                    <span className="text-sm sm:text-base font-mono font-medium tracking-widest text-zinc-400 group-hover:text-white transition-colors duration-500">
                      {city.abbr}
                    </span>
                  </div>
                  
                  {/* Typography */}
                  <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors duration-500">
                    {city.name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 8. FAQ ACCORDION SECTION */}
      <div className="border-t border-slate-900 bg-slate-950 py-24 sm:py-32" id="faq">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/10">
              Clear Friction
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-center max-w-lg mx-auto text-sm">
              Answers to common concerns about Next.js static speed, AI citation guidelines, and local target SEO audits.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-850 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex items-center justify-between w-full p-6 text-sm font-bold text-white select-none cursor-pointer focus:outline-none"
                >
                  <span className="text-left">{item.q}</span>
                  <span className={`text-xs text-slate-500 transform transition-transform duration-200 ${expandedFaq === idx ? "rotate-180 text-cyan-400" : ""}`}>
                    ▼
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    expandedFaq === idx ? "max-h-48 border-t border-slate-900" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-xs text-slate-400 leading-relaxed bg-slate-950/40">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. FINAL CTA BANNER */}
      <div className="mx-auto max-w-7xl px-6 py-20 text-center border-t border-slate-900" id="case-studies">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 border border-cyan-500/10 p-12 md:p-16 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to Dominate Your Market?
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyze your site&apos;s SEO ranking signals instantly. Enter your URL below to generate a detailed, AI-powered audit report checklist.
            </p>
          </div>

          {/* Audit URL input form */}
          <form onSubmit={handleAuditSubmit} className="mx-auto max-w-md">
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-2 backdrop-blur-md focus-within:border-cyan-500/50 transition-colors">
              <input
                type="text"
                required
                placeholder="e.g., mysite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-[0.98] flex-shrink-0"
              >
                Analyze Now
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 text-center sm:text-left sm:pl-3">
              Instant scan. No credit card required.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

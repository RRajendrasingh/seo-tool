"use client";

import Link from "next/link";

export default function ServicesClient() {
  const serviceDetails = [
    {
      id: "seo",
      title: "Search Engine Optimization (SEO)",
      badge: "Organic Traffic",
      description:
        "Dominate standard search engine result pages, drive organic keywords, and secure top rankings. We focus on search intent mapping, localized content arrays, and technical structure.",
      features: [
        "Dynamic Location-Specific Targeting",
        "Technical SEO Auditing & Optimization",
        "Keyword Research & Search Intent Mapping",
        "On-Page and Schema Markup Setup",
        "Content Blueprinting & Semantic Writing",
      ],
      color: "from-violet-500 to-fuchsia-500",
      icon: (
        <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      id: "aeo-geo",
      title: "AI Search Optimization (AEO & GEO)",
      badge: "Cutting-Edge Innovation",
      description:
        "Optimize your website's data structures so that generative AI answer engines (like ChatGPT Search, Google AI Overviews, Perplexity, and Gemini) extract and cite your website as the primary source.",
      features: [
        "LLM Citation Optimization & Schema Hubs",
        "Direct Q&A Content Structure Formatting",
        "AI Crawler (GPTBot, ClaudeBot) robots.txt Syncing",
        "JSON-LD Semantic Entity Mapping",
        "Generative Search Engine optimization (GEO)",
      ],
      color: "from-fuchsia-500 to-violet-500",
      icon: (
        <svg className="h-6 w-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: "web-dev",
      title: "High-Performance Web Development",
      badge: "Core Engineering",
      description:
        "Google uses page loading speed as a major mobile ranking factor. We build custom React and Next.js websites optimized for near-perfect Core Web Vitals scores.",
      features: [
        "Statically Exported Next.js Web Frameworks",
        "Responsive, Modern Styling with Tailwind CSS",
        "Near-zero layout shifts and lightning-fast LCP",
        "Highly Optimized Responsive Layouts",
        "CMS Integrations (Headless WordPress, Sanity, etc.)",
      ],
      color: "from-fuchsia-500 to-cyan-500",
      icon: (
        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: "saas",
      title: "SaaS & Custom Application Development",
      badge: "SaaS Specialist",
      description:
        "Build proprietary tools, automation pipelines, and subscription databases. We handle backend databases, user authorization, and payment gateways.",
      features: [
        "Interactive Audits & Automated Report Builders",
        "Secure Stripe Payment Gateway",
        "MongoDB / SQL Database Management",
        "Serverless Cloud API Endpoints",
        "Real-time Dashboard & Reporting Interfaces",
      ],
      color: "from-cyan-500 to-emerald-500",
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  const pricingPlans = [
    {
      name: "Starter Plan",
      price: "$99",
      desc: "Essential search auditing and location targeting for growing websites looking to establish ranking signals.",
      features: [
        "Instant basic HTML tags parser",
        "100+ critical fixes checklist",
        "Mobile loading speed check",
        "Single city landing template",
        "Email support response in 48h",
      ],
      buttonText: "Get Started Now",
      href: "/audit/",
      popular: false,
    },
    {
      name: "Pro Optimizer",
      price: "$149",
      desc: "Our gold standard. Deep automated crawling, AI summaries, core web vitals optimization, and full GEO readiness reports.",
      features: [
        "Full PageSpeed & HTML crawl",
        "AI executive checklists (GPT-4o)",
        "AEO & GEO citation builder",
        "5 location-specific page templates",
        "Priority Slack/Email support",
        "Downloadable PDF white-labels",
      ],
      buttonText: "Try Pro Free",
      href: "/audit/?plan=premium",
      popular: true,
    },
    {
      name: "Enterprise Growth",
      price: "$299",
      desc: "Complete organic dominance package. Direct developer integrations, custom entity mapping, and headless hosting solutions.",
      features: [
        "Unlimited custom crawlers",
        "Static Next.js migration setup",
        "JSON-LD Org schema graphs",
        "Unlimited local page targets",
        "1-on-1 monthly consultations",
        "Direct database integration API",
      ],
      buttonText: "Go Enterprise",
      href: "/checkout/",
      popular: false,
    },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate overflow-x-hidden">
      {/* Glow effect */}
      <div className="absolute top-10 right-10 -z-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 -z-10 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          High-Value Services Designed to Perform
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
          Transform your digital footprint with custom engineering, location targeting, and modern AI engine optimization.
        </p>
      </div>

      {/* Core Services Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 space-y-16 sm:space-y-20">
        {serviceDetails.map((service, idx) => (
          <div
            key={service.id}
            id={service.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-zinc-900 pb-12 sm:pb-16 last:border-b-0"
          >
            {/* Column 1: Info */}
            <div className={`lg:col-span-7 space-y-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-3 py-1 text-xs font-semibold text-violet-300">
                {service.badge}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white sm:text-3xl flex items-start sm:items-center gap-3 flex-wrap">
                <span className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  {service.icon}
                </span>
                <span>{service.title}</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">{service.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {service.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <svg
                      className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Visual Card */}
            <div className={`lg:col-span-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
              <div
                className={`rounded-3xl bg-gradient-to-br ${service.color} p-0.5 shadow-2xl shadow-violet-500/5`}
              >
                <div className="rounded-[22px] bg-zinc-950 p-6 sm:p-8 space-y-6">
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
                    Market Focus
                  </span>
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-white">The Rise of Generative AI Search</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      By 2027, over 50% of search traffic is estimated to occur on generative response engines. Traditional keywords are shifting to conversational queries. Optimizing for AEO and GEO ensures your brand is chosen by LLMs to fulfill search requests.
                    </p>
                  </div>
                  <div className="h-px bg-zinc-850" />
                  <Link
                    href="/audit/"
                    className="flex items-center justify-between text-xs font-bold text-white hover:text-violet-400 transition-colors group"
                  >
                    <span>Audit your site’s AEO readiness</span>
                    <svg
                      className="h-4.5 w-4.5 text-zinc-500 group-hover:text-violet-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 border-t border-zinc-900 pt-24" id="plans">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Audit Plans & SEO Blueprints
          </h2>
          <p className="text-base text-zinc-400 max-w-lg mx-auto">
            Choose the right plan to get started. Build localized, crawlable pages or run instant AI SEO audits.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl bg-zinc-900/40 border backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden ${
                plan.popular
                  ? "border-t-4 border-t-green-500 border-x-zinc-800 border-b-zinc-800 shadow-2xl shadow-cyan-400/5"
                  : "border-t-4 border-t-emerald-450 border-x-zinc-800 border-b-zinc-800"
              }`}
            >
              {/* Diagonal Ribbon Offer */}
              <div className="absolute top-0 right-0 h-20 w-20 overflow-hidden select-none pointer-events-none">
                <div className={`absolute top-3 -right-7 w-24 rotate-45 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white shadow-sm bg-gradient-to-r ${
                  plan.popular ? "from-orange-600 to-red-500" : "from-blue-600 to-blue-500"
                }`}>
                  Offer
                </div>
              </div>

              <div className="p-8 space-y-6 text-left flex-grow">
                {/* Badge for Popular */}
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/5 px-2 py-0.5 text-[9px] font-bold text-green-500 uppercase tracking-wide">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <svg className="h-4.5 w-4.5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="flex items-baseline text-white pt-2 border-t border-zinc-800/40">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {plan.price === "Free" ? "Free" : `US${plan.price}`}
                  </span>
                  {plan.price !== "Free" && <span className="ml-1 text-[10px] font-semibold text-zinc-500">/month (billed yearly)</span>}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">{plan.desc}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 pb-8 space-y-4">
                <Link
                  href={plan.href}
                  className={`flex w-full items-center justify-center rounded-xl py-3.5 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-600/25"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/15"
                  }`}
                >
                  {plan.buttonText}
                </Link>
                <div className="text-center">
                  <button className="text-[10px] font-bold text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer">
                    See more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Localized SEO Target Cities Banner */}
        <div className="mx-auto max-w-4xl mt-16 text-center border-t border-zinc-900 pt-8 px-4">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Our SEO services and GEO algorithms are specifically customized for major local markets including{" "}
            <Link href="/seo-services/new-york/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">New York</Link>,{" "}
            <Link href="/seo-services/los-angeles/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Los Angeles</Link>,{" "}
            <Link href="/seo-services/chicago/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Chicago</Link>,{" "}
            <Link href="/seo-services/houston/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Houston</Link>,{" "}
            <Link href="/seo-services/austin/" className="text-zinc-400 hover:text-violet-400 font-semibold transition-colors">Austin</Link>, and other business clusters.{" "}
            <Link href="/seo-services/" className="text-violet-400 hover:text-violet-300 font-bold underline transition-colors">
              Explore All USA Locations →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

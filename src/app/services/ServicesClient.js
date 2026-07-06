"use client";

import Link from "next/link";
import PricingCard from "@/components/PricingCard";
import { useState, useEffect } from "react";
import { openCalendly } from "@/utils/calendly";

export default function ServicesClient() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.session) {
          setUser(data.session);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
      }
    }
    fetchSession();
  }, []);

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
      marketFocusTitle: "Local SEO & Location Targeting",
      marketFocusDesc: "Optimizing your footprint for local searches drives 3x more qualified leads. Implementing localized schema and city landing pages enables search engines to map your services to regional intent.",
      marketFocusLinkText: "Explore our local SEO location pages",
      marketFocusHref: "/seo-services/",
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
      marketFocusTitle: "The Rise of Generative AI Search",
      marketFocusDesc: "By 2027, over 50% of search traffic is estimated to occur on generative response engines. Traditional keywords are shifting to conversational queries. Optimizing for AEO and GEO ensures your brand is chosen by LLMs to fulfill search requests.",
      marketFocusLinkText: "Audit your site’s AEO readiness",
      marketFocusHref: "/audit/",
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
      marketFocusTitle: "Core Web Vitals & Loading Speed",
      marketFocusDesc: "Google's page experience ranking metrics favor websites with a Largest Contentful Paint under 2.5s and zero layout shifts. Statically exported builds load Edge-cached code instantly to maximize retention.",
      marketFocusLinkText: "Test your page loading score",
      marketFocusHref: "/audit/",
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
      marketFocusTitle: "Lead Generation Tools & Platforms",
      marketFocusDesc: "Proprietary software tools and custom audit scanners serve as highly effective marketing lead magnets. Secure payments and dashboards drive customer conversions and recurring subscriptions.",
      marketFocusLinkText: "Explore our dashboard portal",
      marketFocusHref: "/dashboard/",
    },
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

  return (
    <main className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate overflow-x-hidden">
      {/* Glow effect */}
      <div className="absolute top-10 right-10 -z-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 -z-10 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          High-Value Services Designed to Perform
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
          Transform your digital footprint with custom engineering, location targeting, and modern AI engine optimization.
        </p>
      </header>

      {/* Core Services Section */}
      <section aria-label="Our Services" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 space-y-16 sm:space-y-20">
        {serviceDetails.map((service, idx) => (
          <article
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
                    <h4 className="text-lg font-bold text-white">{service.marketFocusTitle}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {service.marketFocusDesc}
                    </p>
                  </div>
                  <div className="h-px bg-zinc-850" />
                  <Link
                    href={service.marketFocusHref}
                    className="flex items-center justify-between text-xs font-bold text-white hover:text-violet-400 transition-colors group"
                  >
                    <span>{service.marketFocusLinkText}</span>
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
          </article>
        ))}
      </section>

      {/* Pricing Section */}
      <section aria-labelledby="plans-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 border-t border-zinc-900 pt-24" id="plans">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h2 id="plans-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Audit Plans & SEO Blueprints
          </h2>
          <p className="text-base text-zinc-400 max-w-lg mx-auto">
            Choose the right plan to get started. Build localized, crawlable pages or run instant AI SEO audits.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        {/* Custom Plan CTA Banner */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-6xl mx-auto">
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

        {/* Free Consultation CTA Banner */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-grow w-full md:w-auto">
            {/* Calendar Icon with rounded circular background */}
            <div className="relative h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-violet-500/5 blur-[2px]" />
              <svg className="h-8 w-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="text-xl font-bold text-white tracking-tight">Free 1-on-1 Strategy Call</h4>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-xl">
                Book a complimentary video call with our expert SEO consultant to audit your site performance and plan your organic growth.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => openCalendly(user?.email || "", user?.name || "")}
              className="flex w-full md:w-auto items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-4 text-xs font-bold text-white shadow-md shadow-violet-500/10 hover:from-violet-500 hover:to-fuchsia-500 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider cursor-pointer border-0"
            >
              Book Strategy Call
            </button>
          </div>
        </div>

        {/* Localized SEO Target Cities Banner */}
        <aside aria-label="Local SEO Target Cities" className="mx-auto max-w-4xl mt-16 text-center border-t border-zinc-900 pt-8 px-4">
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
        </aside>
      </section>
    </main>
  );
}

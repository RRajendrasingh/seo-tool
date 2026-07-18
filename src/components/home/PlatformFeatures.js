"use client";

import React from "react";
import Link from "next/link";

export default function PlatformFeatures() {
  const stats = [
    { value: "1,200+", label: "Sites Analyzed" },
    { value: "100%", label: "Core Web Vitals" },
    { value: "99%", label: "Audit Accuracy" },
    { value: "20s", label: "Average Audit Time" },
  ];

  const workflow = [
    { title: "Audit", desc: "Run a complete SEO audit with 100+ technical checks" },
    { title: "AI Fixes", desc: "Get code-ready HTML improvements & semantic guidelines" },
    { title: "Deploy", desc: "Export Next.js static pages for 0.3s lightning load times" },
    { title: "Monitor", desc: "Track rankings, AEO citations, and weekly performance" },
  ];

  const features = [
    {
      title: "Lighthouse Audit",
      badge: "100+ Checks",
      desc: "Full technical SEO audit covering performance, accessibility, structured data, and crawlability.",
      cta: "Run Audit",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      title: "GEO & AEO Ready",
      badge: "AI Search",
      desc: "Align your entity graphs to be crawled and cited by generative AI search engines like Gemini and Claude.",
      cta: "Optimize Now",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      title: "SEO Services",
      badge: "Managed",
      desc: "Boost domain authority and organic footprint with professional, fully-managed SEO campaigns.",
      cta: "View Services",
      href: "/services/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      title: "Next.js Speed",
      badge: "Zero Latency",
      desc: "Pass Core Web Vitals automatically with blazing-fast statically exported HTML pages.",
      cta: "Test Speed",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      title: "Code-Ready Fixes",
      badge: "Checklists",
      desc: "Get prioritized, copy-paste ready HTML improvements to fix every semantic gap in your markup.",
      cta: "View Example",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      title: "Entity Schema",
      badge: "Structured Data",
      desc: "Establish undeniable semantic relationships with perfect JSON-LD schema injections.",
      cta: "Generate",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      title: "White-Label Reports",
      badge: "Agencies",
      desc: "Export gorgeous, branded PDF audit reports with your own logo to close more client sales.",
      cta: "View PDF",
      href: "/audit/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      title: "Background Monitor",
      badge: "Pro Tracking",
      desc: "Let our engines scan your domains weekly and send email alerts on any ranking or metrics drops.",
      cta: "Open Dashboard",
      href: "/dashboard/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
    },
  ];

  return (
    <section className="border-t border-zinc-900 bg-slate-950 py-24 sm:py-32 font-sans relative overflow-hidden" aria-label="Platform Features">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="mx-auto max-w-4xl text-center space-y-6 mb-12 sm:mb-20">
          <span className="inline-flex items-center gap-x-2 rounded-full border border-violet-500/25 bg-violet-500/5 px-5 py-1.5 text-xs font-bold text-violet-400 uppercase tracking-widest">
            All-in-One SEO Platform
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] [.light_&]:text-slate-900">
            Everything You Need to Rank in{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Google & AI Search
            </span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed [.light_&]:text-slate-500">
            SEOIntellect combines AI-powered audits, GEO entity mapping, dynamic local hubs, and statically exported performance optimization into one unified platform.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 sm:mb-24 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-2xl font-black text-white tracking-tight [.light_&]:text-slate-900">{stat.value}</div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider [.light_&]:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Workflow & Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Sidebar Timeline */}
          <div className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24 mb-10 lg:mb-0">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-7 border-b border-zinc-800/60 [.light_&]:border-slate-200 pb-3 [.light_&]:text-slate-400">SEO Workflow</h3>
            <div className="space-y-7 relative">
              <div className="absolute left-[11px] top-5 bottom-5 w-px bg-zinc-800 [.light_&]:bg-slate-200 z-0" />
              {workflow.map((step, i) => (
                <div key={i} className="flex gap-3.5 relative z-10">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-900 border border-zinc-700 [.light_&]:bg-white [.light_&]:border-slate-300 flex items-center justify-center text-[9px] font-black text-zinc-400 [.light_&]:text-slate-500 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white [.light_&]:text-slate-800">{step.title}</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed [.light_&]:text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {features.map((feat, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 flex flex-col gap-4 hover:border-violet-500/30 hover:bg-zinc-900/60 transition-all duration-300 [.light_&]:bg-white [.light_&]:border-slate-200 [.light_&]:hover:border-violet-300 [.light_&]:shadow-sm"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400 shrink-0 group-hover:bg-violet-500/15 transition-colors [.light_&]:bg-violet-50 [.light_&]:border-violet-100 [.light_&]:text-violet-600">
                  {feat.icon}
                </div>

                {/* Title & Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white [.light_&]:text-slate-900 leading-tight">{feat.title}</h3>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700/60 [.light_&]:bg-slate-100 [.light_&]:text-slate-500 [.light_&]:border-slate-200 whitespace-nowrap">
                    {feat.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 leading-relaxed flex-1 [.light_&]:text-slate-500">
                  {feat.desc}
                </p>

                {/* CTA */}
                <Link
                  href={feat.href}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 [.light_&]:text-violet-600 [.light_&]:hover:text-violet-700 flex items-center gap-1 group-hover:gap-2 transition-all duration-200 mt-auto"
                >
                  {feat.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted By */}
        <div className="mt-20 pt-10 border-t border-zinc-800/50 [.light_&]:border-slate-200 relative z-10">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest [.light_&]:text-slate-400">
              Trusted by SEO Professionals & Businesses Worldwide
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-10 sm:gap-x-16 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 select-none text-white [.light_&]:text-slate-900">
            <div className="text-xl font-bold font-sans tracking-tight">ahrefs</div>
            <div className="text-xl font-bold font-sans tracking-tight flex items-center gap-1"><span className="text-2xl -mt-1">☄</span> SEMRUSH</div>
            <div className="text-xl font-black font-sans tracking-tight">MOZ</div>
            <div className="text-xl font-bold font-sans tracking-tight">HubSpot</div>
            <div className="text-2xl font-serif italic font-bold">W</div>
            <div className="text-xl font-black tracking-tighter">vercel</div>
            <div className="text-xl font-bold flex flex-col items-center leading-none"><span className="text-2xl">☁</span><span className="text-[8px] uppercase tracking-widest">Cloudflare</span></div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl z-10 [.light_&]:bg-white [.light_&]:border-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-violet-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight [.light_&]:text-slate-900">Ready to outrank your competitors?</h3>
              <p className="text-sm text-zinc-400 mt-1 [.light_&]:text-slate-500">Start your free SEO audit and get actionable insights in seconds.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 shrink-0 w-full md:w-auto">
            <Link href="/audit/" className="w-full sm:w-auto rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 hover:scale-[1.02] transition-all text-center">
              Start Free Audit →
            </Link>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium [.light_&]:text-slate-500">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 [.light_&]:border-white z-30" />
                <div className="w-6 h-6 rounded-full bg-zinc-600 border-2 border-zinc-900 [.light_&]:border-white z-20" />
                <div className="w-6 h-6 rounded-full bg-zinc-500 border-2 border-zinc-900 [.light_&]:border-white z-10" />
              </div>
              Join 1,200+ happy users
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


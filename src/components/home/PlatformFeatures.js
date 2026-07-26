"use client";

import React from "react";
import Link from "next/link";

export default function PlatformFeatures() {
  const stats = [
    { value: "1,200+", label: "SITES ANALYZED" },
    { value: "100%", label: "CORE WEB VITALS" },
    { value: "99%", label: "AUDIT ACCURACY" },
    { value: "20s", label: "AVERAGE AUDIT TIME" },
  ];

  const workflow = [
    { num: "1", title: "Audit", desc: "Run a complete SEO audit with 100+ technical checks" },
    { num: "2", title: "AI Fixes", desc: "Get code-ready HTML improvements & semantic guidelines" },
    { num: "3", title: "Deploy", desc: "Export Next.js static pages for 0.3s lightning load times" },
    { num: "4", title: "Monitor", desc: "Track rankings, AEO citations, and weekly performance" },
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 border-t border-zinc-900 [.light_&]:border-slate-200 font-sans" aria-label="Platform Features">
      
      {/* Section Header */}
      <div className="max-w-3xl space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono tracking-widest uppercase rounded-md [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-600">
          ENGINEERED FOR GROWTH
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight [.light_&]:text-slate-900">
          Everything you need for traditional & AI search dominance.
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed [.light_&]:text-slate-600">
          SEOIntellect combines AI-powered audits, GEO entity mapping, dynamic local hubs, and statically exported performance optimization into one unified platform.
        </p>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-900 mb-12 [.light_&]:border-slate-200 font-mono">
        {stats.map((stat, i) => (
          <div key={i} className="text-left space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight [.light_&]:text-slate-900">{stat.value}</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-wider [.light_&]:text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Workflow & Bento Cards Layout (Equal Height Alignment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SEO Workflow Sidebar (Full Height Flex Container) */}
        <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between [.light_&]:bg-white [.light_&]:border-slate-300">
          <div>
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-6 pb-3 border-b border-zinc-800 [.light_&]:border-slate-200">
              SEO WORKFLOW
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-3 top-3 bottom-3 w-px bg-zinc-800 [.light_&]:bg-slate-200" />
              {workflow.map((step, i) => (
                <div key={i} className="flex gap-4 relative z-10 items-start">
                  <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-300 shrink-0 [.light_&]:bg-slate-100 [.light_&]:border-slate-300 [.light_&]:text-slate-700">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white [.light_&]:text-slate-900">{step.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 [.light_&]:text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom System Status Box (Fills the former empty gap) */}
          <div className="mt-8 pt-4 border-t border-zinc-800/80 [.light_&]:border-slate-200 font-mono text-[11px] text-zinc-400 flex items-center justify-between [.light_&]:text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Automated</span>
            </span>
            <span className="text-violet-400 font-semibold">Ready in 20s →</span>
          </div>
        </div>

        {/* Bento Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Card 1: GEO */}
          <div className="sm:col-span-2 rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 hover:border-zinc-700 transition-all flex flex-col justify-center [.light_&]:bg-white [.light_&]:border-slate-300">
            <div className="w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white [.light_&]:text-slate-900">Generative Engine Optimization (GEO)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1 [.light_&]:text-slate-600">
              Simulates how ChatGPT Search, Perplexity, and Google AI Overviews read your domain, offering structured fixes to ensure your brand is cited as an authority.
            </p>
          </div>

          {/* Card 2: White Label PDF */}
          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 hover:border-zinc-700 transition-all flex flex-col justify-center [.light_&]:bg-white [.light_&]:border-slate-300">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white [.light_&]:text-slate-900">White-Label PDF Reports</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1 [.light_&]:text-slate-600">
              Export branded, client-ready PDF audit reports with custom logos in one click.
            </p>
          </div>

          {/* Card 3: Automated Monitoring */}
          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 hover:border-zinc-700 transition-all flex flex-col justify-center [.light_&]:bg-white [.light_&]:border-slate-300">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white [.light_&]:text-slate-900">Automated Weekly Monitoring</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1 [.light_&]:text-slate-600">
              Track score dips and get instant email alerts whenever technical regressions occur.
            </p>
          </div>

          {/* Card 4: City Page Generator */}
          <div className="sm:col-span-2 rounded-xl bg-zinc-900/90 border border-zinc-800 p-6 hover:border-zinc-700 transition-all flex flex-col justify-center [.light_&]:bg-white [.light_&]:border-slate-300">
            <div className="w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white [.light_&]:text-slate-900">Hyper-Local City Page Generator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1 [.light_&]:text-slate-600">
              Generate targeted local SEO landing pages for top US cities automatically with rich schema markup and maps integration.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}

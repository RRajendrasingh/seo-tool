"use client";

import React from "react";
import Link from "next/link";

export default function PlatformFeatures() {
  const stats = [
    { value: "1,200+", label: "Sites Analyzed", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>, color: "text-violet-400", bg: "bg-violet-500/10" },
    { value: "100%", label: "Core Web Vitals", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { value: "99%", label: "Audit Accuracy", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>, color: "text-amber-400", bg: "bg-amber-500/10" },
    { value: "20s", label: "Average Audit Time", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  const workflow = [
    { num: "1", title: "Audit", desc: "Run a complete SEO audit with 100+ technical checks", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { num: "2", title: "AI Fixes", desc: "Get code-ready HTML improvements & semantic guidelines", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>, color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
    { num: "3", title: "Deploy", desc: "Export Next.js static pages for 0.3s lightning load times", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { num: "4", title: "Monitor", desc: "Track rankings, AEO citations, and weekly performance", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  ];

  return (
    <section className="border-t border-zinc-900 bg-slate-950 py-24 sm:py-32 font-sans relative overflow-hidden" aria-label="Platform Features">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center space-y-6 mb-12 sm:mb-20">
          <span className="inline-flex items-center gap-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-5 py-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            ALL-IN-ONE SEO PLATFORM
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Everything You Need to Rank in <br className="hidden sm:block"/>
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent drop-shadow-sm">Google & AI Search</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            SEOIntellect combines AI-powered audits, GEO entity mapping, dynamic local hubs, and statically exported performance optimization into one unified platform.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-12 mb-16 sm:mb-24 max-w-lg md:max-w-none mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col xs:flex-row items-center xs:items-start text-center xs:text-left gap-3">
              <div className={`h-12 w-12 shrink-0 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl font-bold border border-white/5`}>
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-bold text-lg sm:text-xl truncate">{stat.value}</div>
                <div className="text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider leading-tight">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow & Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Sidebar Timeline */}
          <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 mb-10 lg:mb-0">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-8 border-b border-zinc-800/60 pb-3">SEO Workflow</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[19px] top-6 bottom-6 w-px border-l-2 border-dashed border-zinc-800 z-0" />
              {workflow.map((step, i) => (
                <div key={i} className="flex gap-4 relative z-10 group">
                  <div className={`h-10 w-10 shrink-0 rounded-full border ${step.color} flex items-center justify-center text-sm font-black shadow-lg transition-transform group-hover:scale-110`}>
                    {step.icon}
                  </div>
                  <div className="pt-1.5 space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-zinc-500 text-[10px]">0{step.num}</span> {step.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
            
            {/* Card 1: AI SEO Audit */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-cyan-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex items-center gap-4 relative z-10 shadow-inner">
                <div className="relative w-16 h-16 rounded-full border-4 border-zinc-800 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90 text-cyan-500" viewBox="0 0 36 36">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <span className="text-white font-black text-xl">100</span>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between items-center text-[9px] font-medium text-zinc-400"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"/> Crawlability</span> <span>100</span></div>
                  <div className="flex justify-between items-center text-[9px] font-medium text-zinc-400"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> Performance</span> <span>100</span></div>
                  <div className="flex justify-between items-center text-[9px] font-medium text-zinc-400"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400"/> Semantic</span> <span>100</span></div>
                </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Lighthouse Audit</h3>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">100+ Checks</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Comprehensive technical SEO audit checking OpenGraph, SSL, payloads, and more.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Technical</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Accessibility</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Structure</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <Link href="/audit/" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">Run Audit <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>

            {/* Card 2: GEO & AEO Citations */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-violet-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 relative z-10 shadow-inner h-[100px] flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-zinc-300">Entity Maps</span>
                    <span className="text-[9px] text-zinc-500 [.light_&]:text-indigo-600 bg-zinc-800/50 [.light_&]:bg-indigo-50 px-2 py-0.5 rounded">Verified</span>
                 </div>
                 <div className="space-y-1">
                   <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-violet-500 rounded-full"/></div>
                   <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[80%] bg-indigo-500 rounded-full"/></div>
                   <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full w-[60%] bg-cyan-500 rounded-full"/></div>
                 </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">GEO & AEO Ready</h3>
                  <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">AI Search</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Align your entity graphs to be crawled and cited by generative AI search agents.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> ChatGPT</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Gemini</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Claude</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1 cursor-not-allowed">Optimize Now <span aria-hidden="true">&rarr;</span></span>
              </div>
            </div>

            {/* Card 3: Managed SEO Services */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-amber-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex items-center justify-between relative z-10 shadow-inner h-[100px]">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white">99%<span className="text-xs text-amber-500"> Rank</span></div>
                  <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Client Success</div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="text-[9px] text-zinc-400 flex justify-end gap-2 items-center"><span>Managed SEO</span> <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/></div>
                  <div className="text-[9px] text-zinc-400 flex justify-end gap-2 items-center"><span>Link Building</span> <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/></div>
                  <div className="text-[9px] text-zinc-400 flex justify-end gap-2 items-center"><span>On-Page Fixes</span> <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/></div>
                </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">SEO Services</h3>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Managed Campaigns</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Boost domain authority and organic footprint with professional, fully-managed SEO services.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Auditing</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> link Building</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <Link href="/services/" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">View Services <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>

            {/* Card 4: Statically Exported Speed */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-emerald-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 flex justify-between items-center relative z-10 shadow-inner h-[100px]">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]">0.3s</div>
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">LCP</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]">12ms</div>
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">FID</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]">0.01</div>
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">CLS</div>
                </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Next.js Speed</h3>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Zero Latency</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Pass Core Web Vitals automatically with blazing fast static HTML exports.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Core Web Vitals</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Edge Caching</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 cursor-not-allowed">Test Speed <span aria-hidden="true">&rarr;</span></span>
              </div>
            </div>

            {/* Card 5: AI Checklist & Fixes */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-pink-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/80 relative z-10 shadow-inner h-[100px] overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2 border-b border-zinc-800 pb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div><div className="w-2 h-2 rounded-full bg-amber-500"></div><div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[8px] text-zinc-600 font-mono ml-2">page.tsx</span>
                </div>
                <pre className="text-[8px] text-zinc-400 font-mono leading-relaxed select-none">
                  <span className="text-pink-400">export const</span> <span className="text-cyan-400">metadata</span> = {'{'}<br/>
                  &nbsp;&nbsp;<span className="text-amber-300">title</span>: <span className="text-emerald-300">&quot;Optimized Title&quot;</span>,<br/>
                  &nbsp;&nbsp;<span className="text-amber-300">description</span>: <span className="text-emerald-300">&quot;AI-ready desc&quot;</span><br/>
                  {'}'};
                </pre>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Code-Ready Fixes</h3>
                  <span className="text-[9px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">Checklists</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Get prioritized, copy-paste ready HTML improvements to fix semantic gaps.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Meta Tags</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> H1-H6 Sequence</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1 cursor-not-allowed">View Example <span aria-hidden="true">&rarr;</span></span>
              </div>
            </div>

            {/* Card 6: Schema Generator */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-blue-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/80 relative z-10 shadow-inner h-[100px] overflow-hidden">
                <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-2">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase">JSON-LD Schema</span>
                </div>
                <pre className="text-[8px] text-zinc-400 font-mono leading-relaxed select-none">
                  {'{'}<br/>
                  &nbsp;&nbsp;<span className="text-blue-400">&quot;@context&quot;</span>: <span className="text-emerald-300">&quot;https://schema.org&quot;</span>,<br/>
                  &nbsp;&nbsp;<span className="text-blue-400">&quot;@type&quot;</span>: <span className="text-emerald-300">&quot;LocalBusiness&quot;</span>,<br/>
                  &nbsp;&nbsp;<span className="text-blue-400">&quot;name&quot;</span>: <span className="text-emerald-300">&quot;SEOIntellect&quot;</span><br/>
                  {'}'}
                </pre>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Entity Schema</h3>
                  <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Structured Data</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Establish undeniable semantic relationships with perfect JSON-LD injections.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> LocalBusiness</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Organization</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1 cursor-not-allowed">Generate <span aria-hidden="true">&rarr;</span></span>
              </div>
            </div>

            {/* Card 7: Agency Reports */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-orange-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 relative z-10 shadow-inner h-[100px] flex items-center justify-center">
                <div className="w-16 h-20 bg-zinc-900 border border-zinc-700 shadow-xl relative -rotate-3 rounded-sm flex flex-col p-2">
                  <div className="h-2 w-8 bg-orange-500/20 rounded mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-zinc-800 [.light_&]:bg-slate-300 rounded"></div>
                    <div className="h-1 w-3/4 bg-zinc-800 [.light_&]:bg-slate-300 rounded"></div>
                  </div>
                  <div className="mt-auto h-6 w-full bg-zinc-800/50 [.light_&]:bg-slate-200 rounded flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-orange-500/30"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">White-Label Reports</h3>
                  <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">Agencies</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Export gorgeous, branded PDF audit reports to close more client sales.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Custom Logos</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> PDF Export</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1 cursor-not-allowed">View PDF <span aria-hidden="true">&rarr;</span></span>
              </div>
            </div>

            {/* Card 8: Automated Monitoring */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5 hover:border-red-500/30 transition-all shadow-lg group relative overflow-hidden flex flex-col">
              <div className="absolute -inset-1 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-3xl pointer-events-none" />
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 relative z-10 shadow-inner h-[100px] flex flex-col justify-center gap-3">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <span className="text-[10px] text-emerald-400">92</span>
                   </div>
                   <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                     <div className="absolute inset-y-0 left-0 w-3/4 bg-emerald-500 rounded-full"></div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                     <span className="text-[10px] text-red-400">45</span>
                   </div>
                   <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                     <div className="absolute inset-y-0 left-0 w-1/3 bg-red-500 rounded-full"></div>
                   </div>
                 </div>
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Background Monitor</h3>
                  <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Pro Tracking</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Let our engines scan your domains weekly and send email alerts on metrics drops.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Weekly Scans</span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="font-black text-xs">✓</span> Email Alerts</span>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <Link href="/dashboard/" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">Open Dashboard <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>

          </div>
        </div>

        {/* Trusted By Logos */}
        <div className="mt-20 pt-10 border-t border-zinc-800/50 relative z-10">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Trusted by SEO Professionals & Businesses Worldwide
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-10 sm:gap-x-16 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 select-none">
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
        <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl z-10 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
            <div className="h-14 w-14 rounded-full bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Ready to outrank your competitors?</h3>
              <p className="text-sm text-zinc-400 mt-1">Start your free SEO audit and get actionable insights in seconds.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 shrink-0 w-full md:w-auto">
             <Link href="/audit/" className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all text-center">
               Start Free Audit &rarr;
             </Link>
             <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
               <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 [.light_&]:border-white z-30"></div>
                 <div className="w-6 h-6 rounded-full bg-zinc-600 border-2 border-zinc-900 [.light_&]:border-white z-20"></div>
                 <div className="w-6 h-6 rounded-full bg-zinc-500 border-2 border-zinc-900 [.light_&]:border-white z-10"></div>
               </div>
               Join 1,200+ happy users
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}

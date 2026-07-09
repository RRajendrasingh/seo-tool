"use client";

import { useState } from "react";

export default function HeroMockupTabs() {
  const [activeMockupTab, setActiveMockupTab] = useState("overview");

  return (
    <div className="lg:col-span-6 relative">
      <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur opacity-25 animate-pulse-subtle" />
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-lg shadow-2xl space-y-6 transition-all duration-500 hover:scale-[1.01] hover:border-violet-500/30">
        
        {/* Simulated Browser Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 flex-shrink-0" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 flex-shrink-0" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 flex-shrink-0" />
            <span className="ml-2 text-[9px] font-mono text-zinc-500 select-none hidden xs:inline">
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
        <div className="flex border-b border-zinc-800 pb-px gap-2" role="tablist">
          {[
            { id: "overview", label: "Overview" },
            { id: "inspector", label: "Meta Inspector" },
            { id: "performance", label: "Performance" },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeMockupTab === tab.id}
              onClick={() => setActiveMockupTab(tab.id)}
              className={`pb-2.5 text-xs font-bold transition-all duration-200 border-b-2 px-2.5 cursor-pointer relative ${
                activeMockupTab === tab.id
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Tab Panels */}
        <div role="tabpanel">
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
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850" role="progressbar" aria-valuenow="94" aria-valuemin="0" aria-valuemax="100">
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
                    <span className="text-emerald-400 font-bold text-sm leading-none" aria-label="Passed">✓</span>
                  ) : (
                    <span className="text-amber-500 font-bold text-sm leading-none" aria-label="Warning">⚠</span>
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
        </div>

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
  );
}

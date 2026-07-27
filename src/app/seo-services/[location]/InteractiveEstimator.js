"use client";

import { useState, useMemo } from "react";

const INDUSTRIES = [
  { name: "SaaS & Tech Platforms", value: 250, conversion: 0.025, label: "💻 SaaS/Tech" },
  { name: "Professional Services (Law, CPA)", value: 1500, conversion: 0.03, label: "⚖️ Professional" },
  { name: "Healthcare (Medical, Dental)", value: 800, conversion: 0.035, label: "🩺 Healthcare" },
  { name: "Home Services (HVAC, Plumber)", value: 500, conversion: 0.04, label: "🛠️ Home Services" },
  { name: "E-commerce & Local Retail", value: 75, conversion: 0.02, label: "🛒 E-commerce/Retail" }
];

export default function InteractiveEstimator({ cityName }) {
  const [industryIndex, setIndustryIndex] = useState(0);
  const [searchVolume, setSearchVolume] = useState(2500);
  const [currentRank, setCurrentRank] = useState("page2");

  const selectedIndustry = INDUSTRIES[industryIndex];

  const currentCtr = useMemo(() => {
    switch (currentRank) {
      case "page2": return 0.01;
      case "pos4_10": return 0.06;
      case "pos1_3": return 0.18;
      default: return 0.01;
    }
  }, [currentRank]);

  const stats = useMemo(() => {
    const targetCtr = 0.32;
    const ctrGain = Math.max(0, targetCtr - currentCtr);
    const trafficGain = Math.round(searchVolume * ctrGain);
    const leadsGain = Math.round(trafficGain * selectedIndustry.conversion);
    const revenueGain = Math.round(leadsGain * selectedIndustry.value);

    return {
      trafficGain,
      leadsGain,
      revenueGain: revenueGain.toLocaleString("en-US"),
      ctrPercent: Math.round(ctrGain * 100)
    };
  }, [searchVolume, currentCtr, selectedIndustry]);

  return (
    <div id="calculator" className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden transition-all [.light_&]:bg-white [.light_&]:border-slate-300">
      <div className="border-b border-zinc-800 pb-4 [.light_&]:border-slate-200">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-mono tracking-widest uppercase rounded-md mb-2">
          INTERACTIVE ROI ESTIMATOR
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight [.light_&]:text-slate-900">
          Calculate Your {cityName} Local Revenue Potential
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed [.light_&]:text-slate-600">
          Estimate projected traffic, leads, and monthly revenue growth by securing the #1 organic spot in {cityName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Controls Panel */}
        <div className="md:col-span-7 space-y-5">
          {/* Industry Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block [.light_&]:text-slate-600">
              Select Industry Sector
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDUSTRIES.map((ind, idx) => (
                <button
                  key={ind.name}
                  onClick={() => setIndustryIndex(idx)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all text-left ${
                    industryIndex === idx
                      ? "bg-violet-600/20 border-violet-500 text-violet-300 font-bold"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 [.light_&]:bg-slate-50 [.light_&]:border-slate-300 [.light_&]:text-slate-700"
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Volume Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold uppercase [.light_&]:text-slate-600">Monthly Local Search Volume</span>
              <span className="text-violet-400 font-bold">{searchVolume.toLocaleString()} searches/mo</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={searchVolume}
              onChange={(e) => setSearchVolume(Number(e.target.value))}
              className="w-full accent-violet-500 bg-zinc-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Current Rank Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block [.light_&]:text-slate-600">
              Current Google Ranking Position
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {[
                { id: "page2", label: "Page 2+ (1% CTR)" },
                { id: "pos4_10", label: "Pos 4-10 (6% CTR)" },
                { id: "pos1_3", label: "Pos 1-3 (18% CTR)" },
              ].map((rk) => (
                <button
                  key={rk.id}
                  onClick={() => setCurrentRank(rk.id)}
                  className={`p-2.5 rounded-lg border transition-all text-center ${
                    currentRank === rk.id
                      ? "bg-violet-600/20 border-violet-500 text-violet-300 font-bold"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 [.light_&]:bg-slate-50 [.light_&]:border-slate-300 [.light_&]:text-slate-700"
                  }`}
                >
                  {rk.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Box */}
        <div className="md:col-span-5 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-xl [.light_&]:bg-slate-50 [.light_&]:border-slate-300">
          <div className="border-b border-zinc-800 pb-3 [.light_&]:border-slate-200">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1">
              Projected Monthly Value
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              +${stats.revenueGain}
              <span className="text-xs text-zinc-500 font-normal block font-sans">/month estimated revenue increase</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded-md bg-zinc-900 border border-zinc-800 [.light_&]:bg-white [.light_&]:border-slate-200">
              <span className="text-zinc-400 [.light_&]:text-slate-600">Est. Traffic Increase</span>
              <span className="text-white font-bold [.light_&]:text-slate-900">+{stats.trafficGain.toLocaleString()} clicks/mo</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-md bg-zinc-900 border border-zinc-800 [.light_&]:bg-white [.light_&]:border-slate-200">
              <span className="text-zinc-400 [.light_&]:text-slate-600">Est. Qualified Leads</span>
              <span className="text-violet-400 font-bold">+{stats.leadsGain.toLocaleString()} leads/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

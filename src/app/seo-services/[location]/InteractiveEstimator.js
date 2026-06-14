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
  const [currentRank, setCurrentRank] = useState("page2"); // "page2" (1%), "pos4_10" (6%), "pos1_3" (18%)

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
    const targetCtr = 0.32; // Rank #1 CTR
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
    <div id="calculator" className="backdrop-blur-md rounded-3xl border border-zinc-800/80 bg-zinc-900/10 p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 -z-10 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
          Calculate Your {cityName} SEO Revenue Potential
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Estimate potential traffic, leads, and monthly revenue growth by taking the #1 spot in {cityName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Controls Panel */}
        <div className="md:col-span-7 space-y-5">
          {/* Industry Selection */}
          <div className="space-y-2">
            <label className="text-xxs font-bold text-zinc-500 uppercase tracking-wider block">
              Business Sector
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDUSTRIES.map((ind, idx) => (
                <button
                  key={ind.name}
                  type="button"
                  onClick={() => setIndustryIndex(idx)}
                  className={`text-[10px] font-bold px-3 py-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                    industryIndex === idx
                      ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/10"
                      : "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:bg-zinc-900/80 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Volume Slider */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center text-xxs font-bold uppercase tracking-wider">
              <span className="text-zinc-500">Monthly Local Search Volume</span>
              <span className="text-violet-400 font-mono text-[10px] bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                {searchVolume.toLocaleString()} searches/mo
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={searchVolume}
              onChange={(e) => setSearchVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
              <span>500</span>
              <span>5,000</span>
              <span>10,000</span>
              <span>15,000+</span>
            </div>
          </div>

          {/* Current Ranking */}
          <div className="space-y-2 pt-1">
            <label className="text-xxs font-bold text-zinc-500 uppercase tracking-wider block">
              Current Google Rank Profile
            </label>
            <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-850">
              <button
                type="button"
                onClick={() => setCurrentRank("page2")}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all text-center cursor-pointer ${
                  currentRank === "page2"
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Page 2-3 (~1% CTR)
              </button>
              <button
                type="button"
                onClick={() => setCurrentRank("pos4_10")}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all text-center cursor-pointer ${
                  currentRank === "pos4_10"
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Pos. 4-10 (~6% CTR)
              </button>
              <button
                type="button"
                onClick={() => setCurrentRank("pos1_3")}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all text-center cursor-pointer ${
                  currentRank === "pos1_3"
                    ? "bg-zinc-900 text-white border border-zinc-800 shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Pos. 1-3 (~18% CTR)
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-5 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500 block">
                Estimated Monthly Revenue Growth
              </span>
              <span className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent block mt-1.5 tracking-tight leading-none">
                ${stats.revenueGain}
              </span>
              <span className="text-[10px] text-zinc-500 leading-normal mt-1 block">
                Assuming average contract/deal value of ${selectedIndustry.value}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-zinc-900">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500 block">
                  New Monthly Traffic
                </span>
                <span className="text-base font-extrabold text-white block mt-0.5">
                  +{stats.trafficGain.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-500 block mt-0.5 leading-none">visitors / mo</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500 block">
                  New Monthly Leads
                </span>
                <span className="text-base font-extrabold text-emerald-400 block mt-0.5">
                  +{stats.leadsGain.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-500 block mt-0.5 leading-none">conversions / mo</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-900">
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Achieving Rank #1 yields an organic CTR boost of <strong className="text-violet-400">+{stats.ctrPercent}%</strong> compared to your current position.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function GeoGridSimulator({ cityName }) {
  const [isOptimized, setIsOptimized] = useState(false);
  const [selectedNode, setSelectedNode] = useState({ r: 1, c: 1 });

  // Grid coordinates node data definitions
  const gridNodes = [
    // Row 0
    { r: 0, c: 0, label: "NW (1.5 mi)", unoptVal: 9, optVal: 1, reasonUnopt: "No localized schema. Search spiders can't verify geographical boundary connections.", reasonOpt: "Local Schema injected. Citations verify city limits coverage." },
    { r: 0, c: 1, label: "N (1.0 mi)", unoptVal: 5, optVal: 1, reasonUnopt: "Missing heading keywords. Competitive local competitors capture target search keywords.", reasonOpt: "Optimized title and header tags command search rank." },
    { r: 0, c: 2, label: "NE (1.5 mi)", unoptVal: 12, optVal: 2, reasonUnopt: "Low citation authority. Address details are unverified at this distance.", reasonOpt: "Map proximity listings expanded. Local citations locked in." },
    // Row 1
    { r: 1, c: 0, label: "W (1.0 mi)", unoptVal: 4, optVal: 1, reasonUnopt: "Slow page load speed. High mobile bounce rates lower rankings near the center.", reasonOpt: "Ultra-fast loading speed holds rank coverage." },
    { r: 1, c: 1, label: "Center (Office)", unoptVal: 1, optVal: 1, reasonUnopt: "Rank 1 at office address. Proximity is strongest here, but drops off immediately outside.", reasonOpt: "Office headquarters coordinates mapped. Full local authority." },
    { r: 1, c: 2, label: "E (1.0 mi)", unoptVal: 6, optVal: 1, reasonUnopt: "Unmatched search intent. Content is too generic for location keyword queries.", reasonOpt: "Intent-mapped local pages match search terms." },
    // Row 2
    { r: 2, c: 0, label: "SW (1.5 mi)", unoptVal: 15, optVal: 2, reasonUnopt: "No coordinates schema. Google Maps cannot verify exact distance parameters.", reasonOpt: "Geo-coordinates injected. Radius matches search intent." },
    { r: 2, c: 1, label: "S (1.0 mi)", unoptVal: 7, optVal: 1, reasonUnopt: "Name-Address-Phone (NAP) mismatches on local citation directories.", reasonOpt: "Clean citation directory consistency locks in Rank 1." },
    { r: 2, c: 2, label: "SE (1.5 mi)", unoptVal: 19, optVal: 3, reasonUnopt: "No local backlinks. Authority drops off completely outside immediate radius.", reasonOpt: "Structured city landing interlinking boosts regional signals." },
  ];

  const getRankClasses = (rank) => {
    if (rank <= 3) {
      return "bg-emerald-500/20 border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/10";
    }
    if (rank <= 7) {
      return "bg-amber-500/20 border-amber-800/40 text-amber-400 hover:bg-amber-900/10";
    }
    return "bg-rose-500/20 border-rose-900/40 text-rose-400 hover:bg-rose-900/10";
  };

  const getActiveNode = () => {
    return gridNodes.find(n => n.r === selectedNode.r && n.c === selectedNode.c) || gridNodes[4];
  };

  const activeNode = getActiveNode();
  const activeVal = isOptimized ? activeNode.optVal : activeNode.unoptVal;

  return (
    <div className="rounded-3xl border p-6 sm:p-8 backdrop-blur-md space-y-6 text-left relative overflow-hidden select-none bg-zinc-900/10 border-zinc-800/80 shadow-md">
      <div className="absolute top-0 right-0 -z-10 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Google Maps Local Proximity Grid
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
            Simulated ranking radius in {cityName}. Click grid nodes to inspect details.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-zinc-950/20 border-zinc-800/80">
          <button
            type="button"
            onClick={() => setIsOptimized(false)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !isOptimized 
                ? "bg-zinc-900 border border-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setIsOptimized(true)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isOptimized 
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md" 
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Optimized
          </button>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* The 3x3 Geo-Grid Box */}
        <div className="md:col-span-6 flex justify-center">
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl w-full max-w-[240px] aspect-square relative bg-zinc-950/20 border border-zinc-850">
            
            {/* Grid Line Overlay */}
            <div className="absolute inset-x-0 top-1/3 h-px bg-zinc-200 dark:bg-zinc-900/60 pointer-events-none opacity-20" />
            <div className="absolute inset-x-0 bottom-1/3 h-px bg-zinc-200 dark:bg-zinc-900/60 pointer-events-none opacity-20" />
            <div className="absolute inset-y-0 left-1/3 w-px bg-zinc-200 dark:bg-zinc-900/60 pointer-events-none opacity-20" />
            <div className="absolute inset-y-0 right-1/3 w-px bg-zinc-200 dark:bg-zinc-900/60 pointer-events-none opacity-20" />

            {gridNodes.map((node) => {
              const val = isOptimized ? node.optVal : node.unoptVal;
              const isSelected = selectedNode.r === node.r && selectedNode.c === node.c;
              
              return (
                <button
                  key={`${node.r}-${node.c}`}
                  type="button"
                  onClick={() => setSelectedNode({ r: node.r, c: node.c })}
                  className={`flex flex-col items-center justify-center rounded-xl border text-center transition-all aspect-square relative z-10 cursor-pointer ${
                    isSelected 
                      ? "ring-2 ring-violet-500 border-violet-500 shadow-sm" 
                      : "hover:border-zinc-400 dark:hover:border-zinc-700"
                  } ${getRankClasses(val)}`}
                >
                  <span className="text-[14px] font-black">{val}</span>
                  <span className="text-[7px] mt-0.5 tracking-wider uppercase font-bold opacity-80">
                    {node.r === 1 && node.c === 1 ? "Office" : node.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node detail inspection panel */}
        <div className="md:col-span-6 space-y-4">
          <div className="border rounded-2xl p-4 min-h-[140px] flex flex-col justify-between bg-zinc-950/20 border-zinc-800/80">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  Check Coordinate: {activeNode.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                  activeVal <= 3 
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" 
                    : "border-rose-500/20 text-rose-400 bg-rose-500/5"
                }`}>
                  {activeVal <= 3 ? "Map 3-Pack Rank" : "Out of Pack"}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2">
                Ranking Position: <span className={activeVal <= 3 ? "text-emerald-400" : "text-rose-400"}>Rank #{activeVal}</span>
              </h4>
            </div>

            <p className="text-[10px] text-zinc-450 mt-2 leading-relaxed leading-normal">
              {isOptimized ? activeNode.reasonOpt : activeNode.reasonUnopt}
            </p>
          </div>
        </div>

      </div>
      
      {/* Footer warning message */}
      <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-4 flex gap-2 items-center">
        <span>💡</span>
        <span>
          {!isOptimized 
            ? `Standard local listings drop ranking placement outside the immediate office block. Proximity search is blocked.` 
            : `AI optimization uses city-wide structured JSON schema variables to claim rank placement across all coordinates.`}
        </span>
      </div>
    </div>
  );
}

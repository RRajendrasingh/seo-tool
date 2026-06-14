import Link from "next/link";

export default function GoogleSerpPreview({ cityName, mainKeyword }) {
  return (
    <div className="backdrop-blur-md rounded-3xl border border-zinc-800/80 bg-zinc-900/10 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/50">
      {/* Decorative top header representing a browser bar */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 px-3.5 py-1 rounded-lg text-[10px] text-zinc-500 font-mono select-none w-56 truncate text-center">
          google.com/search?q={encodeURIComponent(mainKeyword)}
        </div>
        <div className="w-8" />
      </div>

      {/* Mock Search Bar Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-850 rounded-full px-3.5 py-2">
          <span className="text-[11px]">🔍</span>
          <span className="text-[11px] text-zinc-200 font-medium truncate">
            {mainKeyword}
          </span>
        </div>
      </div>

      {/* Simulated SERP Content */}
      <div className="space-y-4 pt-1">
        {/* Map Pack Section */}
        <div className="border border-zinc-850 rounded-2xl bg-zinc-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-850/60 pb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              📍 Local Map Pack Proximity
            </h4>
            <span className="text-[9px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
              3-Pack Active
            </span>
          </div>

          {/* Dotted Mock Map Visual */}
          <div className="h-16 w-full rounded-xl bg-zinc-900/40 border border-zinc-850/40 relative overflow-hidden flex items-center justify-center">
            {/* SVG Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="absolute top-4 left-1/4 w-3.5 h-3.5 rounded-full bg-zinc-700/80 flex items-center justify-center text-[7px]">🏢</div>
            <div className="absolute bottom-3 right-1/3 w-3.5 h-3.5 rounded-full bg-zinc-700/80 flex items-center justify-center text-[7px]">🏢</div>
            
            {/* Highlighted #1 spot marker */}
            <div className="absolute top-6 right-1/4 flex flex-col items-center">
              <span className="text-sm animate-bounce">📍</span>
              <span className="bg-violet-600 text-white font-extrabold text-[7px] px-1 rounded-sm shadow border border-violet-400 select-none">
                #1 Ranking
              </span>
            </div>
          </div>

          {/* Map Listings */}
          <div className="space-y-2 pt-1">
            {/* Spot 1: Your Business */}
            <div className="flex items-start justify-between p-2 rounded-xl bg-violet-500/5 border border-violet-500/25">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  Your Business <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-extrabold border border-emerald-500/20">Featured</span>
                </span>
                <span className="text-[9px] text-amber-400 block font-bold">
                  ★ 5.0 <span className="text-zinc-500 font-medium">(48 reviews)</span> • SEO Optimized
                </span>
                <span className="text-[9px] text-zinc-500 block">
                  Open • {cityName} Local Area
                </span>
              </div>
              <span className="text-[10px] bg-violet-600 text-white font-black px-2 py-1 rounded-lg">
                #1
              </span>
            </div>

            {/* Spot 2: Competitor A */}
            <div className="flex items-start justify-between p-2 rounded-xl bg-zinc-900/20 border border-zinc-850/40 opacity-70">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-300">Local Competitor Inc</span>
                <span className="text-[9px] text-amber-400 block">
                  ★ 4.2 <span className="text-zinc-500">(15 reviews)</span>
                </span>
                <span className="text-[9px] text-zinc-500 block">Open • 1.2 miles away</span>
              </div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold px-2 py-1 rounded-lg">
                #2
              </span>
            </div>
          </div>
        </div>

        {/* Organic Result #1: Standard Rich Snippet */}
        <div className="space-y-1.5 p-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[8px]">✨</span>
            <div className="leading-tight">
              <span className="text-[9px] text-zinc-400 block font-mono leading-none">yourbusiness.com › local-seo</span>
            </div>
          </div>
          <a href="#calculator" className="text-[13px] sm:text-sm font-extrabold text-violet-400 hover:underline leading-snug block">
            Best Local SEO Agency in {cityName} | Dominate {cityName} Rankings
          </a>
          <p className="text-[10px] text-zinc-500 leading-normal">
            Dominate local search positions in {cityName}. Run dynamic schema adjustments, local map packs, and core web vital enhancements. Get your free local audit report instantly.
          </p>
          {/* Site Links */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 mt-2">
            <div className="p-1.5 rounded-lg hover:bg-zinc-900/30">
              <span className="text-[10px] font-bold text-violet-400 block hover:underline cursor-pointer">Free Website Audit</span>
              <span className="text-[9px] text-zinc-600 block mt-0.5">Analyze your site speed and meta tags</span>
            </div>
            <div className="p-1.5 rounded-lg hover:bg-zinc-900/30">
              <span className="text-[10px] font-bold text-violet-400 block hover:underline cursor-pointer">Pricing & Blueprints</span>
              <span className="text-[9px] text-zinc-600 block mt-0.5">Custom SEO pricing for {cityName} sites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

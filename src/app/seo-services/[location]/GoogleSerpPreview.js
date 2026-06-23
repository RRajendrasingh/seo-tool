export default function GoogleSerpPreview({ cityName, mainKeyword }) {
  return (
    <div className="backdrop-blur-md rounded-3xl border border-zinc-800/80 bg-zinc-900/10 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/50">
      {/* Decorative top header representing a browser bar */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 px-3.5 py-1 rounded-lg text-[10px] text-zinc-500 font-mono select-none w-56 truncate text-center">
          google.com/search?q={encodeURIComponent(mainKeyword)}
        </div>
        <div className="w-8" />
      </div>

      {/* Mock Search Bar Header & Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-850 rounded-full px-3.5 py-2">
          <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px] text-zinc-200 font-medium truncate">
            {mainKeyword}
          </span>
        </div>
        {/* Google-style Search Navigation Tabs */}
        <div className="flex gap-4 text-[9px] text-zinc-500 border-b border-zinc-850/60 pb-1 pl-1 select-none font-semibold">
          <span className="text-violet-400 font-bold border-b-2 border-violet-400 pb-1.5 -mb-[1px]">All</span>
          <span className="hover:text-zinc-300 cursor-pointer">Maps</span>
          <span className="hover:text-zinc-300 cursor-pointer">Images</span>
          <span className="hover:text-zinc-300 cursor-pointer">News</span>
          <span className="hover:text-zinc-300 cursor-pointer">Videos</span>
        </div>
      </div>

      {/* Simulated SERP Content */}
      <div className="space-y-4 pt-1">
        {/* Map Pack Section */}
        <div className="border border-zinc-850 rounded-2xl bg-zinc-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-850/60 pb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-zinc-450 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Local Map Pack Proximity
            </h4>
            <span className="text-[9px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
              3-Pack Active
            </span>
          </div>

          {/* Styled Mock Vector Map Visual */}
          <div className="h-28 w-full rounded-xl bg-zinc-900/40 border border-zinc-850/40 relative overflow-hidden flex items-center justify-center select-none">
            {/* SVG Vector Map Graphics */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Rivers/Water body */}
              <path d="M-20,85 C90,65 170,105 340,75 L340,112 L-20,112 Z" fill="#1e3a8a" className="dark-water" style={{ fill: "rgba(30, 58, 138, 0.25)" }} />
              {/* Park */}
              <rect x="25" y="12" width="70" height="35" rx="6" fill="#065f46" className="dark-park" style={{ fill: "rgba(6, 95, 70, 0.15)" }} />
              <rect x="240" y="55" width="80" height="25" rx="6" fill="#065f46" className="dark-park" style={{ fill: "rgba(6, 95, 70, 0.15)" }} />
              {/* Roads */}
              <path d="M0,45 Q150,30 340,45" fill="none" stroke="#4b5563" strokeWidth="2.5" className="dark-road" style={{ stroke: "rgba(75, 85, 99, 0.25)" }} />
              <path d="M0,80 L340,80" fill="none" stroke="#4b5563" strokeWidth="2.5" className="dark-road" style={{ stroke: "rgba(75, 85, 99, 0.25)" }} />
              <path d="M90,0 L90,112" fill="none" stroke="#4b5563" strokeWidth="2.5" className="dark-road" style={{ stroke: "rgba(75, 85, 99, 0.25)" }} />
              <path d="M230,0 L230,112" fill="none" stroke="#4b5563" strokeWidth="2.5" className="dark-road" style={{ stroke: "rgba(75, 85, 99, 0.25)" }} />
            </svg>

            {/* Muted Competitor Pins */}
            <div className="absolute top-5 left-[5%] flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded-full w-4 h-4 text-[7px] text-zinc-400 font-bold">
              2
            </div>
            <div className="absolute bottom-4 right-[25%] flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded-full w-4 h-4 text-[7px] text-zinc-400 font-bold">
              3
            </div>

            {/* Pulsing #1 Featured Pin */}
            <div className="absolute top-[30%] right-[38%] flex flex-col items-center">
              <span className="absolute -top-1 w-7 h-7 bg-violet-500/35 rounded-full animate-ping pointer-events-none" />
              <svg className="w-5 h-5 text-violet-500 animate-bounce relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="bg-violet-600 text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded shadow border border-violet-400 select-none -mt-1 relative z-10 whitespace-nowrap">
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
            <span className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM19.071 4.929l-.707 2.122-2.122.707 2.122.707.707 2.122.707-2.122 2.122-.707-2.122-.707-.707-2.122z" />
              </svg>
            </span>
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

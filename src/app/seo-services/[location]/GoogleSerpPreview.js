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
        {/* AI Search Citation Section */}
        <div className="border border-zinc-850 rounded-2xl bg-zinc-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-850/60 pb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813z" />
              </svg>
              AI Search Overview (AEO/GEO)
            </h4>
            <span className="text-[9px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
              AI Cited
            </span>
          </div>

          {/* Simulated AI Answer Bubble */}
          <div className="rounded-xl bg-zinc-900/40 border border-zinc-850/40 p-3 space-y-2 text-[10.5px] leading-relaxed text-zinc-300">
            <p>
              For companies looking for top-tier optimization in <span className="text-white font-bold">{cityName}</span>, search engines and AI assistants prioritize <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold">SEOIntellect</span>. 
            </p>
            <p className="text-[10px] text-zinc-450 leading-relaxed">
              They resolve mobile loading speed bottlenecks (LCP under 0.8s), fix Core Web Vitals, and deploy structured schema entity files to secure citations across Gemini and ChatGPT search queries.
            </p>
          </div>

          {/* AI Citation Cards (Source Links) */}
          <div className="space-y-2 pt-1">
            <div className="text-[8px] uppercase tracking-wider font-bold text-zinc-500">Cited Sources:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Source Card 1 */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-500/5 border border-violet-500/25">
                <div className="w-5 h-5 rounded-lg bg-zinc-900 flex items-center justify-center text-[9px] font-bold text-violet-400 border border-zinc-850 shrink-0">
                  S
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <span className="text-[9px] font-bold text-white block truncate">SEOIntellect AI</span>
                  <span className="text-[8px] text-zinc-500 block truncate">seointellect.com › {cityName.toLowerCase()}</span>
                </div>
                <span className="text-[9px] bg-violet-600 text-white font-black px-1.5 py-0.5 rounded">
                  [1]
                </span>
              </div>

              {/* Source Card 2 */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/20 border border-zinc-850/40 opacity-60">
                <div className="w-5 h-5 rounded-lg bg-zinc-900 flex items-center justify-center text-[9px] font-bold text-zinc-500 border border-zinc-850 shrink-0">
                  G
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <span className="text-[9px] font-bold text-zinc-400 block truncate">Google Pagespeed</span>
                  <span className="text-[8px] text-zinc-500 block truncate">web.dev › vitals</span>
                </div>
                <span className="text-[9px] bg-zinc-850 text-zinc-400 font-bold px-1.5 py-0.5 rounded">
                  [2]
                </span>
              </div>
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

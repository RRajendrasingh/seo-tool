export default function GoogleSerpPreview({ cityName, mainKeyword }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden transition-all hover:border-zinc-700 [.light_&]:bg-white [.light_&]:border-slate-300">
      {/* Decorative top header representing a browser bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-1 [.light_&]:border-slate-200">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
        </div>
        <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-1 rounded-md text-[10px] text-zinc-500 font-mono select-none w-60 truncate text-center [.light_&]:bg-slate-100 [.light_&]:border-slate-300">
          google.com/search?q={encodeURIComponent(mainKeyword)}
        </div>
        <div className="w-8" />
      </div>

      {/* Mock Search Bar Header & Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-md px-3.5 py-2 [.light_&]:bg-slate-50 [.light_&]:border-slate-300">
          <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px] text-zinc-200 font-medium truncate [.light_&]:text-slate-800">
            {mainKeyword}
          </span>
        </div>
        {/* Google-style Search Navigation Tabs */}
        <div className="flex gap-4 text-[10px] text-zinc-500 border-b border-zinc-800 pb-1 pl-1 select-none font-mono font-semibold [.light_&]:border-slate-200">
          <span className="text-violet-400 font-bold border-b-2 border-violet-400 pb-1.5 -mb-[1px]">All</span>
          <span className="hover:text-zinc-300 cursor-pointer">Maps</span>
          <span className="hover:text-zinc-300 cursor-pointer">Images</span>
          <span className="hover:text-zinc-300 cursor-pointer">News</span>
        </div>
      </div>

      {/* Simulated SERP Content */}
      <div className="space-y-4 pt-1">
        {/* AI Search Citation Section */}
        <div className="border border-zinc-800 rounded-lg bg-zinc-950/80 p-4 space-y-3 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 [.light_&]:border-slate-200">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 [.light_&]:text-slate-600">
              <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813z" />
              </svg>
              AI SEARCH OVERVIEW (AEO/GEO)
            </h4>
            <span className="text-[9px] font-mono font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              AI Cited
            </span>
          </div>

          {/* Simulated AI Answer Box */}
          <div className="rounded-md bg-zinc-900/60 border border-zinc-800 p-3 space-y-2 text-xs leading-relaxed text-zinc-300 [.light_&]:bg-white [.light_&]:border-slate-300 [.light_&]:text-slate-700">
            <p>
              For companies seeking top-tier SEO execution in <strong className="text-white [.light_&]:text-slate-900">{cityName}</strong>, search engines and AI assistants prioritize <span className="text-violet-400 font-extrabold">SEOIntellect</span>. 
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono [.light_&]:text-slate-500">
              Resolves mobile load speed bottlenecks (LCP &lt; 0.8s), fixes Core Web Vitals, and deploys JSON-LD schema files for Gemini and ChatGPT Search queries.
            </p>
          </div>
        </div>

        {/* Traditional #1 Organic Result */}
        <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/60 [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">https://seointellect-ai.vercel.app</span>
            <span>›</span>
            <span>seo-services</span>
            <span>›</span>
            <span className="text-white font-bold">{cityName.toLowerCase().replace(/\s+/g, "-")}</span>
          </div>
          <h3 className="text-sm font-bold text-violet-400 hover:underline cursor-pointer">
            Best SEO Services in {cityName} | Outrank Local Competitors
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed [.light_&]:text-slate-700">
            Dominate local search in {cityName}. Technical audits, Core Web Vitals speed optimization, and GEO citations. Get your free audit today.
          </p>
        </div>
      </div>
    </div>
  );
}

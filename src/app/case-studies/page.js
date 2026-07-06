import Link from "next/link";
import Image from "next/image";
import { CASE_STUDIES } from "@/data/caseStudies";

export const metadata = {
  title: "SEO Case Studies | Client Success Stories | SEOIntellect",
  description: "Read how growth teams and agencies achieved massive organic traffic increases, fixed Core Web Vitals, and dominated local search using SEOIntellect strategies.",
  openGraph: {
    title: "SEO Case Studies | Client Success Stories",
    description: "Read how growth teams and agencies achieved massive organic traffic increases, fixed Core Web Vitals, and dominated local search using SEOIntellect strategies.",
    type: "website",
  },
};

export default function CaseStudiesIndex() {
  return (
    <main className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate overflow-x-hidden">
      {/* Glows */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" aria-hidden="true" />
      <div className="absolute top-1/2 left-0 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px]" aria-hidden="true" />

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16 sm:mb-24">
        <span className="inline-flex items-center gap-x-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 select-none">
          Proven Results
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Client Success Stories
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
          Discover how modern marketing teams use technical SEO, GEO, and automated local architectures to dominate their markets.
        </p>
      </header>

      {/* Case Studies Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Case studies list">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.id}
              className="group relative flex flex-col items-start justify-between rounded-3xl bg-zinc-900/40 p-2 border border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-zinc-950">
                <Image
                  src={study.featuredImage}
                  alt={study.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="rounded-full bg-zinc-950/80 border border-zinc-800 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-zinc-300">
                    {study.industry}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-6 space-y-4 flex-grow flex flex-col">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {study.title}
                  </h2>
                  <p className="text-sm font-semibold text-zinc-500">
                    Client: {study.client}
                  </p>
                </div>
                
                <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                  {study.shortDesc}
                </p>

                {/* Metrics Highlights */}
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-zinc-850">
                  {study.metrics.slice(0, 2).map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-xl font-black text-indigo-400">{m.value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link Overlay (Makes entire card clickable securely) */}
              <Link href={`/case-studies/${study.slug}/`} className="absolute inset-0 z-10" aria-label={`Read case study: ${study.title}`}>
                <span className="sr-only">Read full case study</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

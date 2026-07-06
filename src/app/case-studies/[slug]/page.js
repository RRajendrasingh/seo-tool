import Image from "next/image";
import Link from "next/link";
import { CASE_STUDIES } from "@/data/caseStudies";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  const study = CASE_STUDIES.find((s) => s.slug === slug);

  if (study) {
    return {
      title: `${study.title} | SEOIntellect Case Studies`,
      description: study.shortDesc,
      openGraph: {
        title: study.title,
        description: study.shortDesc,
        images: [
          {
            url: study.featuredImage,
            width: 1200,
            height: 720,
            alt: study.title,
          },
        ],
      },
    };
  }
  return {
    title: "Case Study Not Found | SEOIntellect",
  };
}

export default async function CaseStudyDetail(props) {
  const params = await props.params;
  const { slug } = params;
  const study = CASE_STUDIES.find((s) => s.slug === slug);

  if (!study) {
    return (
      <main className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-400">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Case Study Not Found</h1>
          <p>The case study you are looking for does not exist.</p>
          <Link href="/case-studies/" className="text-indigo-400 hover:underline">
            ← Back to Case Studies
          </Link>
        </div>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.shortDesc,
    image: study.featuredImage,
    datePublished: study.date,
    author: {
      "@type": "Organization",
      name: "SEOIntellect",
    },
    publisher: {
      "@type": "Organization",
      name: "SEOIntellect",
      logo: {
        "@type": "ImageObject",
        url: "https://seointellect-ai.vercel.app/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="bg-zinc-950 min-h-screen relative isolate text-left overflow-x-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 -z-10 w-full h-[60vh] bg-indigo-900/10" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[100px]" aria-hidden="true" />

        {/* Hero Section */}
        <header className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
          <div className="mx-auto max-w-5xl">
            <nav className="mb-8" aria-label="Breadcrumb">
              <Link
                href="/case-studies/"
                className="text-xs font-semibold text-zinc-500 hover:text-white transition-all inline-flex items-center gap-1.5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Case Studies
              </Link>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400">
                    {study.industry}
                  </span>
                  <time className="text-xs font-medium text-zinc-500" dateTime={study.date}>
                    {study.date}
                  </time>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  {study.title}
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
                  {study.shortDesc}
                </p>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-300">Client: <span className="text-white">{study.client}</span></p>
                </div>
              </div>
              
              <div className="lg:col-span-5 relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                <Image
                  src={study.featuredImage}
                  alt={study.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Highlight Metrics Strip */}
        <section className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20" aria-label="Key Metrics">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-12 divide-x divide-zinc-800">
              {study.metrics.map((m, idx) => (
                <div key={idx} className={`${idx !== 0 ? "pl-6 sm:pl-12" : ""} space-y-1`}>
                  <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    {m.value}
                  </p>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
          
          <section className="space-y-6" aria-labelledby="challenge">
            <h2 id="challenge" className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              The Challenge
            </h2>
            <div className="prose prose-invert prose-lg text-zinc-300">
              <p>{study.challenge}</p>
            </div>
          </section>

          <section className="space-y-6" aria-labelledby="solution">
            <h2 id="solution" className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              Our Solution Architecture
            </h2>
            <div className="prose prose-invert prose-lg text-zinc-300">
              <p>{study.solution}</p>
            </div>
          </section>

          <section className="space-y-6" aria-labelledby="results">
            <h2 id="results" className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
              The Results
            </h2>
            <div className="prose prose-invert prose-lg text-zinc-300">
              <p>{study.results}</p>
            </div>
          </section>
        </div>

        {/* CTA Footer */}
        <section className="border-t border-zinc-900 bg-zinc-950 py-16 sm:py-24 text-center">
          <div className="mx-auto max-w-3xl px-4 space-y-6">
            <h2 className="text-3xl font-bold text-white">Ready for similar results?</h2>
            <p className="text-zinc-400">Audit your site instantly and get the exact technical blueprint we used to scale {study.client}.</p>
            <div className="pt-4">
              <Link
                href="/audit/"
                className="inline-flex rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all"
              >
                Run Free SEO Audit
              </Link>
            </div>
          </div>
        </section>

      </article>
    </>
  );
}

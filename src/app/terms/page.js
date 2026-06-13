import Link from "next/link";

export const metadata = {
  title: "Terms of Service | SEOIntellect AI",
  description: "Read the SEOIntellect AI Terms of Service to understand our licensing, payments, audit reporting terms, and limitations of liability.",
};

export default function TermsOfService() {
  const lastUpdated = "June 11, 2026";

  const sections = [
    {
      title: "1. Agreement to Terms",
      content: (
        <p className="text-zinc-400">
          {"By accessing or using SEOIntellect AI (the \"Service\"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use or access the Service."}
        </p>
      ),
    },
    {
      title: "2. Services & AI SEO Audits",
      content: (
        <>
          <p className="text-zinc-400">
            SEOIntellect AI offers both free and premium SEO audit reports, site crawling analysis, and custom local SEO optimization consulting.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Accuracy of Reports:</strong> Audit reports represent automated assessments of web content at the time of crawling. Search engines continuously update their algorithms, and our suggestions do not guarantee specific indexing rankings.
            </li>
            <li>
              <strong className="text-zinc-200">Permitted Use:</strong> You are granted a limited, non-exclusive license to use these reports for internal business planning or web optimization.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Payments and Refund Policy",
      content: (
        <>
          <p className="text-zinc-400">
            For users subscribing to our paid packages or acquiring premium reports:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Billing:</strong> All transactions are processed through secure checkout systems. You agree to provide accurate, complete billing details.
            </li>
            <li>
              <strong className="text-zinc-200">Refunds:</strong> Since premium AI reports involve instantaneous resource consumption (APIs and scraping costs), all report purchases are generally non-refundable. For subscription products, billing disputes can be addressed by contacting support.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Intellectual Property Rights",
      content: (
        <p className="text-zinc-400">
          All proprietary source code, software, platform design, visual icons, brand assets, and copywriting are the intellectual property of SEOIntellect AI. You may not copy, scraping-harvest, modify, distribute, or reverse-engineer our proprietary platform mechanisms or codebase without explicit written consent.
        </p>
      ),
    },
    {
      title: "5. Disclaimers & Limitation of Liability",
      content: (
        <>
          <p className="text-zinc-400">
            {"The Service is provided on an \"as-is\" and \"as-available\" basis:"}
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>We make no warranties or representations regarding absolute uptime, accuracy of scraped search trends, or search ranking increases.</li>
            <li>In no event shall SEOIntellect AI or its owners be liable for any direct, indirect, consequential, or special damages arising from the use or inability to use this platform.</li>
          </ul>
        </>
      ),
    },
    {
      title: "6. Changes to Terms",
      content: (
        <p className="text-zinc-400">
          We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, we will provide notice before new terms take effect. Continued use of the Service after changes are published constitutes acceptance of the new terms.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 -z-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Navigation Breadcrumb / Go back */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors group"
          >
            <svg
              className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-zinc-800 pb-8 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Container */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <section
              key={index}
              className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md hover:border-zinc-700/80 transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded bg-gradient-to-b from-indigo-500 to-cyan-500" />
                {section.title}
              </h2>
              <div className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Info Footer Card */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Have questions about our Terms of Service?</h3>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            If you have any questions, concerns, or requests regarding our terms and licensing, please feel free to reach out.
          </p>
          <a
            href="mailto:support@seointellect.com"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/20"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

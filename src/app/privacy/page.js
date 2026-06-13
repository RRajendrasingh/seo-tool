import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SEOIntellect AI",
  description: "Read the SEOIntellect AI Privacy Policy to understand how we collect, use, and protect your website audit data and personal information.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "June 11, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p className="text-zinc-400">
            We collect information to provide better services to our users. The types of information we gather include:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Account & Profile Information:</strong> When you sign up, checkout, or purchase premium reports, we collect your email address, name, and billing details via our payment processors.
            </li>
            <li>
              <strong className="text-zinc-200">Website & Audit Data:</strong> We collect URLs, domain names, page structure, content tags, and site performance data that you submit for SEO audits to generate reports.
            </li>
            <li>
              <strong className="text-zinc-200">Technical & Usage Data:</strong> When you browse our site, we record standard logs including IP addresses, browser types, referral URLs, and pages visited.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Information",
      content: (
        <>
          <p className="text-zinc-400">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>To perform the AI-powered SEO analysis and generate audit reports.</li>
            <li>To process payments and manage invoices.</li>
            <li>To deliver newsletter updates, promotions, or system alerts (if opted in).</li>
            <li>To monitor, analyze, and optimize website performance and user experience.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Data Sharing and Third Parties",
      content: (
        <>
          <p className="text-zinc-400">
            We do not sell your personal data. We only share information with trusted third-party providers who help us operate our services:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Payment Processors:</strong> We use secure providers (like Stripe) to process payments. We do not store credit card details on our servers.
            </li>
            <li>
              <strong className="text-zinc-200">AI APIs:</strong> We use OpenAI APIs to generate SEO recommendations. Only non-sensitive audit metrics and website summaries are sent to these APIs.
            </li>
            <li>
              <strong className="text-zinc-200">Hosting & Cloud:</strong> Our application runs on secure cloud environments with robust security groups and access controls.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Data Retention & Security",
      content: (
        <p className="text-zinc-400">
          We retain audit records for a reasonable period to let you download and reference your reports. You can request deletion of your account and audit history at any time by contacting our support team. We use industry-standard encryption (SSL/TLS) to secure all data transmissions.
        </p>
      ),
    },
    {
      title: "5. Cookies & Tracking",
      content: (
        <p className="text-zinc-400">
          We use cookies to preserve your session state, remember your configuration preferences, and compile aggregated traffic statistics. You can disable cookies in your browser settings, though some features of the SEO audit tool may not function correctly.
        </p>
      ),
    },
    {
      title: "6. Your Rights & Choice",
      content: (
        <p className="text-zinc-400">
          Depending on your location, you have rights to access, correct, delete, or restrict the processing of your personal data under regulations like the GDPR or CCPA. For any inquiries, please contact us at the email address listed below.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-zinc-950 min-h-screen py-16 sm:py-24 relative isolate">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 -z-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

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
            Privacy Policy
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
          <h3 className="text-lg font-bold text-white">Have questions about our Privacy Policy?</h3>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            If you have any questions or concerns regarding this policy, feel free to reach out to our support team.
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

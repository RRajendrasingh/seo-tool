import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import FaqAccordion from "@/components/home/FaqAccordion";

export const metadata = {
  title: "Contact Us | SEOIntellect AI Technical SEO & AEO Specialists",
  description: "Get in touch with SEOIntellect AI. Contact us for custom technical page speed audits, answer engine optimization (AEO), and managed organic SEO campaigns.",
  keywords: [
    "contact SEOIntellect",
    "AEO consultation",
    "technical audit inquiry",
    "SEO services contact"
  ],
};

export default function ContactPage() {
  const faqItems = [
    {
      q: "How long does a technical audit take?",
      a: "Our automated diagnostic scanner scans your website in less than 20 seconds. For bespoke enterprise audits or manual technical consults, our team delivers complete code-ready checklists within 3 to 5 business days.",
    },
    {
      q: "What is AEO & GEO optimization?",
      a: "AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) format your website's semantic coding and textual answers so conversational AI engines (like ChatGPT Search, Claude, and Gemini) extract and cite your website as the primary source when responding to user search queries.",
    },
    {
      q: "Do you offer full-service managed SEO?",
      a: "Yes! In addition to our instant technical auditor, we provide fully-managed SEO campaigns including structured data injections, internal linking maps, high-authority link acquisition, and monthly core ranking tracking.",
    },
    {
      q: "Can I cancel my plan or request a refund?",
      a: "Our packages are configured for fixed durations (such as 1-month or 3-month access blocks) and automatically expire once the term is completed. We do not provide a manual cancellation button or mid-term cancellation options. All purchases are final, and we do not offer automatic or prorated refunds for partial periods.",
    },
  ];

  return (
    <main className="relative isolate overflow-hidden bg-zinc-950 text-zinc-300 min-h-screen [.light_&]:bg-slate-50 [.light_&]:text-slate-700">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0ea5e905_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e905_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" aria-hidden="true" />
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" aria-hidden="true" />

      {/* Hero header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 sm:pt-24 lg:px-8 text-center space-y-4">
        <span className="inline-flex items-center gap-x-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-5 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest [.light_&]:bg-indigo-50 [.light_&]:border-indigo-100 [.light_&]:text-indigo-600">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl [.light_&]:text-slate-900 leading-none">
          Contact Our Specialists
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto [.light_&]:text-slate-500 leading-relaxed">
          Have questions about Core Web Vitals, AEO citation setups, or enterprise SEO services? Drop us a message below.
        </p>
      </header>

      {/* Grid container */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Info, Who We Are, Direct Contacts */}
          <div className="lg:col-span-5 space-y-8 text-left">
            
            {/* Who We Are & What We Provide */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white [.light_&]:text-slate-900">Who We Are & What We Provide</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed [.light_&]:text-slate-500">
                SEOIntellect AI is a leading technical marketing platform designed to prepare websites for the next era of organic search. We combine deep technical Lighthouse performance audits, structured data generation, and custom managed search engine optimization services to help brands rank on both Google and conversational AI networks.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4 border-t border-zinc-900/60 pt-8 [.light_&]:border-slate-200">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider [.light_&]:text-slate-900">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-4 space-y-2 hover:border-zinc-800 transition-all [.light_&]:bg-white [.light_&]:border-slate-200">
                  <span className="text-indigo-400 font-black block text-xs uppercase tracking-wider">Email Us</span>
                  <Link href="mailto:support@seointellect.com" className="text-xs text-zinc-300 font-bold hover:text-white [.light_&]:text-slate-700 [.light_&]:hover:text-indigo-600 block">
                    support@seointellect.com
                  </Link>
                  <span className="text-[10px] text-zinc-500 block leading-tight">General & sales support</span>
                </div>

                <div className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-4 space-y-2 hover:border-zinc-800 transition-all [.light_&]:bg-white [.light_&]:border-slate-200">
                  <span className="text-indigo-400 font-black block text-xs uppercase tracking-wider">Office</span>
                  <span className="text-xs text-zinc-300 font-bold [.light_&]:text-slate-700 block">
                    San Francisco, CA
                  </span>
                  <span className="text-[10px] text-zinc-500 block leading-tight">Downtown business hub</span>
                </div>

              </div>
            </div>

            {/* General Info Card */}
            <div className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-5 space-y-3 [.light_&]:bg-white [.light_&]:border-slate-200">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider [.light_&]:text-slate-900">Working Hours</h4>
              <p className="text-xs text-zinc-400 leading-relaxed [.light_&]:text-slate-500">
                Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST. Online audit generators and API checkers remain active 24/7/365.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 [.light_&]:border-slate-200" aria-labelledby="contact-faq">
        <div className="text-center space-y-4 mb-12">
          <span className="inline-flex items-center gap-x-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest [.light_&]:bg-indigo-50 [.light_&]:border-indigo-100 [.light_&]:text-indigo-600">
            Common Inquiries
          </span>
          <h2 id="contact-faq" className="text-3xl font-extrabold tracking-tight text-white [.light_&]:text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <FaqAccordion items={faqItems} />
      </section>
    </main>
  );
}

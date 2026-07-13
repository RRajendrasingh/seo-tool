"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
  const [activeFaq, setActiveFaq] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 320);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Pricing details aligned with actual database plans and stripe products
  const plans = {
    free: {
      name: "Free Audit",
      price: "$0",
      period: "forever",
      cta: "Start Free Audit",
      href: "/audit/",
    },
    single: {
      name: "Starter Report",
      price: "$9.99",
      period: "once",
      cta: "Get Starter Report",
      href: "/checkout?plan=single",
    },
    weekly: {
      name: "Pro Monitor",
      price: billingCycle === "monthly" ? "$29" : "$23",
      period: "month",
      cta: "Start Pro Plan",
      href: `/checkout?plan=weekly${billingCycle === "yearly" ? "&billing=yearly" : ""}`,
    },
    agency: {
      name: "Agency Sales",
      price: billingCycle === "monthly" ? "$99" : "$79",
      period: "month",
      cta: "Start Agency Plan",
      href: `/checkout?plan=agency${billingCycle === "yearly" ? "&billing=yearly" : ""}`,
    },
    enterprise: {
      name: "Enterprise",
      price: billingCycle === "monthly" ? "$199" : "$159",
      period: "month",
      cta: "Start Enterprise",
      href: `/checkout?plan=multi${billingCycle === "yearly" ? "&billing=yearly" : ""}`,
    },
  };

  const featureGroups = [
    {
      category: "Performance & Technical Auditing",
      features: [
        {
          name: "Page Speed Diagnostics",
          desc: "Full scanning of mobile and desktop Core Web Vitals parameters.",
          values: ["Basic", "Standard", "Advanced", "Continuous", "Continuous + API"],
        },
        {
          name: "Semantic HTML Validation",
          desc: "Audit of header structures, alt tags, and deprecation elements.",
          values: [true, true, true, true, true],
        },
        {
          name: "Mobile Responsiveness Diagnostics",
          desc: "Checks sizing viewport issues and layout shift constraints.",
          values: [true, true, true, true, true],
        },
        {
          name: "Security Headers Audit",
          desc: "Analyzes CORS policies, HTTPS status, and script parameters.",
          values: [false, "Basic", true, true, true],
        },
        {
          name: "Image Aspect Ratio Validation",
          desc: "Detects layout distortions caused by unconstrained media.",
          values: [false, true, true, true, true],
        },
      ],
    },
    {
      category: "AI Optimization & AEO Tools",
      features: [
        {
          name: "SEO Chatbot Access",
          desc: "Conversational audit assistant powered by Gemini API.",
          values: [false, "Limited (5/day)", "Full Access", "Full Access", "Full Access"],
        },
        {
          name: "Speech Recognition Dictation",
          desc: "Enables voice-to-text dictation for SEO inquiries.",
          values: [true, true, true, true, true],
        },
        {
          name: "Priority Fix-list Categorization",
          desc: "Consolidated, impact-sorted list of warning errors.",
          values: [false, false, true, true, true],
        },
        {
          name: "AI Citation Simulation",
          desc: "Simulates search index recommendation rates in Perplexity.",
          values: [false, false, "Limited", "Full Analysis", "Full + API"],
        },
      ],
    },
    {
      category: "Reporting & White-Label Customization",
      features: [
        {
          name: "PDF Report Downloads",
          desc: "Exporting raw search audits as printable PDF templates.",
          values: [false, true, true, true, true],
        },
        {
          name: "White-Label Branding",
          desc: "Removes default indicators and applies custom agency logos.",
          values: [false, false, false, true, true],
        },
        {
          name: "Custom Client Dashboard",
          desc: "Dedicated user panel configured with agency logo preferences.",
          values: [false, false, false, true, true],
        },
        {
          name: "Stacked Domain Monitors",
          desc: "Allowed monitors to be tracked simultaneously.",
          values: ["1 Domain", "1 Domain", "3 Domains", "25 Domains", "100 Domains"],
        },
        {
          name: "Priority Customer Support",
          desc: "Direct access to our senior engineering support team.",
          values: [false, false, "Email Support", "24/7 Priority", "Dedicated Manager"],
        },
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes. You can manage your subscription settings directly through your dashboard. If you upgrade, the new tier features will take effect immediately. Downgrades will be adjusted at the end of your current billing cycle.",
    },
    {
      q: "Are the domain monitors stackable?",
      a: "Absolutely. If you hold multiple subscriptions (for example, one Agency Suite and one Weekly Pro), your total allowed domains quota will automatically aggregate, giving you 6 active domain monitors in total.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day refund window for recurring monthly subscriptions if you are not satisfied with the analytical tools provided. Single PDF audit package purchases are non-refundable once the report has been generated.",
    },
    {
      q: "Does the white-label customizer support custom subdomains?",
      a: "The Agency Suite lets you upload your custom logo and agency name which will render on all client dashboards and downloaded PDF reports. Custom domain mapping is available for custom enterprise plans.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-zinc-950 min-h-screen text-left relative overflow-x-hidden pb-20 [.light_&]:bg-slate-50 [.light_&]:text-slate-900">
        
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10 text-center">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-sm [.light_&]:bg-violet-50 [.light_&]:border-violet-200 [.light_&]:text-violet-600">
            Plans & Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-6 tracking-tight leading-tight [.light_&]:text-slate-900">
            Find the right plan for your search growth
          </h1>
          <p className="text-sm text-zinc-400 mt-4 max-w-xl mx-auto leading-relaxed [.light_&]:text-slate-600">
            Compare our subscription tiers to choose the optimal balance of technical speed audits, generative engine optimization simulations, and white-label agency tools.
          </p>

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-xs font-medium ${billingCycle === "monthly" ? "text-white [.light_&]:text-slate-900" : "text-zinc-500"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-11 h-6 bg-zinc-800 rounded-full transition-colors focus:outline-none border border-zinc-700/50 [.light_&]:bg-slate-200 [.light_&]:border-slate-300"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  billingCycle === "yearly" ? "translate-x-5 bg-violet-500" : ""
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-2 ${billingCycle === "yearly" ? "text-white [.light_&]:text-slate-900" : "text-zinc-500"}`}>
              Annual billing
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 [.light_&]:bg-emerald-50 [.light_&]:text-emerald-700 [.light_&]:border-emerald-200">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic Comparison Matrix */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="border border-zinc-850 bg-zinc-900/10 rounded-3xl overflow-hidden backdrop-blur-md [.light_&]:border-slate-200 [.light_&]:bg-white shadow-xl">
            
            {/* Sticky/Fixed Plan Cards Header */}
            <div className={`grid grid-cols-12 border-b border-zinc-850 p-6 sm:p-8 items-center transition-all duration-300 [.light_&]:border-slate-200 ${
              isSticky 
                ? "sticky top-16 bg-zinc-950/95 shadow-md z-40 backdrop-blur-lg border-t border-zinc-850 [.light_&]:bg-white/95 [.light_&]:border-slate-200" 
                : "bg-transparent"
            }`}>
              <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 [.light_&]:text-slate-400">
                  Feature Set
                </span>
              </div>
              <div className="col-span-12 lg:col-span-9 grid grid-cols-5 gap-2 sm:gap-4 text-center">
                {Object.entries(plans).map(([key, plan]) => (
                  <div key={key} className="space-y-2">
                    <span className="text-xs font-black text-white block truncate [.light_&]:text-slate-900">
                      {plan.name}
                    </span>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-sm sm:text-base font-extrabold text-white [.light_&]:text-slate-900">
                        {plan.price}
                      </span>
                      {key !== "free" && (
                        <span className="text-[9px] sm:text-[10px] text-zinc-500 lowercase">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                    <Link
                      href={plan.href}
                      className={`inline-block w-full py-2 rounded-xl text-[9px] sm:text-[10px] font-bold text-center transition-all cursor-pointer ${
                        key === "weekly"
                          ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/10 hover:shadow-violet-600/20"
                          : "border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 [.light_&]:border-slate-200 [.light_&]:bg-slate-50 [.light_&]:text-slate-700 [.light_&]:hover:bg-slate-100"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Comparison Table */}
            <div className="divide-y divide-zinc-900 [.light_&]:divide-slate-100">
              {featureGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="p-6 sm:p-8">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 [.light_&]:text-slate-400">
                    {group.category}
                  </h3>
                  <div className="space-y-6">
                    {group.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="grid grid-cols-12 items-center gap-4 py-2 border-b border-zinc-900/50 pb-4 [.light_&]:border-slate-100/50 last:border-0 last:pb-0">
                        
                        {/* Feature Info */}
                        <div className="col-span-12 lg:col-span-3 space-y-1">
                          <h4 className="text-xs font-bold text-white [.light_&]:text-slate-900">
                            {feature.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 leading-normal max-w-xs [.light_&]:text-slate-500">
                            {feature.desc}
                          </p>
                        </div>

                        {/* Feature Values across Tiers */}
                        <div className="col-span-12 lg:col-span-9 grid grid-cols-5 gap-2 sm:gap-4 items-center text-center">
                          {feature.values.map((val, idx) => (
                            <div key={idx} className="flex justify-center text-xs">
                              {typeof val === "boolean" ? (
                                val ? (
                                  // Green Checkmark SVG (No Emoji)
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 [.light_&]:bg-emerald-50 [.light_&]:text-emerald-600 [.light_&]:border-emerald-100">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  // Grey Cross SVG (No Emoji)
                                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-zinc-600 flex items-center justify-center border border-zinc-800/50 [.light_&]:bg-slate-100 [.light_&]:text-slate-400 [.light_&]:border-slate-200/50">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </span>
                                )
                              ) : (
                                // Styled Text Pill
                                <span className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                  val.includes("Full") || val.includes("Advanced") || val.includes("Continuous")
                                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20 [.light_&]:bg-violet-50 [.light_&]:text-violet-700 [.light_&]:border-violet-200"
                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 [.light_&]:bg-slate-100 [.light_&]:text-slate-600 [.light_&]:border-slate-200"
                                }`}>
                                  {val}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
          <h2 className="text-2xl font-black text-white text-center tracking-tight leading-tight [.light_&]:text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500 text-center mt-2 [.light_&]:text-slate-500">
            Everything you need to know about our subscriptions, payments, and quotas.
          </p>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-850 bg-zinc-900/10 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-zinc-800 [.light_&]:border-slate-200 [.light_&]:bg-white [.light_&]:hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white uppercase tracking-wider [.light_&]:text-slate-800">
                      {faq.q}
                    </span>
                    <span className="text-zinc-500 shrink-0">
                      {isOpen ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 -rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-zinc-900/50 [.light_&]:border-slate-100">
                      <p className="text-xs text-zinc-400 leading-relaxed [.light_&]:text-slate-600">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

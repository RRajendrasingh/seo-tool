"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
  const [activeFaq, setActiveFaq] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  const tableRef = useRef(null);
  const headerRef = useRef(null);

  const handleScrollSync = (e) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 120);
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

  const getShortPlanName = (name) => {
    if (name.includes("Free")) return "Free";
    if (name.includes("Starter")) return "Starter";
    if (name.includes("Pro")) return "Pro";
    if (name.includes("Agency")) return "Agency";
    if (name.includes("Enterprise")) return "Ent.";
    return name;
  };

  const getShortValue = (val) => {
    if (typeof val === "boolean") return val;
    if (val === "Continuous + API") return "Cont. + API";
    if (val === "Continuous") return "Cont.";
    if (val === "Full Analysis") return "Full";
    if (val === "1 Domain") return "1 Dom.";
    if (val === "3 Domains") return "3 Dom.";
    if (val === "25 Domains") return "25 Dom.";
    if (val === "100 Domains") return "100 Dom.";
    return val;
  };

  const getShortCta = (key, cta) => {
    if (key === "free") return "Free";
    if (cta.includes("Contact")) return "Contact";
    return "Buy";
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-left relative pb-20 [.light_&]:bg-[#f8f6f0] [.light_&]:text-slate-900 pricing-page">
        
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 sm:pt-16 sm:pb-12 relative z-10 text-center">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-sm [.light_&]:bg-violet-50 [.light_&]:border-violet-200 [.light_&]:text-violet-650">
            Plans & Pricing
          </span>
          <h1 className="text-2xl sm:text-5xl font-black text-white mt-3 sm:mt-6 tracking-tight leading-tight [.light_&]:text-slate-900">
            Find the right plan for your search growth
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 sm:mt-4 max-w-xl mx-auto leading-relaxed [.light_&]:text-slate-600">
            Compare our subscription tiers to choose the optimal balance of technical speed audits, generative engine optimization simulations, and white-label agency tools.
          </p>

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-4 mt-4 sm:mt-10">
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
          
          {/* Synced Sticky Header (pinned vertically at top-16) */}
          <div 
            ref={headerRef} 
            className={`sticky top-16 z-40 overflow-hidden bg-[#09090b] [.light_&]:bg-[#efebe0] border-t border-x border-zinc-850 [.light_&]:border-[#e5e1d3] rounded-t-3xl transition-all duration-300 ${
              isSticky ? "shadow-md border-b border-zinc-850/80 [.light_&]:border-b-[#e5e1d3]" : "shadow-sm"
            }`}
          >
            <table className="w-full min-w-[740px] border-collapse text-left table-fixed">
              <colgroup>
                <col className="w-[140px] sm:w-[220px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
              </colgroup>
              <thead>
                <tr className="bg-transparent">
                  {/* Top-Left: Feature Set (sticks left-0) */}
                  <th className="p-4 bg-[#09090b] [.light_&]:bg-[#efebe0] border-r border-zinc-850/40 [.light_&]:border-[#e5e1d3] sticky left-0 z-50 rounded-tl-[22px]">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 [.light_&]:text-slate-400">
                      Feature Set
                    </span>
                  </th>
                  {/* Plan Names and CTA buttons */}
                  {Object.entries(plans).map(([key, plan], idx, arr) => (
                    <th 
                      key={key} 
                      className={`p-4 text-center align-top bg-[#09090b] [.light_&]:bg-[#f9f6ee] ${
                        idx === arr.length - 1 ? "rounded-tr-[22px]" : ""
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] sm:text-xs font-black text-white block truncate [.light_&]:text-slate-900">
                          {getShortPlanName(plan.name)}
                        </span>
                        <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-center sm:gap-0.5">
                          <span className="text-[9px] sm:text-base font-extrabold text-white [.light_&]:text-slate-900">
                            {plan.price}
                          </span>
                          {key !== "free" && (
                            <span className="text-[8px] sm:text-[10px] text-zinc-500 lowercase hidden sm:inline">
                              /{plan.period}
                            </span>
                          )}
                        </div>
                        <Link
                          href={plan.href}
                          className={`inline-block w-full py-2 rounded-xl text-[9px] sm:text-[10px] font-bold text-center transition-all cursor-pointer ${
                            key === "weekly"
                              ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/10 hover:shadow-violet-600/20"
                              : "border border-zinc-850 bg-[#09090b] text-zinc-300 hover:bg-[#18181b] [.light_&]:border-slate-200 [.light_&]:bg-[#efebe0] [.light_&]:text-slate-700 [.light_&]:hover:bg-slate-100"
                          }`}
                        >
                          {plan.cta}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable Table Body Container */}
          <div 
            ref={tableRef} 
            onScroll={handleScrollSync} 
            className="overflow-x-auto no-scrollbar bg-[#18181b]/10 [.light_&]:bg-[#f9f6ee] border-b border-x border-zinc-850 [.light_&]:border-[#e5e1d3] rounded-b-3xl shadow-xl"
          >
            <table className="w-full min-w-[740px] border-collapse text-left table-fixed">
              <colgroup>
                <col className="w-[140px] sm:w-[220px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
                <col className="w-[120px] sm:w-[150px]" />
              </colgroup>
              <tbody className="divide-y divide-zinc-900/50 [.light_&]:divide-[#e5e1d3]/50">
                {featureGroups.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    {/* Category Header Row (Left-only alignment like Google One) */}
                    <tr className="bg-[#18181b]/20 [.light_&]:bg-[#efebe0]/60">
                      <td className="p-4 sticky left-0 z-20 bg-[#09090b] [.light_&]:bg-[#efebe0] font-bold text-xs text-white [.light_&]:text-slate-900 border-r border-zinc-850/40 [.light_&]:border-[#e5e1d3] w-[140px] sm:w-[220px] min-w-[140px] sm:min-w-[220px]">
                        {group.category}
                      </td>
                      <td className="bg-[#18181b]/10 [.light_&]:bg-[#efebe0]/20"></td>
                      <td className="bg-[#18181b]/10 [.light_&]:bg-[#efebe0]/20"></td>
                      <td className="bg-[#18181b]/10 [.light_&]:bg-[#efebe0]/20"></td>
                      <td className="bg-[#18181b]/10 [.light_&]:bg-[#efebe0]/20"></td>
                      <td className="bg-[#18181b]/10 [.light_&]:bg-[#efebe0]/20"></td>
                    </tr>
                    
                    {/* Feature Rows */}
                    {group.features.map((feature, featureIdx) => (
                      <tr key={featureIdx} className="hover:bg-[#18181b]/5 [.light_&]:hover:bg-[#efebe0]/20 transition-colors">
                        {/* Feature Info (sticky left-0) */}
                        <td className="p-4 sticky left-0 z-20 bg-[#09090b] [.light_&]:bg-[#efebe0] border-r border-zinc-850/40 [.light_&]:border-[#e5e1d3] w-[140px] sm:w-[220px] min-w-[140px] sm:min-w-[220px] align-top">
                          <h4 className="text-[10px] sm:text-xs font-bold text-white [.light_&]:text-slate-900">
                            {feature.name}
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-normal mt-0.5 max-w-[200px] [.light_&]:text-slate-500 whitespace-normal">
                            {feature.desc}
                          </p>
                        </td>

                        {/* Feature Values across Tiers */}
                        {feature.values.map((val, idx) => (
                          <td key={idx} className="p-4 text-center align-middle w-[120px] sm:w-[150px] min-w-[120px] sm:min-w-[150px] bg-transparent [.light_&]:bg-[#f9f6ee]">
                            <div className="flex justify-center text-xs">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border shadow-sm ${
                                    idx >= 3
                                      ? "bg-[#1a73e8] text-white border-[#1a73e8]"
                                      : "bg-[#137333] text-white border-[#137333]"
                                  }`}>
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="#ffffff" strokeWidth="3.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="text-[#bfae99] dark:text-[#5a5650] flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </span>
                                )
                              ) : (
                                <span className={`text-[7px] sm:text-[10px] font-bold px-0.5 sm:px-2.5 py-1 rounded-full border min-h-[20px] sm:min-h-[24px] flex items-center justify-center whitespace-normal break-words leading-none text-center ${
                                  val.includes("Full") || val.includes("Advanced") || val.includes("Continuous")
                                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20 [.light_&]:bg-violet-50 [.light_&]:text-violet-700 [.light_&]:border-violet-200"
                                    : "bg-[#18181b] text-zinc-400 border-zinc-800 [.light_&]:bg-slate-100 [.light_&]:text-slate-600 [.light_&]:border-slate-200"
                                }`}>
                                  <span className="hidden sm:inline">{val}</span>
                                  <span className="inline sm:hidden">{getShortValue(val)}</span>
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
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
  );
}

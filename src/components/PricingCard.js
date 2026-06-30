"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PricingCard({
  name,
  price,
  period,
  desc,
  features,
  buttonText,
  href,
  popular
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setActivePlan(data.user.subscription_tier);
      })
      .catch(() => {});
  }, []);

  const visibleFeatures = features;
  const hasMoreDetails = !!desc;
  
  // Extract planKey from href (e.g., "/checkout?plan=weekly" -> "weekly")
  const planKey = href?.split("=")?.[1];
  const isActive = activePlan && activePlan === planKey;

  return (
    <div
      className={`rounded-[2rem] bg-slate-900/40 [.light_&]:bg-white/80 border backdrop-blur-md flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative overflow-hidden h-full shadow-lg [.light_&]:shadow-slate-200/50 ${
        isActive 
          ? "border-t-[6px] border-t-emerald-500 border-x-emerald-500/50 border-b-emerald-500/50 [.light_&]:border-x-emerald-500 [.light_&]:border-b-emerald-500 shadow-xl shadow-emerald-500/20"
          : popular
            ? "border-t-[6px] border-t-indigo-500 border-x-slate-800 border-b-slate-800 [.light_&]:border-x-slate-200 [.light_&]:border-b-slate-200 shadow-xl shadow-indigo-500/10"
            : "border-t-[6px] border-t-cyan-500 border-x-slate-800 border-b-slate-800 [.light_&]:border-x-slate-200 [.light_&]:border-b-slate-200"
      }`}
    >
      {/* Diagonal Ribbon Offer or Active Plan Indicator */}
      <div className="absolute top-0 right-0 h-20 w-20 overflow-hidden select-none pointer-events-none">
        {isActive ? (
          <div className="absolute top-3 -right-7 w-24 rotate-45 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500">
            Active
          </div>
        ) : (
          <div className={`absolute top-3 -right-7 w-24 rotate-45 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white shadow-sm bg-gradient-to-r ${
            popular ? "from-indigo-600 to-indigo-500" : "from-cyan-600 to-cyan-500"
          }`}>
            Offer
          </div>
        )}
      </div>

      <div className="p-8 space-y-5 text-left flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-6 flex items-center gap-2">
            {isActive && (
              <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 [.light_&]:text-emerald-600 uppercase tracking-wide">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Current Plan
              </div>
            )}
            {!isActive && popular && (
              <div className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400 [.light_&]:text-indigo-600 uppercase tracking-wide">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2h2a2 2 0 002-2z" />
                </svg>
                Most Popular
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white [.light_&]:text-slate-900">{name}</h3>
          </div>

          {/* Features List */}
          <ul className="space-y-4 min-h-[180px] pt-2">
            {visibleFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 [.light_&]:text-slate-600 font-medium">
                <div className="rounded-full bg-cyan-500/20 p-1 mt-0.5">
                  <svg className="h-3 w-3 text-cyan-400 [.light_&]:text-cyan-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800/60 [.light_&]:border-slate-200">
          {/* Price */}
          <div className="flex items-baseline text-white [.light_&]:text-slate-900">
            <span className="text-4xl font-extrabold tracking-tight">US{price}</span>
            <span className="ml-2 text-sm font-semibold text-slate-400 [.light_&]:text-slate-500">{period}</span>
          </div>

          {/* Description */}
          {isExpanded && (
            <div className="pt-2 animate-fade-in">
              <p className="text-sm text-slate-400 [.light_&]:text-slate-500 leading-relaxed font-medium">
                {desc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 pb-8 space-y-4">
        {isActive ? (
          <div
            className="flex w-full items-center justify-center rounded-[1.25rem] py-4 text-sm font-bold bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 cursor-default"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Active Plan
          </div>
        ) : (
          <Link
            href={href}
            className={`flex w-full items-center justify-center rounded-[1.25rem] py-4 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${
              popular
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20"
                : "bg-slate-800 [.light_&]:bg-slate-100 text-white [.light_&]:text-slate-900 hover:bg-slate-700 [.light_&]:hover:bg-slate-200 border border-slate-700 [.light_&]:border-slate-300"
            }`}
          >
            {buttonText}
          </Link>
        )}
        {hasMoreDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-center text-xs font-semibold text-slate-400 [.light_&]:text-slate-500 hover:text-white [.light_&]:hover:text-slate-900 transition-colors"
          >
            {isExpanded ? "Hide Details" : "See Details"}
          </button>
        )}
      </div>
    </div>
  );
}

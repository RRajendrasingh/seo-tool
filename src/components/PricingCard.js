"use client";

import { useState } from "react";
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

  // All features (bullet points) are always visible
  const visibleFeatures = features;

  // See More toggles the middle description paragraph details
  const hasMoreDetails = !!desc;

  return (
    <div
      className={`rounded-2xl bg-zinc-900/40 border backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden h-full ${
        popular
          ? "border-t-4 border-t-green-500 border-x-zinc-800 border-b-zinc-800 shadow-2xl shadow-cyan-400/5"
          : "border-t-4 border-t-emerald-450 border-x-zinc-800 border-b-zinc-800"
      }`}
    >
      {/* Diagonal Ribbon Offer */}
      <div className="absolute top-0 right-0 h-20 w-20 overflow-hidden select-none pointer-events-none">
        <div className={`absolute top-3 -right-7 w-24 rotate-45 py-0.5 text-center text-[7px] font-black uppercase tracking-widest text-white shadow-sm bg-gradient-to-r ${
          popular ? "from-orange-600 to-red-500" : "from-blue-600 to-blue-500"
        }`}>
          Offer
        </div>
      </div>

      <div className="p-8 space-y-5 text-left flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {/* Badge for Popular - wrapped in a fixed height container to align all card headings */}
          <div className="h-6 flex items-center">
            {popular && (
              <div className="inline-flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/5 px-2 py-0.5 text-[9px] font-bold text-green-500 uppercase tracking-wide">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Most Popular
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">{name}</h3>
          </div>

          {/* Features List */}
          <ul className="space-y-3 min-h-[180px]">
            {visibleFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-400">
                <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-800/40">
          {/* Price */}
          <div className="flex items-baseline text-white">
            <span className="text-3xl font-extrabold tracking-tight">US{price}</span>
            <span className="ml-1 text-[10px] font-semibold text-zinc-400">{period}</span>
          </div>

          {/* Description */}
          {isExpanded && (
            <div className="pt-2">
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {desc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 pb-8 space-y-4">
        <Link
          href={href}
          className={`flex w-full items-center justify-center rounded-xl py-3.5 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md ${
            popular
              ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-600/25"
              : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/15"
          }`}
        >
          {buttonText}
        </Link>
        <div className="text-center">
          {hasMoreDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-bold text-zinc-400 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer select-none"
            >
              {isExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

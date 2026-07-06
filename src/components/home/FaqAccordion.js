"use client";

import { useState } from "react";

export default function FaqAccordion({ items }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="space-y-4 text-left">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-850 transition-colors overflow-hidden"
        >
          <button
            onClick={() => toggleFaq(idx)}
            aria-expanded={expandedFaq === idx}
            className="flex items-center justify-between w-full p-6 text-sm font-bold text-white select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <span className="text-left">{item.q}</span>
            <span className={`text-xs text-slate-500 transform transition-transform duration-200 ${expandedFaq === idx ? "rotate-180 text-cyan-400" : ""}`} aria-hidden="true">
              ▼
            </span>
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expandedFaq === idx ? "max-h-48 border-t border-slate-900" : "max-h-0"
            }`}
          >
            <div className="p-6 text-xs text-slate-400 leading-relaxed bg-slate-950/40">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

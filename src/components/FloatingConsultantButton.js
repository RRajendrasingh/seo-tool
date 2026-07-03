/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { openCalendly } from "@/utils/calendly";

export default function FloatingConsultantButton({ session }) {
  const [user, setUser] = useState(session);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!session && typeof window !== "undefined") {
      const guestEmail = localStorage.getItem("guest_email");
      const guestName = localStorage.getItem("guest_name");
      if (guestEmail || guestName) {
        setUser({
          email: guestEmail || "",
          name: guestName || ""
        });
      }
    }
  }, [session]);

  if (!mounted) return null;

  const handleClick = () => {
    openCalendly(user?.email || "", user?.name || "");
  };

  return (
    <>
      {/* DESKTOP VIEW: Full Chat-style card (visible on md screens and up) */}
      <div
        onClick={handleClick}
        className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-3 rounded-2xl border border-zinc-800 bg-slate-950/85 backdrop-blur-md p-3.5 pr-5 shadow-2xl hover:border-violet-500/30 hover:shadow-violet-600/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer print:hidden select-none group max-w-[290px]"
        style={{
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.15)"
        }}
      >
        {/* Avatar Wrapper with status dot & camera badge */}
        <div className="relative h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-lg overflow-visible flex-shrink-0">
          👨‍💼
          {/* Google Meet Video Camera Badge */}
          <span className="absolute -top-1 -left-1 flex h-4.5 w-4.5 rounded-full bg-violet-600 border border-slate-950 items-center justify-center text-[9px] text-white shadow-sm">
            📹
          </span>
          {/* Status dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
          </span>
        </div>

        {/* Text Info */}
        <div className="space-y-0.5 text-left min-w-0 pr-1 flex-grow">
          <h4 className="text-[11px] font-extrabold text-white tracking-tight flex items-center gap-1 leading-none">
            1-on-1 Google Meet
            <span className="text-[8px] font-normal text-violet-400 animate-pulse">(Online)</span>
          </h4>
          <p className="text-[9px] text-zinc-400 font-medium leading-normal truncate">
            Book 15m video SEO strategy call
          </p>
        </div>

        {/* Arrow helper */}
        <div className="text-[10px] text-zinc-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0">
          →
        </div>
      </div>

      {/* MOBILE VIEW: Compact Circular Bubble (visible on screens below md) */}
      <div
        onClick={handleClick}
        className="flex md:hidden fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full border border-zinc-800 bg-slate-950/85 backdrop-blur-md items-center justify-center shadow-xl hover:border-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer print:hidden select-none"
        style={{
          boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.4), 0 0 10px rgba(124, 58, 237, 0.15)"
        }}
      >
        <span className="text-xl">📹</span>
        {/* Status dot in the corner */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
        </span>
      </div>
    </>
  );
}

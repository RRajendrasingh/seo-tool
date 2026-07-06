/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { openCalendly } from "@/utils/calendly";

export default function FloatingConsultantButton({ session }) {
  const [user, setUser] = useState(session);
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Questionnaire modal states
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState(session?.name || session?.user?.name || "");
  const [email, setEmail] = useState(session?.email || session?.user?.email || "");
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
    // Widget defaults to minimized (isMinimized = true) for all screens
    // No auto-expand logic here anymore per user request.
    
    if (session) {
      setName(session.name || session.user?.name || "");
      setEmail(session.email || session.user?.email || "");
    } else if (typeof window !== "undefined") {
      const guestEmail = localStorage.getItem("guest_email");
      const guestName = localStorage.getItem("guest_name");
      if (guestEmail || guestName) {
        setUser({
          email: guestEmail || "",
          name: guestName || ""
        });
        setName(guestName || "");
        setEmail(guestEmail || "");
      }
    }
  }, [session]);

  if (!mounted) return null;

  const handleOpenForm = (e) => {
    e.stopPropagation();
    // Re-verify latest pre-fill info
    if (session) {
      setName(session.name || session.user?.name || "");
      setEmail(session.email || session.user?.email || "");
    } else if (typeof window !== "undefined") {
      const guestEmail = localStorage.getItem("guest_email") || "";
      const guestName = localStorage.getItem("guest_name") || "";
      if (guestEmail && !email) setEmail(guestEmail);
      if (guestName && !name) setName(guestName);
    }
    setIsOpen(true);
  };

  const startSpeechRecognition = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg("");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setErrorMsg(`Voice input error (${event.error}). Please type your query.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("guest_email", email);
      localStorage.setItem("guest_name", name);
    }

    setErrorMsg("");
    setIsOpen(false);
    openCalendly(email, name, query);
  };

  return (
    <>
      {/* DESKTOP & MOBILE VIEW: Full Chat-style card (visible when not minimized) */}
      {!isMinimized && (
        <div className="fixed z-50 print:hidden select-none animate-fade-in-up group bottom-4 right-4 w-[280px] md:bottom-6 md:right-6 md:w-[260px]">
          {/* Animated Glow Aura */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 opacity-50 [.light_&]:hidden blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          {/* Gradient Border Wrapper */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 shadow-2xl [.light_&]:bg-none [.light_&]:bg-violet-200">
            <div className="relative h-full w-full rounded-[15px] bg-slate-950/95 [.light_&]:bg-white/95 backdrop-blur-xl p-3.5">
              
              {/* Header Title */}
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60 [.light_&]:border-slate-200 mb-2.5">
                <h4 className="text-[10px] font-extrabold text-white [.light_&]:text-slate-900 uppercase tracking-wider opacity-80 leading-none">
                  SEO Strategy Chat
                </h4>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                  className="text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                  aria-label="Minimize"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Profile Info Row */}
              <div className="flex items-center gap-2.5">
                {/* Avatar with glowing ring */}
                <div className="relative flex-shrink-0">
                  <div className="h-8 w-8 rounded-full border border-emerald-500/80 flex items-center justify-center bg-violet-600/10 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {/* Green status dot removed per user request */}
                </div>

                <div className="space-y-0.5 text-left flex-grow">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 [.light_&]:text-slate-600 block leading-tight">
                    Sarah - SEO Consultant
                  </span>
                  <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 leading-none">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="relative bg-white [.light_&]:bg-slate-100 text-slate-900 rounded-xl rounded-tl-none p-2.5 mt-2.5 text-[10px] font-semibold leading-relaxed shadow-sm [.light_&]:border [.light_&]:border-slate-200 text-left">
                <p>Hi! Let&apos;s optimize your site. Schedule a 15m Google Meet strategy call.</p>
                <span className="text-[7px] text-zinc-400 [.light_&]:text-slate-400 font-bold text-right mt-1.5 block select-none">
                  10:32 AM
                </span>
              </div>

              {/* Action Button & Meet Logo */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleOpenForm}
                  className="flex-grow inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 font-bold text-[9px] uppercase tracking-widest transition-all duration-200 border-0 cursor-pointer shadow-md shadow-blue-600/20 active:scale-98"
                >
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    SCHEDULE CALL
                  </span>
                </button>
                
                {/* Google Meet Logo */}
                <div className="flex-shrink-0 bg-white/5 border border-zinc-800 p-1.5 rounded-lg h-7.5 w-7.5 flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                    {/* Blue Camera Body */}
                    <rect x="3" y="6" width="11" height="12" rx="2" fill="#0080ff" />
                    {/* Green Camera lens */}
                    <path d="M14 10.5l5.5-4v11l-5.5-4v-3z" fill="#00e060" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT PILL (Mobile or Desktop when minimized) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsMinimized(false);
        }}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 print:hidden select-none group transition-all duration-300 flex-col items-end gap-2.5 ${
          isMinimized ? "flex" : "hidden"
        }`}
      >
        {!isOpen && (
          <div
            onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            className="flex flex-col items-end gap-2"
          >
            {/* Tooltip Bubble */}
            <div className="relative mr-4 sm:mr-5 animate-bounce" style={{ animationDuration: '2.5s' }}>
              <div className="bg-[#1a1625] border-none rounded-xl px-3 py-2 shadow-lg shadow-violet-500/10">
                <span className="text-xs font-bold leading-tight block drop-shadow-sm text-zinc-50">
                  Limited slots<br/>available.
                </span>
              </div>
              {/* Tooltip Arrow pointing exactly at the icon */}
              <div className="absolute -bottom-[5px] right-[18px] w-2.5 h-2.5 bg-[#1a1625] border-none transform rotate-45"></div>
            </div>

            {/* Pill Button */}
            <div className="relative h-[52px] rounded-[26px] border-2 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] bg-[#161320] hover:bg-[#1a1625] transition-colors flex items-center px-5 gap-3.5 hover:scale-105 active:scale-95 group">
              
              {/* Text on the Left */}
              <span className="text-[12.5px] font-bold tracking-wide leading-[1.1] text-right text-zinc-50">
                Free video<br/>consultancy
              </span>
              
              {/* Video Icon on the Right */}
              <svg className="w-5 h-5 shrink-0 text-zinc-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              
            </div>
          </div>
        )}
      </div>

      {/* PREQUESTIONNAIRE MODAL DIALOG */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md print:hidden overflow-y-auto flex justify-center"
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 w-full">
            <div className="relative w-full max-w-md group animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              {/* Animated Glow Aura behind Modal */}
              <div className="absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 opacity-40 [.light_&]:hidden blur-xl group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
              
              {/* Gradient Border Wrapper */}
              <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 shadow-2xl [.light_&]:bg-none [.light_&]:bg-slate-200">
                <div className="relative h-full w-full rounded-[23px] bg-slate-950/95 [.light_&]:bg-white/95 backdrop-blur-2xl p-5 sm:p-8">
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 sm:top-5 right-4 sm:right-5 h-8 w-8 rounded-full flex items-center justify-center bg-slate-900/50 border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-slate-800 hover:border-zinc-700 transition-all cursor-pointer [.light_&]:bg-slate-100 [.light_&]:border-slate-200 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 z-10 text-lg"
                  >
                    ✕
                  </button>

                  {/* Modal Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 sm:pb-5 border-b border-zinc-800/60 [.light_&]:border-slate-200/80 pr-6">
                    <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner shadow-violet-500/20 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-grow pt-0.5 sm:pt-1">
                      <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 [.light_&]:from-slate-900 [.light_&]:to-slate-600 leading-tight flex items-center gap-2 flex-wrap">
                        1-on-1 Strategy Meet
                        <span className="text-[9px] sm:text-[10px] font-bold text-violet-300 bg-violet-600/20 border border-violet-500/30 px-2 py-1 rounded shadow-[0_0_8px_rgba(139,92,246,0.3)] uppercase tracking-wider">Free</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-bold leading-relaxed mt-1 sm:mt-1.5 [.light_&]:text-slate-500">
                        Book a free 15 min strategy consultation call
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5">
                    {/* Preset Options */}
                    <div>
                      <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-zinc-500 block mb-2 sm:mb-3 [.light_&]:text-slate-400">
                        Select Your Main Goal:
                      </label>
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {[
                        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, text: "How to rank my website higher on Google" },
                        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>, text: "Creating a new website for my business" },
                        { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, text: "Improving my site speed & conversions" }
                      ].map((option) => {
                          const isSelected = query === option.text;
                          return (
                            <button
                              type="button"
                              key={option.text}
                              onClick={() => setQuery(option.text)}
                              className={`w-full text-left py-2.5 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer border ${
                                isSelected 
                                  ? "bg-violet-600/10 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/50 [.light_&]:bg-violet-50 [.light_&]:text-violet-700 [.light_&]:border-violet-500" 
                                  : "bg-slate-900/40 border-white/5 text-zinc-300 hover:bg-slate-800/60 hover:border-white/10 [.light_&]:bg-slate-50 [.light_&]:border-slate-200/80 [.light_&]:text-slate-700 [.light_&]:hover:border-slate-300"
                              }`}
                            >
                            <span className="mr-2.5 opacity-90 inline-flex items-center justify-center align-middle">{option.icon}</span> <span className="align-middle">{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                    {/* Textarea / Voice Input */}
                    <div>
                      <div className="flex justify-between items-center mb-2 sm:mb-2.5">
                        <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-zinc-500 block [.light_&]:text-slate-400">
                          Or details about your query:
                        </label>
                        {isListening && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-red-400 animate-pulse flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            Listening...
                          </span>
                        )}
                      </div>
                      <div className="relative group/textarea">
                        <textarea
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="E.g., I want to rank my local bakery website in New York..."
                          rows={2}
                          className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-3 sm:p-4 pr-12 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-slate-900/60 transition-all resize-none [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-900 [.light_&]:placeholder-slate-400 [.light_&]:focus:bg-white shadow-inner"
                        />
                        {/* Voice input mic button */}
                        <button
                          type="button"
                          onClick={startSpeechRecognition}
                          className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 text-sm sm:text-base ${
                            isListening
                              ? "bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                              : "bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white [.light_&]:bg-slate-200 [.light_&]:text-slate-500 [.light_&]:hover:bg-slate-300 [.light_&]:hover:text-slate-700"
                          }`}
                          title="Speak your query (Speech to Text)"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v2a7 7 0 01-14 0v-2m7 9V19m0 0a2 2 0 01-2 2h4a2 2 0 01-2-2m-3-12a3 3 0 116 0v4a3 3 0 11-6 0v-4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Name & Email Grid - stacked on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-zinc-500 block mb-1.5 sm:mb-2 [.light_&]:text-slate-400">
                          Your Name:
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-slate-900/60 transition-all shadow-inner [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-900 [.light_&]:placeholder-slate-400 [.light_&]:focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-zinc-500 block mb-1.5 sm:mb-2 [.light_&]:text-slate-400">
                          Email Address:
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          required
                          className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-slate-900/60 transition-all shadow-inner [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-900 [.light_&]:placeholder-slate-400 [.light_&]:focus:bg-white"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="text-[10px] sm:text-xs font-bold text-red-400 select-none text-center bg-red-500/10 border border-red-500/20 rounded-lg py-1.5 sm:py-2">{errorMsg}</div>
                    )}

                    {/* Submit */}
                    <div className="pt-1 sm:pt-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-[11px] sm:text-sm uppercase tracking-widest transition-all duration-300 border-0 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-[0.98]"
                      >
                        <span className="flex items-center justify-center gap-2.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Book Strategy Call</span>
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

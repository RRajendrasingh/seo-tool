"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactFormInner() {
  const searchParams = useSearchParams();
  const refCity = searchParams?.get("ref") || "";
  const planParam = searchParams?.get("plan") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "Technical Speed Audit",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (planParam === "foundation-seo") {
      setFormData((prev) => ({
        ...prev,
        service: "Foundation SEO Retainer ($499/mo)",
        message: "Hi, I want to subscribe to the Foundation SEO Retainer ($499/mo). Please reach out to set up our account and onboarding.",
      }));
    } else if (planParam === "growth-seo") {
      setFormData((prev) => ({
        ...prev,
        service: "Growth SEO Retainer ($1,299/mo)",
        message: "Hi, I want to subscribe to the Growth SEO Retainer ($1,299/mo). Please reach out to schedule our strategy call.",
      }));
    } else if (planParam === "market-dominance") {
      setFormData((prev) => ({
        ...prev,
        service: "Market Dominance Enterprise SEO ($2,999/mo)",
        message: "Hi, we are interested in the Market Dominance Enterprise SEO package ($2,999/mo). Please contact us to schedule a 1-on-1 strategy session.",
      }));
    } else if (refCity) {
      const formattedCity = refCity.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      setFormData((prev) => ({
        ...prev,
        service: `Managed Local SEO (${formattedCity})`,
        message: `Hi, I am interested in done-for-you Local SEO services targeting ${formattedCity}. Please reach out to schedule a video strategy call.`,
      }));
    }
  }, [refCity, planParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          service: formData.service,
          message: formData.message,
          source: refCity ? `location-ref-${refCity}` : "contact-page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        service: "Technical Speed Audit",
        message: "",
      });
    } catch (err) {
      console.error("Form Submit Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4 backdrop-blur-md">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white [.light_&]:text-slate-900">Consultancy Strategy Call Request Sent!</h3>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto [.light_&]:text-slate-600">
          Thank you! Our local SEO specialist team will reach out via email within 24 business hours to confirm your video consultancy time.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-5 hover:border-indigo-500/20 transition-all duration-300 [.light_&]:bg-white [.light_&]:border-slate-300">
      
      {refCity && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3.5 text-xs text-violet-300 font-mono flex items-center gap-2 [.light_&]:bg-violet-50 [.light_&]:border-violet-200 [.light_&]:text-violet-700">
          <span>🎥</span>
          <span>Targeting Local SEO Growth in <strong className="capitalize">{refCity.replace("-", " ")}</strong></span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold text-zinc-300 uppercase tracking-wider [.light_&]:text-slate-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [.light_&]:bg-white [.light_&]:text-slate-900 [.light_&]:border-slate-300"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-bold text-zinc-300 uppercase tracking-wider [.light_&]:text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. john@yourcompany.com"
          className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [.light_&]:bg-white [.light_&]:text-slate-900 [.light_&]:border-slate-300"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="service" className="text-xs font-bold text-zinc-300 uppercase tracking-wider [.light_&]:text-slate-700">
          Service Interest
        </label>
        <input
          type="text"
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [.light_&]:bg-white [.light_&]:text-slate-900 [.light_&]:border-slate-300"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-bold text-zinc-300 uppercase tracking-wider [.light_&]:text-slate-700">
          How Can We Help You?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your business, website URL, and target local goals..."
          className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none [.light_&]:bg-white [.light_&]:text-slate-900 [.light_&]:border-slate-300"
        />
      </div>

      {errorMsg && (
        <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider text-white shadow-lg shadow-violet-600/20 hover:scale-[1.01] transition-all disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <span>Request Video Strategy Call</span>
            <span>→</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-500 font-mono">
        Loading strategy call form...
      </div>
    }>
      <ContactFormInner />
    </Suspense>
  );
}

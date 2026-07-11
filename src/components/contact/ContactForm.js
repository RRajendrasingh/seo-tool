"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "Technical Speed Audit",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
          source: "contact-page",
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
        <h3 className="text-lg font-bold text-white [.light_&]:text-slate-900">Message Sent Successfully!</h3>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
          Thank you for reaching out. An SEO/AEO specialist from the SEOIntellect AI team will contact you back within 24 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-5 hover:border-indigo-500/20 transition-all duration-300">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
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
        <label htmlFor="email" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
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
        <label htmlFor="service" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Service Interest
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [.light_&]:bg-white [.light_&]:text-slate-900 [.light_&]:border-slate-300"
        >
          <option value="Technical Speed Audit">Technical Speed Audit</option>
          <option value="AEO/GEO Optimization">AEO & GEO Optimization</option>
          <option value="Managed SEO Campaign">Managed SEO Campaign</option>
          <option value="General Inquiry">General Inquiry</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          How Can We Help You?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your project, your site URL, and current goals..."
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
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.01] transition-all disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
          "Send Message →"
        )}
      </button>
    </form>
  );
}

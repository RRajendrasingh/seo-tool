"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function WidgetForm() {
  const searchParams = useSearchParams();
  
  const agencyName = searchParams.get("agencyName") || "SEOIntellect AI";
  const accent = "indigo";
  const logo = searchParams.get("logo") || "";

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAccentColors = (color) => {
    const map = {
      indigo: { hex: "#6366f1", bg: "bg-indigo-600 hover:bg-indigo-500", text: "text-indigo-400 border-indigo-500/30" },
      emerald: { hex: "#10b981", bg: "bg-emerald-600 hover:bg-emerald-500", text: "text-emerald-400 border-emerald-500/30" },
      violet: { hex: "#8b5cf6", bg: "bg-violet-600 hover:bg-violet-500", text: "text-violet-400 border-violet-500/30" },
      rose: { hex: "#f43f5e", bg: "bg-rose-600 hover:bg-rose-500", text: "text-rose-400 border-rose-500/30" },
      cyan: { hex: "#06b6d4", bg: "bg-cyan-600 hover:bg-cyan-500", text: "text-cyan-400 border-cyan-500/30" },
    };
    return map[color] || map.indigo;
  };

  const theme = getAccentColors(accent);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!url.includes(".")) {
      setError("Please provide a valid website domain.");
      setLoading(false);
      return;
    }

    try {
      // Save lead to database
      const leadPayload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "Not Provided",
        website: url.trim(),
        seoScore: 0,
        grade: "Pending",
        status: "New",
        packageRequest: "Free Audit Widget",
        amountPaid: 0,
        notes: `Lead captured via White-label Widget on agency site. Reference: ${agencyName}`
      };

      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      // Save lead to client-side store as backup (importing local storage logic inline)
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("seointellect_leads");
          const localLeads = raw ? JSON.parse(raw) : [];
          localLeads.unshift({
            id: `lead_${Date.now()}`,
            ...leadPayload,
            date: new Date().toISOString()
          });
          localStorage.setItem("seointellect_leads", JSON.stringify(localLeads));
        } catch (e) {
          console.error("Local storage lead backup failed:", e);
        }
      }

      // Redirect client to audit report with branding overrides
      const redirectUrl = `/audit?url=${encodeURIComponent(url.trim())}&agencyName=${encodeURIComponent(agencyName)}&agencyAccent=${accent}&agencyLogo=${encodeURIComponent(logo)}`;
      window.top.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      setError("Failed to process audit query. Please check your network.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 rounded-2xl border border-zinc-850 bg-zinc-900/40 backdrop-blur-xl text-left select-none">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" style={{ borderColor: theme.hex }}></div>
          <div>
            <h3 className="text-sm font-bold text-white">Initializing Audit Scan</h3>
            <p className="text-[10px] text-zinc-500 mt-1">Analyzing pagespeed and semantic tags for {url}...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Instant Website SEO Audit</h3>
            <span className="text-[9px] text-zinc-500 font-medium">Powered by {agencyName}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Website URL</label>
              <input
                type="url"
                required
                placeholder="https://yourbusiness.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 px-3.5 py-2 rounded-lg border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-rose-500 font-bold bg-rose-500/5 border border-rose-500/10 p-2 rounded">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className={`w-full rounded-lg text-xs font-bold text-white py-2.5 shadow-md transition-all active:scale-[0.99] cursor-pointer ${theme.bg}`}
          >
            Generate My SEO Audit
          </button>
        </form>
      )}
    </div>
  );
}

export default function WidgetPage() {
  return (
    <div className="bg-transparent min-h-[300px] flex items-center justify-center p-2">
      <Suspense fallback={
        <div className="text-zinc-500 text-xs py-10 font-medium animate-pulse">Loading form widget...</div>
      }>
        <WidgetForm />
      </Suspense>
    </div>
  );
}

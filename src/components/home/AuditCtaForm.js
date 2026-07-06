"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditCtaForm() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    router.push(`/audit/?url=${encodeURIComponent(targetUrl)}`);
  };

  return (
    <form onSubmit={handleAuditSubmit} className="mx-auto max-w-md">
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-2 backdrop-blur-md focus-within:border-cyan-500/50 transition-colors">
        <label htmlFor="audit-url" className="sr-only">Enter website URL</label>
        <input
          id="audit-url"
          type="text"
          required
          placeholder="e.g., mysite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none min-w-0"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-[0.98] flex-shrink-0"
        >
          Analyze Now
        </button>
      </div>
      <p className="mt-3 text-[10px] text-slate-500 text-center sm:text-left sm:pl-3">
        Instant scan. No credit card required.
      </p>
    </form>
  );
}

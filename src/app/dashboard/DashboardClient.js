"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScoreChart from "@/components/ScoreChart";

export default function DashboardClient({ user: initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  // States
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);

  // Agency branding states
  const [agencyName, setAgencyName] = useState(user.agency_name || "");
  const [logoPreview, setLogoPreview] = useState(user.agency_logo_id ? `/api/uploads/${user.agency_logo_id}` : null);
  const [logoFile, setLogoFile] = useState(null);
  const [brandingStatus, setBrandingStatus] = useState("");

  // Alert simulation state
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showPortalNotice, setShowPortalNotice] = useState(false);

  useEffect(() => {
    fetchAudits();
    fetchLatestSession();

    // Check for simulated portal redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing_portal") === "simulated") {
      setTimeout(() => {
        setShowPortalNotice(true);
      }, 0);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function fetchLatestSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.session) {
        setUser(data.session);
        setAgencyName(data.session.agency_name || "");
        if (data.session.agency_logo_id) {
          setLogoPreview(`/api/uploads/${data.session.agency_logo_id}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchAudits() {
    setLoadingAudits(true);
    try {
      const res = await fetch("/api/leads/user");
      const data = await res.json();
      if (data.audits) {
        setAudits(data.audits);
      }
    } catch (e) {
      console.error("Failed to load user audits:", e);
    } finally {
      setLoadingAudits(false);
    }
  }

  async function toggleMonitor(auditId, currentStatus, website) {
    try {
      const res = await fetch("/api/leads/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auditId, is_monitored: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistically update all audits with this website to have the new monitored status
        // (so the toggle reflects globally for this domain)
        setAudits(prev => prev.map(a => a.website === website ? { ...a, is_monitored: !currentStatus } : a));
      } else {
        alert(data.error || "Failed to update monitor status.");
      }
    } catch (err) {
      alert("Network error.");
    }
  }

  const handleStripePortal = async () => {
    try {
      const res = await fetch("/api/checkout/portal");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to redirect to Stripe Customer Portal.");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting billing portal endpoint.");
    }
  };

  // Handle base64 logo reading
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setBrandingStatus("Error: Image size must be under 1.5MB");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingSubmit = async (e) => {
    e.preventDefault();
    setBrandingStatus("Updating branding...");

    let logoData = null;
    let mimeType = null;
    
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        logoData = reader.result;
        mimeType = logoFile.type;
        submitBranding(logoData, mimeType);
      };
      reader.readAsDataURL(logoFile);
    } else {
      submitBranding(null, null);
    }
  };

  const submitBranding = async (logoData, mimeType) => {
    try {
      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          logoData,
          mimeType
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBrandingStatus("Branding updated successfully!");
        setLogoFile(null);
        fetchLatestSession();
      } else {
        throw new Error(data.error || "Failed to update settings.");
      }
    } catch (err) {
      setBrandingStatus("Error: " + err.message);
    }
  };

  const isPaid = user.subscription_tier === "weekly" || user.subscription_tier === "agency" || Boolean(user.allowed_quota && user.allowed_quota > 0);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300 transition-colors duration-300">
      
      {/* Main Content Dashboard */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        
        {/* Portal Notice Banner */}
        {showPortalNotice && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs animate-fade-in text-left">
            <div>
              <span className="font-bold">⚠️ Stripe Key Sandbox Notice:</span> Stripe environment credentials are unconfigured or unavailable. Your billing portal request was simulated using local database variables.
            </div>
            <button
              onClick={() => setShowPortalNotice(false)}
              className="text-amber-400 hover:text-amber-200 font-bold uppercase text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-left">
            <h1 className="text-xl sm:text-2xl font-black text-slate-200 flex items-center gap-2.5">
              <span>Welcome back, {user.name}!</span>
              <span className="text-xl sm:text-2xl">👋</span>
            </h1>
            <p className="text-xxs sm:text-xs text-slate-400 max-w-xl leading-relaxed">
              Track website SEO performance rankings, optimize loading speed metrics, and manage subscription features targeting USA markets.
            </p>
          </div>
          
          <div className="flex items-center gap-3 card-inner p-4 rounded-2xl border self-start sm:self-auto animate-scale-up">
            <div className="h-10 w-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-lg overflow-hidden shrink-0">
              {user.picture?.startsWith("http") ? (
                <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.picture || "👤"
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">User Session</span>
              <p className="text-[10px] font-bold text-primary truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Left/Main Column: Audit History (2 cols) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Quota Progress Bar for All Users */}
            {user && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manual Audits Used</span>
                    <p className="text-xs font-black text-slate-200">
                      {user.free_audits_run || 0} of {isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2)} reports generated
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    (user.free_audits_run || 0) >= (isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2))
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  }`}>
                    {(user.free_audits_run || 0) >= (isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2)) ? "Limit Reached" : "Active Quota"}
                  </span>
                </div>
                
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      (user.free_audits_run || 0) >= (isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2))
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : "bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    }`}
                    style={{ width: `${Math.min(100, ((user.free_audits_run || 0) / (isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2))) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Audit History Card */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-6 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-200">Your Audit History</h2>
                  <p className="text-[10px] text-slate-500">
                    Tier: <span className="capitalize font-bold text-violet-400">{user.subscription_tier}</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push("/audit")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                >
                  Run New Audit
                </button>
              </div>

              {/* Loader */}
              {loadingAudits ? (
                <div className="py-8 text-center text-xxs animate-pulse text-slate-500">
                  Retrieving audited records...
                </div>
              ) : audits.length === 0 ? (
                <div className="py-8 text-center space-y-3 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 p-6">
                  <p className="text-xxs text-slate-500">No audits found in your history.</p>
                  <button
                    onClick={() => router.push("/audit")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                  >
                    Run Your First Audit
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit) => {
                    // Route by opaque DB record ID (not URL) to prevent URL manipulation.
                    // Server will verify ownership before returning the stored report.
                    const isAuditPaid = audit.packageRequest && audit.packageRequest !== "Free Audit";
                    const viewUrl = (isPaid || isAuditPaid)
                      ? `/audit/report?url=${encodeURIComponent(audit.website)}`
                      : `/audit?id=${encodeURIComponent(audit.id)}`;
                    return (
                    <div key={audit.id} className="flex flex-col rounded-2xl card-inner border border-slate-800 hover:border-slate-700 transition-all gap-4 overflow-hidden">
                      <div 
                        onClick={() => router.push(viewUrl)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-800/10 gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="2" y1="12" x2="22" y2="12"/>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            <h4 className="text-xs font-bold text-primary truncate max-w-[240px]">{audit.website}</h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                              isAuditPaid
                                ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            }`}>
                              {audit.packageRequest || "Free Audit"}
                            </span>
                            {audit.is_monitored === 1 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                Monitored
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[9px] text-slate-500 font-semibold uppercase tracking-wider items-center">
                            <span>Audited: {new Date(audit.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            {audit.seoScore > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-violet-400 bg-violet-500/5 px-1.5 py-0.5 rounded border border-violet-500/10">Score: {audit.seoScore}/100</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                          {isPaid && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleMonitor(audit.id, audit.is_monitored === 1, audit.website); }}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold transition-all duration-200 border cursor-pointer shadow-sm ${
                                audit.is_monitored === 1 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                              }`}
                            >
                              {audit.is_monitored === 1 ? "Stop Monitoring" : "Monitor Weekly"}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(viewUrl); }}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold transition-all duration-200 border cursor-pointer bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            View Report
                          </button>
                        </div>
                      </div>

                      {/* Render Chart if monitored */}
                      {audit.is_monitored === 1 && (
                        <div className="border-t border-slate-800/50 p-4 bg-slate-950/30">
                          <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3 px-2 flex justify-between">
                            <span>Score Trend</span>
                            <span className="text-emerald-400">Live Updating</span>
                          </h5>
                          <ScoreChart data={audits.filter(a => a.website === audit.website).map(a => ({ date: a.date, score: a.seoScore }))} />
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Settings, Customizer, and Alerts (1 col) */}
          <div className="space-y-8">



            {/* White-Label Branding settings panel (Agency License Only) */}
            {user.subscription_tier === "agency" && (
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-200">White-Label Branding</h2>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Upload your corporate logo and define custom agency names to substitute all SEOIntellect tags in client PDFs.
                </p>

                <form onSubmit={handleBrandingSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Agency Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Zenith Marketing"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-250 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Agency Logo</label>
                    
                    {logoPreview && (
                      <div className="h-16 w-full border border-slate-800 bg-slate-950 rounded-xl p-2 flex items-center justify-center relative group overflow-hidden">
                        <img src={logoPreview} alt="Agency logo preview" className="h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="absolute inset-0 bg-red-950/80 text-red-400 font-bold text-xxs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload-input"
                      />
                      <label
                        htmlFor="logo-upload-input"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 py-3 text-xxs font-bold text-slate-400 transition-all hover:bg-slate-900 cursor-pointer text-center"
                      >
                        <span>📁 Select Image File</span>
                      </label>
                    </div>
                  </div>

                  {/* Live PDF Branding Preview Mockup */}
                  <div className="mt-2 border border-slate-800/80 rounded-2xl bg-slate-950/50 p-4 space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live PDF Report Header Mockup</h3>
                    <div className="bg-white text-slate-900 rounded-xl p-3 border border-slate-200 flex items-center justify-between shadow-sm min-h-[56px] transition-all">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Agency logo preview" className="max-h-8 max-w-[100px] object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-400 italic font-mono">No Logo Uploaded</span>
                      )}
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-800 truncate max-w-[140px]">
                          {agencyName || "Default SEO Reports"}
                        </p>
                        <p className="text-[7px] text-slate-500 font-medium">Technical SEO Audit Report</p>
                      </div>
                    </div>
                  </div>

                  {brandingStatus && (
                    <p className="text-[9px] font-semibold text-violet-400">{brandingStatus}</p>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 w-full py-2.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                  >
                    Save Branding Settings
                  </button>
                </form>
              </div>
            )}

            {/* Lead Capture Embed Widget (Agency License Only) */}
            {user.subscription_tier === "agency" && (
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-200">Lead Capture Embed Widget</h2>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Embed this lead magnet on your agency&apos;s website. Visitors can run instant scans, and their lead details will register directly inside your dashboard.
                </p>
                
                <div className="space-y-3 pt-2">
                  <label className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Your Copy-Paste Iframe HTML
                  </label>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={5}
                      value={(() => {
                        const domain = typeof window !== "undefined" ? window.location.origin : "https://seointellect-ai.vercel.app";
                        return `<iframe src="${domain}/widget?agencyName=${encodeURIComponent(agencyName || user.agency_name || "Apex Marketing Group")}&logo=${encodeURIComponent(logoPreview || "")}" width="100%" height="320" style="border:none;background:transparent;overflow:hidden;" scrolling="no"></iframe>`;
                      })()}
                      onClick={(e) => { e.target.select(); }}
                      className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono focus:outline-none focus:border-violet-500 cursor-pointer select-all"
                    />
                    <span className="absolute right-2.5 bottom-2 text-[8px] font-bold text-slate-600 uppercase select-none pointer-events-none">
                      Click to Select All
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                    Live Widget Preview
                  </h4>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden min-h-[300px] flex items-center justify-center p-2">
                    <iframe
                      src={(() => {
                        const domain = typeof window !== "undefined" ? window.location.origin : "";
                        if (!domain) return "";
                        return `/widget?agencyName=${encodeURIComponent(agencyName || user.agency_name || "Apex Marketing Group")}&logo=${encodeURIComponent(logoPreview || "")}`;
                      })()}
                      width="100%"
                      height="320"
                      style={{ border: "none", background: "transparent" }}
                      scrolling="no"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Alerts Switches (Weekly & Agency Tiers Only) */}
            {isPaid && (
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
                <h2 className="text-sm font-bold text-slate-200">Alert Configurations</h2>
                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl">
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="text-[10px] font-bold text-white block">Email Alerts</span>
                    <span className="text-[9px] text-slate-500 block leading-normal">
                      Notify immediately if Lighthouse scores drop below 90.
                    </span>
                  </div>
                  
                  {/* Custom animated toggle switch */}
                  <button
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                    className={`relative w-10 h-6.5 rounded-full transition-all duration-300 ${
                      alertsEnabled ? "bg-violet-600" : "bg-slate-800"
                    }`}
                  >
                    <div className={`absolute top-1.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 ${
                      alertsEnabled ? "right-1.5" : "left-1.5"
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings & Meta details */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
              <h2 className="text-sm font-bold text-slate-200">Security Settings</h2>
              
              <div className="space-y-3 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 font-bold">Authentication:</span>
                  <span className="text-violet-400 font-bold">
                    {user.provider === "google" ? "Google SSO" : "Credentials"}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500 font-bold">Account ID:</span>
                  <span className="text-slate-300 font-bold truncate max-w-[120px]">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Billing Scope:</span>
                  <span className="text-emerald-400 font-bold">United States</span>
                </div>
              </div>
            </div>

            {/* Subscription Card details */}
            <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-slate-800 rounded-3xl p-6 space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-200">Billing & Subscriptions</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Manage credit card details, check next invoice schedules, or adjust monitoring tier thresholds through our payment processor.
              </p>
              
              <div className="rounded-xl card-inner border p-3 space-y-2 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span>Current Tier:</span>
                  <span className="font-bold text-primary capitalize">{user.subscription_tier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span className="font-bold text-primary">
                    {user.subscription_tier === "free" ? "$0" : user.subscription_tier === "weekly" ? "$49/month" : "$99/month"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleStripePortal}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 text-[10px] font-bold py-2.5 shadow-sm transition-colors cursor-pointer border border-slate-800"
              >
                Manage via Stripe
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

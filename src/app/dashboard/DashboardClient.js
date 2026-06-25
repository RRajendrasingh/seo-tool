"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ user: initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  // States
  const [monitors, setMonitors] = useState([]);
  const [loadingMonitors, setLoadingMonitors] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [cmsPlatform, setCmsPlatform] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Selected monitor for history graph
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Agency branding states
  const [agencyName, setAgencyName] = useState(user.agency_name || "");
  const [logoPreview, setLogoPreview] = useState(user.agency_logo_id ? `/api/uploads/${user.agency_logo_id}` : null);
  const [logoFile, setLogoFile] = useState(null);
  const [brandingStatus, setBrandingStatus] = useState("");

  // Alert simulation state
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showPortalNotice, setShowPortalNotice] = useState(false);

  useEffect(() => {
    fetchMonitors();
    fetchLatestSession();

    // Check for simulated portal redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing_portal") === "simulated") {
      setTimeout(() => {
        setShowPortalNotice(true);
      }, 0);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function fetchHistory(domain) {
    if (!domain) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/monitors/history?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.history) {
        setHistoryData(data.history);
      } else {
        setHistoryData([]);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function fetchMonitors() {
    setLoadingMonitors(true);
    try {
      const res = await fetch("/api/monitors");
      const data = await res.json();
      if (data.monitors) {
        setMonitors(data.monitors);
        // Default select first monitor if not set yet
        if (data.monitors.length > 0) {
          setSelectedMonitor((prev) => {
            const stillExists = data.monitors.find(m => m.id === prev?.id);
            const selection = stillExists || data.monitors[0];
            fetchHistory(selection.domain);
            return selection;
          });
        } else {
          setSelectedMonitor(null);
          setHistoryData([]);
        }
      }
    } catch (e) {
      console.error("Failed to load monitors:", e);
    } finally {
      setLoadingMonitors(false);
    }
  }

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setAddError("");
    setIsAdding(true);

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: newDomain,
          cmsPlatform,
          businessNiche,
          targetAudience
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add domain monitor.");
      }

      setNewDomain("");
      setCmsPlatform("");
      setBusinessNiche("");
      setTargetAudience("");
      await fetchMonitors();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMonitor = async (id) => {
    if (!confirm("Are you sure you want to remove this domain monitor?")) return;
    try {
      const res = await fetch("/api/monitors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchMonitors();
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const getCoordinates = () => {
    const dataPoints = historyData.length > 0 ? historyData : [
      { performance_score: 88, scanned_at: "2026-05-25" },
      { performance_score: 91, scanned_at: "2026-06-01" },
      { performance_score: 95, scanned_at: "2026-06-08" },
      { performance_score: 96, scanned_at: "2026-06-15" }
    ];

    const N = dataPoints.length;
    return dataPoints.map((pt, i) => {
      const score = pt.performance_score || 80;
      const x = N > 1 ? 50 + i * (300 / (N - 1)) : 200;
      const y = 140 - ((score / 100) * 110);
      
      let dateLabel = "Scan";
      if (pt.scanned_at) {
        const dateObj = new Date(pt.scanned_at);
        const options = { month: 'short', day: '2-digit' };
        dateLabel = dateObj.toLocaleDateString('en-US', options);
      }

      return { x, y, score, dateLabel };
    });
  };

  const points = getCoordinates();
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} 130 L ${points[0].x.toFixed(1)} 130 Z`
    : "";

  const isPaid = user.subscription_tier === "weekly" || user.subscription_tier === "agency" || (user.allowed_quota && user.allowed_quota > 0);

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
          
          {/* Left/Main Column: Active Monitors & History (2 cols) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Domain Monitors Card */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-6 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-200">Active Domain Monitors</h2>
                  <p className="text-[10px] text-slate-500">
                    Tier: <span className="capitalize font-bold text-violet-400">{user.subscription_tier}</span>
                    {isPaid && ` (Quota: ${monitors.length} / ${user.allowed_quota || (user.subscription_tier === "agency" ? 5 : 1)})`}
                  </p>
                </div>
                {isPaid && (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                    Scans Active
                  </span>
                )}
              </div>

              {/* Loader */}
              {loadingMonitors ? (
                <div className="py-8 text-center text-xxs animate-pulse text-slate-500">
                  Retrieving monitored records...
                </div>
              ) : monitors.length === 0 ? (
                <div className="py-8 text-center space-y-3 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 p-6">
                  <p className="text-xxs text-slate-500">No active domain monitors registered yet.</p>
                  {!isPaid && (
                    <button
                      onClick={() => router.push("/#pricing")}
                      className="rounded-xl bg-violet-600 px-4 py-2 text-xxs font-bold text-white hover:bg-violet-500 transition-colors"
                    >
                      Upgrade to Start Monitoring
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {monitors.map((mon) => {
                    const isSelected = selectedMonitor?.id === mon.id;
                    return (
                      <div
                        key={mon.id}
                        onClick={() => {
                          setSelectedMonitor(mon);
                          fetchHistory(mon.domain);
                        }}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl card-inner border gap-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-violet-500/50 bg-violet-950/10 shadow-lg"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap text-left">
                            <h4 className="text-xs font-bold text-primary truncate max-w-[240px]">{mon.domain}</h4>
                            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Monitor Project
                            </span>
                            {isSelected && (
                              <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[9px] text-slate-500 font-semibold uppercase tracking-wider items-center">
                            <span>Auto-scan: Monday</span>
                            <span>•</span>
                            <span className="text-violet-400 bg-violet-500/5 px-1.5 py-0.5 rounded border border-violet-500/10">{mon.cms_platform || "Custom"}</span>
                            <span>•</span>
                            <span className="text-cyan-400 bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/10">{mon.business_niche || "Niche"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/audit/report?url=${encodeURIComponent(mon.domain)}`)}
                            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-[10px] font-bold text-slate-200 transition-colors border border-slate-800 cursor-pointer"
                          >
                            View Report
                          </button>
                          <button
                            onClick={() => handleDeleteMonitor(mon.id)}
                            className="rounded-xl bg-red-950/25 border border-red-500/20 hover:bg-red-950/50 px-3 py-2 text-[10px] font-bold text-red-400 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Monitor Form (Paid Tiers Only) */}
              {isPaid && (
                <form onSubmit={handleAddMonitor} className="pt-4 border-t border-slate-800/60 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300">Register New Domain Monitor</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Domain URL</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. mysite.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">CMS Platform</label>
                      <select
                        value={cmsPlatform}
                        onChange={(e) => setCmsPlatform(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-violet-500"
                      >
                        <option value="">Select Platform</option>
                        <option value="wordpress">WordPress</option>
                        <option value="shopify">Shopify</option>
                        <option value="webflow">Webflow</option>
                        <option value="nextjs">Next.js</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Business Niche</label>
                      <select
                        value={businessNiche}
                        onChange={(e) => setBusinessNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-violet-500"
                      >
                        <option value="">Select Niche</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="local">Local Business</option>
                        <option value="saas">SaaS / B2B</option>
                        <option value="blog">Blog / Publisher</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Target Location</label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-violet-500"
                      >
                        <option value="">Select Scope</option>
                        <option value="local">Local City</option>
                        <option value="national">National Market</option>
                        <option value="global">International</option>
                      </select>
                    </div>
                  </div>

                  {addError && (
                    <p className="text-xxs font-semibold text-rose-500">⚠️ {addError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isAdding}
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-xxs font-bold uppercase tracking-wider text-white hover:bg-violet-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAdding ? "Adding Domain..." : "Register Monitor"}
                  </button>
                </form>
              )}
            </div>

            {/* Performance Audit Trend History Chart */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
              <h2 className="text-sm font-bold text-slate-200">Historical SEO Trends</h2>
              <p className="text-xxs text-slate-500 leading-relaxed max-w-lg">
                Visual index representing automatic audit score curves logged every Monday. (Visualizing active domain: <span className="font-bold text-cyan-400">{selectedMonitor?.domain || "localhost:3000"}</span>).
              </p>

              {/* Premium Vector Chart Visualizer */}
              <div className="pt-4 h-48 w-full flex items-center justify-center relative bg-slate-950/35 rounded-2xl border border-slate-900 p-2.5">
                {loadingHistory && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                    <span className="text-xxs font-semibold text-slate-400 animate-pulse">Loading monitor history...</span>
                  </div>
                )}
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4" />

                  {/* Gradient Area Fill under trend curves */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Chart Path */}
                  {points.length > 0 && (
                    <>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={areaD}
                        fill="url(#chartGlow)"
                      />
                    </>
                  )}

                  {/* Dynamic Data Circles, Text values, and Label dates */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fill={idx === points.length - 1 ? "#818cf8" : "#64748b"}
                        className={`text-[9px] font-mono font-bold ${idx === points.length - 1 ? "text-[10px] font-black" : ""}`}
                      >
                        {p.score}/100
                      </text>
                      <text
                        x={p.x}
                        y="142"
                        textAnchor="middle"
                        fill="#475569"
                        className="text-[8px] font-bold"
                      >
                        {p.dateLabel}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
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
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-2.5 text-xxs font-bold uppercase tracking-wider text-white shadow-md transition-colors cursor-pointer"
                  >
                    Save Branding Settings
                  </button>
                </form>
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

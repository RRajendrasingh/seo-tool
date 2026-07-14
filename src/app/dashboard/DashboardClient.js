"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ScoreChart from "@/components/ScoreChart";
import { openCalendly } from "@/utils/calendly";

export default function DashboardClient({ user: initialUser, initialAudits = [] }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  // States
  const [audits, setAudits] = useState(initialAudits);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // Agency branding states
  const [agencyName, setAgencyName] = useState(user.agency_name || "");
  const [logoPreview, setLogoPreview] = useState(user.agency_logo_id ? `/api/uploads/${user.agency_logo_id}` : null);
  const [logoFile, setLogoFile] = useState(null);
  const [brandingStatus, setBrandingStatus] = useState("");

  // Alert simulation state
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showPortalNotice, setShowPortalNotice] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme state with current html class on mount
  useEffect(() => {
    setIsDarkMode(!document.documentElement.classList.contains("light"));
  }, []);

  const toggleTheme = () => {
    const isNowLight = document.documentElement.classList.contains("light");
    if (isNowLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    }
  };

  useEffect(() => {
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

  async function toggleMonitor(auditId, currentStatus, website) {
    try {
      const res = await fetch("/api/leads/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auditId, is_monitored: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
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

  const getMockMetrics = (website, score) => {
    const lcp = (3.8 - (score / 100) * 2.8).toFixed(1) + " s";
    const fcp = (2.4 - (score / 100) * 1.6).toFixed(1) + " s";
    const cls = (0.35 - (score / 100) * 0.32).toFixed(2);
    const tbt = Math.round(550 - (score / 100) * 500) + " ms";
    const ttfb = Math.round(180 - (score / 100) * 160) + " ms";
    const isPassed = score >= 90;
    return { lcp, fcp, cls, tbt, ttfb, isPassed };
  };

  const isPaid = user.subscription_tier === "weekly" || user.subscription_tier === "agency" || user.subscription_tier === "multi" || Boolean(user.allowed_quota && user.allowed_quota > 0) || Boolean(user.paid_audits_run && user.paid_audits_run > 0);
  
  const currentPlanName = user.subscription_tier === "weekly"
    ? "pro monitor"
    : user.subscription_tier === "agency"
    ? "agency owner"
    : user.subscription_tier === "multi"
    ? "agency multi"
    : user.allowed_quota > 0
    ? "starter report"
    : "free";

  const quotaUsed = isPaid ? (user.paid_audits_run || 0) : (user.free_audits_run || 0);
  const quotaLimit = isPaid ? (user.allowed_quota || 1) : (user.free_audits_allowed || 2);
  const quotaPercent = (isPaid && (user.subscription_tier === 'agency' || user.subscription_tier === 'multi'))
    ? 100
    : Math.min(100, (quotaUsed / quotaLimit) * 100);

  return (
    <div className="bg-slate-950 min-h-screen md:h-screen md:overflow-hidden text-slate-400 transition-colors duration-300 flex flex-col md:flex-row [.light_&]:bg-slate-50 [.light_&]:text-slate-700">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-45 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between select-none [.light_&]:bg-[#f8f9fa]
        fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 border-r border-slate-800/80 [.light_&]:border-slate-200 shrink-0 transition-all duration-300
        ${mobileMenuOpen ? "translate-x-0 w-72 p-5" : "-translate-x-full md:translate-x-0 w-0 md:w-16 overflow-hidden md:overflow-visible"}
        ${sidebarCollapsed ? "md:w-16 md:p-3.5 md:items-center" : "md:w-64 md:p-3.5 md:items-stretch"}
      `}>
        <div className={`space-y-6 w-full ${sidebarCollapsed && !mobileMenuOpen ? "flex flex-col items-center" : "flex flex-col"}`}>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-1.5 h-8 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-violet-600/25 shrink-0 select-none">
                AI
              </div>
              <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-sm font-black text-white uppercase tracking-wider bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent [.light_&]:text-slate-900 ${
                (sidebarCollapsed && !mobileMenuOpen) ? "md:w-0 md:opacity-0 md:pointer-events-none" : "w-auto opacity-100 ml-1.5"
              }`}>
                SEOIntellect
              </span>
            </div>
            {/* Close button on mobile menu */}
            {mobileMenuOpen && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-900/40 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 [.light_&]:hover:bg-slate-100 cursor-pointer block md:hidden"
                aria-label="Close Mobile Menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`flex flex-col overflow-y-auto gap-1 pb-2 md:pb-0 no-scrollbar ${(sidebarCollapsed && !mobileMenuOpen) ? "items-center" : "w-full"}`} aria-label="Sidebar Navigation">
            {!(sidebarCollapsed && !mobileMenuOpen) && (
              <div className="hidden md:block px-2 pb-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                Main Hub
              </div>
            )}
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "pages", label: "Page Reports", icon: "📰", badge: audits.length || null },
              ...(user.subscription_tier === "agency" ? [{ id: "branding", label: "Agency Customizer", icon: "⚙️" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                title={(sidebarCollapsed && !mobileMenuOpen) ? tab.label : undefined}
                className={`flex items-center rounded-xl border transition-all relative cursor-pointer w-full h-11 px-2.5 ${
                  activeTab === tab.id
                    ? "bg-violet-600/10 border-violet-500/30 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.1)] [.light_&]:bg-violet-500/5 [.light_&]:border-violet-500/20 [.light_&]:text-violet-650"
                    : "border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/40 [.light_&]:hover:bg-slate-100/60 [.light_&]:hover:text-slate-900"
                }`}
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg select-none">
                  {tab.icon}
                </span>
                
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-semibold ${
                  (sidebarCollapsed && !mobileMenuOpen) ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100 ml-2.5 flex-grow text-left"
                }`}>
                  {tab.label}
                </span>

                {/* Uncollapsed Badge */}
                {!((sidebarCollapsed && !mobileMenuOpen)) && tab.badge && (
                  <span className="bg-slate-950 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-slate-800 shrink-0 [.light_&]:bg-slate-100 [.light_&]:border-slate-200 [.light_&]:text-slate-500 transition-opacity duration-350">
                    {tab.badge}
                  </span>
                )}
                {/* Collapsed Badge (Absolute positioned dot) */}
                {(sidebarCollapsed && !mobileMenuOpen) && tab.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-violet-600 text-white text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-slate-950 [.light_&]:border-white animate-fade-in">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                router.push("/dashboard/ai-chat/");
                setMobileMenuOpen(false);
              }}
              title={(sidebarCollapsed && !mobileMenuOpen) ? "AI SEO Chat" : undefined}
              className={`flex items-center rounded-xl border border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 whitespace-nowrap cursor-pointer [.light_&]:hover:bg-slate-100/60 [.light_&]:hover:text-slate-900 w-full h-11 px-2.5`}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg select-none">
                💬
              </span>
              <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-semibold ${
                (sidebarCollapsed && !mobileMenuOpen) ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100 ml-2.5 text-left"
              }`}>
                AI SEO Chat
              </span>
            </button>
          </nav>
        </div>

        {/* Grow Spacer */}
        <div className="flex-grow hidden md:block" />

        {/* Sidebar Bottom: Quota Meter + Powered By (sticks to bottom, no gap) */}
        <div className="w-full mt-auto px-1 flex flex-col gap-3">
          {/* Collapsed ⚡ Badge (desktop only) */}
          <div className={`transition-all duration-300 flex-shrink-0 ${
            (sidebarCollapsed && !mobileMenuOpen) ? "opacity-100 scale-100 h-10 w-10" : "opacity-0 scale-75 pointer-events-none h-0 w-0 overflow-hidden"
          }`}>
            <div 
              title={isPaid ? `${quotaUsed}/${quotaLimit} reports` : `${quotaUsed}/${quotaLimit} free scans`}
              className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-amber-400 transition-colors cursor-pointer [.light_&]:bg-slate-100 [.light_&]:border-slate-200 mx-auto text-xs font-bold"
            >
              ⚡
            </div>
          </div>

          {/* Uncollapsed Quota Meter */}
          <div className={`transition-all duration-300 overflow-hidden ${
            (sidebarCollapsed && !mobileMenuOpen) ? "max-h-0 opacity-0 pointer-events-none w-0" : "max-h-32 opacity-100 w-full"
          }`}>
            <div className="space-y-2 px-3 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-2xl [.light_&]:bg-slate-50 [.light_&]:border-slate-200 w-full shadow-sm">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                <span>Quota Used</span>
                <span>{quotaPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 [.light_&]:bg-slate-200 [.light_&]:border-slate-300">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">
                {isPaid ? (
                  (user.subscription_tier === 'agency' || user.subscription_tier === 'multi') 
                    ? "Unlimited PDF Reports" 
                    : `${quotaUsed} of ${quotaLimit} reports`
                ) : (
                  `${quotaUsed} of ${quotaLimit} free scans`
                )}
              </p>
            </div>
          </div>

          {/* Powered By tagline (mobile drawer only) */}
          {mobileMenuOpen && (
            <div className="text-center pb-2 text-[8px] font-extrabold text-slate-600 uppercase tracking-widest select-none border-t border-slate-900 [.light_&]:border-slate-100 pt-3">
              Powered by SEOIntellect
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area Container */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden [.light_&]:bg-[#f1f3f5]">
        
        {/* Top Horizontal Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950 px-4 md:px-6 flex items-center justify-between select-none [.light_&]:bg-[#f8f9fa] [.light_&]:border-slate-200 shrink-0">
          {/* Left side: Sidebar Toggle & Breadcrumb path */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle (visible below md) */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-900/40 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 [.light_&]:hover:bg-slate-100 cursor-pointer block md:hidden" 
              aria-label="Open Mobile Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Desktop Sidebar Toggle (hidden below md) */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-900/40 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 [.light_&]:hover:bg-slate-100 cursor-pointer hidden md:block" 
              aria-label="Toggle Sidebar"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 [.light_&]:text-slate-500 select-none">
              <span className="hidden sm:inline">Workspace</span>
              <span className="hidden sm:inline">
                <svg className="w-3 h-3 text-slate-500 [.light_&]:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="text-white [.light_&]:text-slate-900 capitalize font-bold">
                {activeTab === "branding" ? "Agency Customizer" : activeTab === "pages" ? "Page Reports" : "Overview"}
              </span>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="max-w-md w-full px-2 sm:px-4 flex-grow md:flex-grow-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                readOnly
                className="block w-full pl-9 pr-4 sm:pr-12 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-700 cursor-pointer"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none hidden sm:flex">
                <span className="px-1.5 py-0.5 border border-slate-800 text-[9px] font-bold text-slate-500 rounded bg-slate-950 [.light_&]:bg-white [.light_&]:border-slate-200">
                  ⌘K
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Actions & User Initials */}
          <div className="flex items-center gap-4 text-slate-400 [.light_&]:text-slate-600">
            <button
              onClick={() => openCalendly(user.email || "", user.name || "")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold hover:text-white transition-colors cursor-pointer [.light_&]:hover:text-slate-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help & Feedback</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-1 rounded-lg hover:bg-slate-900/40 hover:text-white transition-all [.light_&]:hover:bg-slate-100 [.light_&]:hover:text-slate-900 cursor-pointer" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alertsEnabled && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full ring-2 ring-slate-950 [.light_&]:ring-white" />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="relative p-1.5 rounded-lg hover:bg-slate-900/40 hover:text-white transition-all [.light_&]:hover:bg-slate-100 [.light_&]:hover:text-slate-900 cursor-pointer text-slate-400 [.light_&]:text-slate-500"
            >
              {isDarkMode ? (
                // Sun icon — click to go Light
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                // Moon icon — click to go Dark
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Initials Avatar Badge with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="h-8 w-8 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center select-none shrink-0 [.light_&]:bg-violet-50 [.light_&]:text-violet-600 hover:bg-violet-600/20 transition-all cursor-pointer"
              >
                {(() => {
                  const parts = (user.name || "User").split(" ");
                  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
                })()}
              </button>

              {profileDropdownOpen && (
                <>
                  {/* Backdrop click overlay to close the dropdown */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  
                  {/* Floating User Dropdown Menu Card */}
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-fade-in text-left [.light_&]:bg-white [.light_&]:border-slate-200">
                    {/* User Header */}
                    <div className="px-3 py-2 border-b border-slate-905/40 [.light_&]:border-slate-100 mb-1.5 select-none">
                      <p className="text-xs font-bold text-white truncate [.light_&]:text-slate-900">
                        {user.name || "User"}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-block text-[8px] font-bold text-violet-400 bg-violet-600/10 border border-violet-500/20 px-1.5 py-0.5 rounded-md mt-1 select-none">
                        {currentPlanName}
                      </span>
                    </div>

                    {/* Menu links */}
                    <div className="space-y-0.5">
                      {user.subscription_tier === "agency" && (
                        <button
                          onClick={() => {
                            setActiveTab("branding");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-left cursor-pointer [.light_&]:text-slate-650 [.light_&]:hover:bg-slate-50 [.light_&]:hover:text-slate-900"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-900 [.light_&]:border-slate-100 my-1.5" />

                    {/* Lower items */}
                    <div className="space-y-0.5">
                      <Link
                        href="/"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all text-left cursor-pointer [.light_&]:text-slate-650 [.light_&]:hover:bg-slate-50 [.light_&]:hover:text-slate-900 block"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" />
                        </svg>
                        <span>Back to Website</span>
                      </Link>

                      <button
                        onClick={() => {
                          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                          router.push("/login/");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 rounded-xl hover:bg-rose-500/5 hover:text-rose-600 transition-all text-left cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Inner Content Main Container */}
        <main className="flex-grow p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar [.light_&]:bg-[#f1f3f5]">
        
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

        {/* Free Tier Callout Banner */}
        {user.subscription_tier !== "agency" && user.subscription_tier !== "multi" && (
          <div className="bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-left [.light_&]:bg-violet-50 [.light_&]:border-violet-200 [.light_&]:text-violet-750">
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-violet-400 [.light_&]:text-violet-600">Free Trial Limit</span>
              <p className="text-zinc-400 [.light_&]:text-slate-600">Get complete white-label PDFs, stackable domain monitors, and unlimited scans with our professional plans.</p>
            </div>
            <button
              onClick={() => router.push("/pricing/")}
              className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/10 transition-all cursor-pointer border-0 shrink-0"
            >
              Explore Pricing
            </button>
          </div>
        )}

        {/* Dynamic Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900 [.light_&]:border-slate-200">
          <div className="text-left">
            <h1 className="text-xl font-bold text-white tracking-tight [.light_&]:text-slate-900">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "pages" && "Page Reports"}
              {activeTab === "branding" && "Agency Customizer"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === "overview" && `Welcome back, ${user.name}! Track performance metrics and ranking trends.`}
              {activeTab === "pages" && "Manage speed diagnostics and Lighthouse audits."}
              {activeTab === "branding" && "Configure white-label client PDF settings."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/audit/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
            >
              Run New Audit
            </button>
          </div>
        </div>

        {/* Tab content rendering */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left/Main Column: Vitals Score Trend & Audit History */}
            <section aria-label="Dashboard metrics and history" className="md:col-span-2 space-y-8">
              
              {/* Score Trendline Chart */}
              {audits.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                  <div className="pb-2 border-b border-slate-800/60 flex justify-between items-center [.light_&]:border-slate-200">
                    <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider [.light_&]:text-slate-800">Overall Performance Score Trend</h2>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 [.light_&]:bg-emerald-50 [.light_&]:text-emerald-700">Live Tracker</span>
                  </div>
                  <ScoreChart data={audits.map(a => ({ date: a.date, score: a.seoScore }))} />
                </div>
              )}

              {/* Audit History Card */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-6 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-800 gap-4 [.light_&]:border-slate-200">
                  <div>
                    <h2 className="text-sm font-bold text-slate-200 [.light_&]:text-slate-800">Your Audit History</h2>
                    <p className="text-[10px] text-slate-500">
                      Tier: <span className="capitalize font-bold text-violet-400 [.light_&]:text-violet-600">
                        {currentPlanName}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => router.push("/dashboard/ai-chat/")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition-all cursor-pointer [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-700 [.light_&]:hover:bg-slate-100"
                    >
                      💬 AI SEO Chat
                    </button>
                  </div>
                </div>

                {/* Loader */}
                {loadingAudits ? (
                  <div className="py-8 text-center text-xxs animate-pulse text-slate-500">
                    Retrieving audited records...
                  </div>
                ) : audits.length === 0 ? (
                  <div className="py-8 text-center space-y-3 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 p-6 [.light_&]:bg-slate-50/50 [.light_&]:border-slate-300">
                    <p className="text-xxs text-slate-500">No audits found in your history.</p>
                    <button
                      onClick={() => router.push("/audit/")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                    >
                      Run Your First Audit
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60 max-h-[480px] overflow-y-auto pr-2 [.light_&]:divide-slate-200">
                    {audits.map((audit) => {
                      return (
                        <div key={audit.id} className="py-4 first:pt-0 last:pb-0 space-y-3 text-left">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-bold text-slate-200 block truncate max-w-[280px] [.light_&]:text-slate-800">
                                {audit.website}
                              </span>
                              <span className="text-[9px] text-slate-500">{audit.date}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg ${
                                audit.seoScore >= 90 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 [.light_&]:bg-emerald-50 [.light_&]:text-emerald-700" 
                                  : audit.seoScore >= 50 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 [.light_&]:bg-amber-50 [.light_&]:text-amber-700" 
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20 [.light_&]:bg-rose-50 [.light_&]:text-rose-700"
                              }`}>
                                Score: {audit.seoScore}
                              </span>
                              
                              <button
                                onClick={() => router.push(`/audit/?url=${encodeURIComponent(audit.website)}`)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 px-3 py-1.5 text-xxs font-bold text-slate-400 hover:text-white transition-all cursor-pointer [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-violet-600 [.light_&]:hover:text-slate-900"
                              >
                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                                </svg>
                                View Report
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Settings, Customizer, and Alerts */}
            <aside aria-label="Settings and account limits" className="space-y-8">
              
              {/* Email Alerts Switches (Weekly & Agency Tiers Only) */}
              {isPaid && (
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-200 [.light_&]:text-slate-800">Alert Configurations</h2>
                  <div className="flex justify-between items-center bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="text-[10px] font-bold text-white block [.light_&]:text-slate-850">Email Alerts</span>
                      <span className="text-[9px] text-slate-500 block leading-normal">
                        Notify immediately if Lighthouse scores drop below 90.
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setAlertsEnabled(!alertsEnabled)}
                      className={`relative w-10 h-6.5 rounded-full transition-all duration-300 shrink-0 ${
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
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-200 [.light_&]:text-slate-800">Security Settings</h2>
                
                <div className="space-y-3 font-mono text-[10px] text-slate-400">
                  <div className="flex justify-between pb-2 border-b border-slate-800 [.light_&]:border-slate-200">
                    <span className="text-slate-500 font-bold">Authentication:</span>
                    <span className="text-violet-400 font-bold [.light_&]:text-violet-600">
                      {user.provider === "google" ? "Google SSO" : "Credentials"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800 [.light_&]:border-slate-200">
                    <span className="text-slate-500 font-bold">Account ID:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[120px] [.light_&]:text-slate-700">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Billing Scope:</span>
                    <span className="text-emerald-400 font-bold [.light_&]:text-emerald-650">United States</span>
                  </div>
                </div>
              </div>

              {/* Free Consultant Meeting Card */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-200 [.light_&]:text-slate-800">Free 1-on-1 Strategy Call</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Book a complimentary session with an elite consultant to map out your SEO, page speed, and AEO optimization roadmap.
                </p>
                
                <button
                  onClick={() => openCalendly(user.email || "", user.name || "")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/30 w-full py-2.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-all duration-200 cursor-pointer [.light_&]:bg-violet-50 [.light_&]:text-violet-600"
                >
                  <span>📅 Schedule Meeting</span>
                </button>
              </div>

              {/* Subscription Card details */}
              <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-slate-800 rounded-3xl p-6 space-y-3 text-left [.light_&]:from-violet-50 [.light_&]:to-fuchsia-50/40 [.light_&]:border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-200 [.light_&]:text-slate-800">Billing & Subscriptions</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Manage credit card details, check next invoice schedules, or adjust monitoring tier thresholds.
                </p>
                
                <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-3 space-y-2 font-mono text-[9px] [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                  <div className="flex justify-between">
                    <span>Current Plan:</span>
                    <span className="font-bold text-white capitalize [.light_&]:text-slate-900">{currentPlanName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-bold text-white [.light_&]:text-slate-900">
                      {user.subscription_tier === "free" ? "$0" : user.subscription_tier === "weekly" ? "$29/month" : user.subscription_tier === "agency" ? "$99/month" : "$199/month"}
                    </span>
                  </div>
                </div>

                {isPaid && (
                  <button
                    onClick={handleStripePortal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 w-full py-2.5 text-xs font-bold text-white transition-all duration-200 cursor-pointer border-0 shadow-md shadow-violet-500/10"
                  >
                    💳 Manage Billing Portal
                  </button>
                )}
              </div>

            </aside>
          </div>
        )}

        {/* Page Reports tab */}
        {activeTab === "pages" && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-6 text-left overflow-x-auto [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
            <div className="pb-3 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4 [.light_&]:border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-200 font-sans [.light_&]:text-slate-800">Current URL Page Reports</h2>
                <p className="text-[10px] text-slate-500">Page Speed and Core Web Vitals breakdown for all scanned domains.</p>
              </div>
              <button
                onClick={() => router.push("/audit/")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
              >
                Scan New URL
              </button>
            </div>
            {audits.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No URLs scanned yet. Run an audit to populate this report.
              </div>
            ) : (
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider [.light_&]:border-slate-200">
                    <th className="py-3 pr-4">Page Url</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">LCP</th>
                    <th className="py-3 px-4 text-center">FCP</th>
                    <th className="py-3 px-4 text-center">CLS</th>
                    <th className="py-3 px-4 text-center">TBT</th>
                    <th className="py-3 px-4 text-center">TTFB</th>
                    <th className="py-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => {
                    const metrics = getMockMetrics(audit.website, audit.seoScore);
                    return (
                      <tr key={audit.id} className="border-b border-slate-800/40 hover:bg-slate-900/20 transition-colors [.light_&]:border-slate-200/60 [.light_&]:hover:bg-slate-100/50">
                        <td className="py-3.5 pr-4 max-w-[200px] truncate font-mono text-[10px] text-slate-400 [.light_&]:text-slate-700">
                          {audit.website}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold font-mono">
                          <span className={audit.seoScore >= 90 ? "text-emerald-400 [.light_&]:text-emerald-700" : audit.seoScore >= 50 ? "text-amber-400 [.light_&]:text-amber-600" : "text-rose-400 [.light_&]:text-rose-700"}>
                            {audit.seoScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                            metrics.isPassed 
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 [.light_&]:text-emerald-700 [.light_&]:bg-emerald-50 [.light_&]:border-emerald-200" 
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20 [.light_&]:text-amber-700 [.light_&]:bg-amber-50 [.light_&]:border-amber-200"
                          }`}>
                            {metrics.isPassed ? "Pass" : "Fail"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400 [.light_&]:text-slate-500">{metrics.lcp}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400 [.light_&]:text-slate-500">{metrics.fcp}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400 [.light_&]:text-slate-500">{metrics.cls}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400 [.light_&]:text-slate-500">{metrics.tbt}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400 [.light_&]:text-slate-500">{metrics.ttfb}</td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            onClick={() => router.push(`/audit/?id=${encodeURIComponent(audit.id)}`)}
                            className="text-[10px] font-bold text-violet-400 hover:text-violet-300 underline cursor-pointer [.light_&]:text-violet-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Agency Customizer tab */}
        {activeTab === "branding" && user.subscription_tier === "agency" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main branding form */}
            <div className="md:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-4 text-left animate-fade-in [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-200 [.light_&]:text-slate-800">White-Label Branding Settings</h2>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Upload your corporate logo and define custom agency names to substitute all SEOIntellect tags in client PDFs.
              </p>

              <form onSubmit={handleBrandingSubmit} className="space-y-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Agency Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zenith Marketing"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none focus:border-violet-500 [.light_&]:bg-slate-50 [.light_&]:border-slate-200 [.light_&]:text-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Agency Logo</label>
                  
                  {logoPreview && (
                    <div className="h-24 w-full border border-slate-800 bg-slate-950 rounded-xl p-3 flex items-center justify-center relative group overflow-hidden [.light_&]:bg-slate-50 [.light_&]:border-slate-200">
                      <Image src={logoPreview} alt="Agency logo preview" fill sizes="100vw" className="object-contain p-2" unoptimized />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                        }}
                        className="absolute inset-0 bg-red-900/80 text-red-400 font-bold text-xxs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
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
                      id="logo-upload-input-tab"
                    />
                    <label
                      htmlFor="logo-upload-input-tab"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 py-4 text-xs font-bold text-slate-400 transition-all hover:bg-slate-900 cursor-pointer text-center [.light_&]:border-slate-300 [.light_&]:hover:bg-slate-100"
                    >
                      <span>📁 Select Corporate Logo File (JPEG, PNG, SVG)</span>
                    </label>
                  </div>
                </div>

                {brandingStatus && (
                  <p className="text-[9px] font-semibold text-violet-400">{brandingStatus}</p>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 w-full py-3.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0"
                >
                  Save Branding Settings
                </button>
              </form>
            </div>

            {/* Live PDF Preview Widget Panel */}
            <div className="space-y-6">
              <div className="border border-slate-800 rounded-3xl bg-slate-900/40 p-6 space-y-4 [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-200 [.light_&]:text-slate-800">Live PDF Report Preview</h3>
                <div className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm min-h-[64px] transition-all">
                  <div className="relative max-h-10 w-[120px] h-10 flex items-center justify-start shrink-0">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Agency logo preview" fill sizes="120px" className="object-contain object-left" unoptimized />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-mono">No Logo Uploaded</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                      {agencyName || "Default SEO Reports"}
                    </p>
                    <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">Technical SEO Audit</p>
                  </div>
                </div>
              </div>

              {/* Lead embed widget */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 text-left [.light_&]:bg-white [.light_&]:border-slate-200 shadow-sm">
                <h2 className="text-xs font-bold text-slate-300 [.light_&]:text-slate-800">Copy-Paste Embed Code</h2>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={4}
                    value={(() => {
                      const domain = typeof window !== "undefined" ? window.location.origin : "https://seointellect-ai.vercel.app";
                      return `<iframe src="${domain}/widget?agencyName=${encodeURIComponent(agencyName || user.agency_name || "Apex Marketing Group")}&logo=${encodeURIComponent(logoPreview || "")}" width="100%" height="320" style="border:none;background:transparent;overflow:hidden;" scrolling="no"></iframe>`;
                    })()}
                    onClick={(e) => { e.target.select(); }}
                    className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono focus:outline-none focus:border-violet-500 cursor-pointer select-all [.light_&]:bg-slate-50 [.light_&]:border-slate-200"
                  />
                  <span className="absolute right-2.5 bottom-2 text-[8px] font-bold text-slate-600 uppercase select-none pointer-events-none">
                    Click to Select All
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
      </div>
    </div>
  );
}

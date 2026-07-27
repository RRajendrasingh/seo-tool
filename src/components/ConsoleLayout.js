"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConsoleLayout({
  brandTitle = "SEOIntellect",
  brandBadge = "AI",
  navItems = [],
  activeTab = "overview",
  setActiveTab,
  breadcrumbCategory = "Workspace",
  userEmail = "",
  userName = "",
  userPlan = "",
  quotaWidget = null,
  showSidebarLogout = false,
  sidebarLogoutLabel = "Exit Admin Console",
  isAdminConsole = false,
  onLogout,
  children,
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof window !== "undefined" ? !document.documentElement.classList.contains("light") : true
  );

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

  const activeItem = navItems.find((item) => item.id === activeTab);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row relative isolate [.light_&]:bg-[#f8f9fa] [.light_&]:text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-45 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Collapsible Sidebar Navigation */}
      <aside className={`
        bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between select-none [.light_&]:bg-white
        fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 border-r border-slate-800/80 [.light_&]:border-slate-200 shrink-0 transition-all duration-300
        ${mobileMenuOpen ? "translate-x-0 w-72 p-5" : "-translate-x-full md:translate-x-0 w-0 md:w-16 overflow-hidden md:overflow-visible"}
        ${sidebarCollapsed ? "md:w-16 md:p-3.5 md:items-center" : "md:w-64 md:p-3.5 md:items-stretch"}
      `}>
        <div className={`space-y-6 w-full ${sidebarCollapsed && !mobileMenuOpen ? "flex flex-col items-center" : "flex flex-col"}`}>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-1.5 h-8 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0 select-none ${
                isAdminConsole 
                  ? "bg-gradient-to-br from-rose-600 to-amber-600 shadow-rose-600/25"
                  : "bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-600/25"
              }`}>
                {brandBadge}
              </div>
              <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-sm font-black uppercase tracking-wider bg-clip-text text-transparent [.light_&]:text-slate-900 ${
                isAdminConsole 
                  ? "bg-gradient-to-r from-rose-400 to-amber-400" 
                  : "bg-gradient-to-r from-violet-400 to-fuchsia-500"
              } ${
                (sidebarCollapsed && !mobileMenuOpen) ? "md:w-0 md:opacity-0 md:pointer-events-none" : "w-auto opacity-100 ml-1.5"
              }`}>
                {brandTitle}
              </span>
            </Link>
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
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (setActiveTab) setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                  if (tab.onClick) tab.onClick();
                }}
                title={(sidebarCollapsed && !mobileMenuOpen) ? tab.label : undefined}
                className={`flex items-center rounded-xl border transition-all relative cursor-pointer w-full h-11 px-2.5 ${
                  activeTab === tab.id
                    ? isAdminConsole 
                      ? "bg-rose-600/10 border-rose-500/30 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.1)] [.light_&]:bg-rose-500/5 [.light_&]:border-rose-500/20 [.light_&]:text-rose-650"
                      : "bg-violet-600/10 border-violet-500/30 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.1)] [.light_&]:bg-violet-500/5 [.light_&]:border-violet-500/20 [.light_&]:text-violet-650"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 [.light_&]:text-slate-600 [.light_&]:hover:bg-slate-100/60 [.light_&]:hover:text-slate-900"
                }`}
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center select-none">
                  {tab.icon}
                </span>
                
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-semibold ${
                  (sidebarCollapsed && !mobileMenuOpen) ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100 ml-2.5 flex-grow text-left"
                }`}>
                  {tab.label}
                </span>

                {!((sidebarCollapsed && !mobileMenuOpen)) && tab.badge && (
                  <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                    isAdminConsole ? "bg-rose-600" : "bg-violet-600"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Quota Widget or Spacer */}
        <div className="w-full mt-auto px-1 flex flex-col gap-3 pt-4 border-t border-slate-800/80 [.light_&]:border-slate-200">
          {quotaWidget && (
            <div className={`transition-all duration-300 overflow-hidden ${
              (sidebarCollapsed && !mobileMenuOpen) ? "max-h-0 opacity-0 pointer-events-none w-0" : "max-h-32 opacity-100 w-full"
            }`}>
              {quotaWidget}
            </div>
          )}

          {/* Sidebar Log Out Button (Only rendered when showSidebarLogout is true) */}
          {showSidebarLogout && onLogout && (
            <button
              onClick={onLogout}
              className={`w-full rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/30 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${
                sidebarCollapsed && !mobileMenuOpen ? "px-0" : ""
              }`}
              title={sidebarLogoutLabel}
            >
              <span>🚪</span>
              {!(sidebarCollapsed && !mobileMenuOpen) && <span>{sidebarLogoutLabel}</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Horizontal Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950 px-4 md:px-6 flex items-center justify-between select-none [.light_&]:bg-white [.light_&]:border-slate-200 shrink-0 sticky top-0 z-20">
          {/* Left: Sidebar Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors hover:bg-slate-900/40 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 [.light_&]:hover:bg-slate-100 cursor-pointer block md:hidden" 
              aria-label="Open Mobile Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors hover:bg-slate-900/40 [.light_&]:text-slate-500 [.light_&]:hover:text-slate-900 [.light_&]:hover:bg-slate-100 cursor-pointer hidden md:block" 
              aria-label="Toggle Sidebar"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 [.light_&]:text-slate-500 select-none">
              <span className="hidden sm:inline">{breadcrumbCategory}</span>
              <span className="hidden sm:inline">
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="text-white [.light_&]:text-slate-900 capitalize font-bold">
                {activeItem?.label || "Overview"}
              </span>
            </div>
          </div>

          {/* Right: Actions, Theme Toggle, & Profile */}
          <div className="flex items-center gap-3">
            {isAdminConsole ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Super Admin</span>
              </span>
            ) : (
              <button
                onClick={() => router.push("/contact/")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer [.light_&]:text-slate-600 [.light_&]:hover:text-slate-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help &amp; Support</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white [.light_&]:text-slate-600 [.light_&]:hover:text-slate-900 transition-colors focus:outline-none cursor-pointer rounded-lg hover:bg-slate-900/40 [.light_&]:hover:bg-slate-100"
              aria-label="Toggle Dark/Light Theme"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`h-8 w-8 rounded-full border text-xs font-bold flex items-center justify-center select-none shrink-0 transition-all cursor-pointer ${
                    isAdminConsole 
                      ? "bg-rose-600/10 border-rose-500/30 text-rose-400 hover:bg-rose-600/20"
                      : "bg-violet-600/10 border-violet-500/20 text-violet-400 [.light_&]:bg-violet-50 [.light_&]:text-violet-600 hover:bg-violet-600/20"
                  }`}
                >
                  {(userName || userEmail || "A").slice(0, 1).toUpperCase()}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 text-left [.light_&]:bg-white [.light_&]:border-slate-200">
                      <div className="px-3 py-2 border-b border-slate-800/80 [.light_&]:border-slate-100 mb-1.5">
                        <p className="text-xs font-bold text-white truncate [.light_&]:text-slate-900">
                          {userName || "User"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {userEmail}
                        </p>
                        {userPlan && (
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                            isAdminConsole
                              ? "text-rose-400 bg-rose-600/10 border border-rose-500/20"
                              : "text-violet-400 bg-violet-600/10 border border-violet-500/20"
                          }`}>
                            {userPlan}
                          </span>
                        )}
                      </div>
                      {onLogout && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
                        >
                          {isAdminConsole ? "Exit Admin Console" : "Sign Out"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 w-full min-w-0 p-6 md:p-8 space-y-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

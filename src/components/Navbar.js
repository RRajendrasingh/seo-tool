"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar({ initialSession = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [session, setSession] = useState(initialSession);

  // 1. Initial theme load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    setTimeout(() => {
      setTheme(savedTheme);
    }, 0);
  }, []);

  // Sync session with prop (in case server auth state changes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(initialSession);
  }, [initialSession, pathname]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST"
      });
      if (res.ok) {
        setSession(null);
        router.push("/login/");
        router.refresh();
      }
    } catch (err) {
      console.error("Log out failed:", err);
    }
  };

  // Compile navigation links dynamically
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing/" },
    { name: "Services", href: "/services/" },
    { name: "Locations", href: "/seo-services/" },
    { name: "Blog & News", href: "/news/" },
    { name: "AI Audit", href: "/audit/" },
  ];

  if (session) {
    navLinks.push({ name: "Dashboard", href: "/dashboard/" });
  }

  const isActive = (path) => pathname === path;

  // Hide public website header on dashboard and admin routes for pure 100% web app experience
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/30 bg-slate-950/85 backdrop-blur-md transition-colors duration-300 print:hidden [.light_&]:bg-white/85 [.light_&]:border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all group-hover:opacity-80 [.light_&]:from-indigo-600 [.light_&]:to-cyan-600">
                SEO<span className="text-slate-200 [.light_&]:text-slate-900">Intellect</span>
              </span>
              <span className="rounded-md bg-gradient-to-r from-indigo-600 to-cyan-500 px-1.5 py-0.5 text-xxs font-semibold uppercase tracking-wider text-white">
                AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-200 hover:text-cyan-400 [.light_&]:hover:text-indigo-600 ${
                    isActive(link.href)
                      ? "text-cyan-400 font-semibold [.light_&]:text-indigo-600"
                      : "text-slate-300 [.light_&]:text-slate-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Action Items & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white [.light_&]:text-slate-700 [.light_&]:hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Dark/Light Mode"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 border border-violet-400/30 text-white text-xs font-bold flex items-center justify-center select-none shrink-0 transition-all cursor-pointer shadow-md hover:scale-105"
                  title={session.email}
                >
                  {(session.name || session.email || "U").slice(0, 1).toUpperCase()}
                </button>

                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-800 bg-slate-950 p-2.5 shadow-2xl z-50 text-left [.light_&]:bg-white [.light_&]:border-slate-200 animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-800/80 [.light_&]:border-slate-100 mb-2">
                        <p className="text-xs font-bold text-white truncate [.light_&]:text-slate-900">
                          {session.name || "Account User"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5 [.light_&]:text-slate-500">
                          {session.email}
                        </p>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1.5 text-violet-400 bg-violet-600/10 border border-violet-500/20 [.light_&]:bg-violet-50 [.light_&]:text-violet-700">
                          {session.subscription_tier || "Free Plan"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/dashboard/"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all [.light_&]:text-slate-700 [.light_&]:hover:bg-slate-100 [.light_&]:hover:text-slate-900"
                        >
                          <span>Go to Dashboard</span>
                          <span>→</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <span>Sign Out</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login/"
                  className="text-sm font-medium text-slate-300 hover:text-white [.light_&]:text-slate-700 [.light_&]:hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/audit/"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-cyan-500 transition-all hover:shadow-cyan-500/20 active:scale-95"
                >
                  Free SEO Audit
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white [.light_&]:text-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none [.light_&]:hover:bg-slate-200 [.light_&]:hover:text-slate-900"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pb-6 pt-2 backdrop-blur-lg [.light_&]:bg-white [.light_&]:border-slate-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-slate-800 text-cyan-400 font-bold [.light_&]:bg-slate-100 [.light_&]:text-indigo-600"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white [.light_&]:text-slate-700 [.light_&]:hover:bg-slate-100 [.light_&]:hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 [.light_&]:border-slate-200">
            {session ? (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 px-3">
                  Signed in as {session.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-base font-medium text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login/"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/audit/"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-2 text-center text-base font-bold text-white shadow-md"
                >
                  Free SEO Audit
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

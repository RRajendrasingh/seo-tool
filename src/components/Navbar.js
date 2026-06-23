"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar({ initialSession = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [session, setSession] = useState(initialSession);

  // 1. Initial theme load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
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
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Log out failed:", err);
    }
  };

  // Compile navigation links dynamically
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services/" },
    { name: "Locations", href: "/seo-services/" },
    { name: "Blog & News", href: "/news/" },
    { name: "AI Audit", href: "/audit/" },
  ];

  if (session) {
    navLinks.push({ name: "Dashboard", href: "/dashboard" });
  }

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/30 bg-slate-950/85 backdrop-blur-md transition-colors duration-300 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all group-hover:opacity-80">
                SEO<span className="text-slate-200">Intellect</span>
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
                  className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                    isActive(link.href)
                      ? "text-cyan-400 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Theme Toggle & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M9.75 12l-1.5-1.5m10.5 1.5l-1.5-1.5M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM4.75 12h2.25m13.5 0h2.25M6.3 6.3l1.5 1.5m10.5 10.5l1.5-1.5" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Dynamic Sign In / Out */}
            {session ? (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/audit/"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-slate-50 shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-cyan-500/10 active:scale-[0.98]"
            >
              Free SEO Audit
            </Link>
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M9.75 12l-1.5-1.5m10.5 1.5l-1.5-1.5M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM4.75 12h2.25m13.5 0h2.25M6.3 6.3l1.5 1.5m10.5 10.5l1.5-1.5" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200/20 bg-slate-950/95 backdrop-blur-sm px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-slate-800/60 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 px-3 space-y-3">
            {session ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 py-2 text-base font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 py-2 text-base font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
            
            <Link
              href="/audit/"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-base font-semibold text-slate-55 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
            >
              Free SEO Audit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

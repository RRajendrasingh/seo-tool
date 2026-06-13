import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const serviceLinks = [
    { name: "SEO Optimization", href: "/services/#seo" },
    { name: "Web Development", href: "/services/#web-dev" },
    { name: "SaaS Development", href: "/services/#saas" },
    { name: "Content Strategy", href: "/services/#content" },
  ];

  const locationLinks = [
    { name: "SEO in New York", href: "/seo-services/new-york/" },
    { name: "SEO in Los Angeles", href: "/seo-services/los-angeles/" },
    { name: "SEO in Chicago", href: "/seo-services/chicago/" },
    { name: "SEO in Houston", href: "/seo-services/houston/" },
    { name: "SEO in Phoenix", href: "/seo-services/phoenix/" },
    { name: "SEO in San Diego", href: "/seo-services/san-diego/" },
    { name: "SEO in Austin", href: "/seo-services/austin/" },
    { name: "All USA Locations", href: "/seo-services/" },
  ];

  const resourceLinks = [
    { name: "Latest Updates", href: "/news/" },
    { name: "SEO Audit Tool", href: "/audit/" },
    { name: "Success Stories", href: "/#case-studies" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="space-y-4">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              SEOIntellect
            </span>
            <p className="text-sm text-slate-500">
              Grow your organic traffic with AI-powered SEO audits, high-performance web development, and hyper-targeted local SEO strategies.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Services
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-cyan-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Target Locations (Crucial for Local SEO) */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Target Locations
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
              {locationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-cyan-400 transition-colors text-xs">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Resources
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-cyan-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} SEOIntellect AI. All rights reserved. Made for Global & Local SEO domination.
          </p>
          <div className="flex space-x-6 text-xs text-slate-500">
            <Link href="/privacy/" className="hover:text-slate-350">Privacy Policy</Link>
            <Link href="/terms/" className="hover:text-slate-350">Terms of Service</Link>
            <Link href="/admin/" className="hover:text-slate-350">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

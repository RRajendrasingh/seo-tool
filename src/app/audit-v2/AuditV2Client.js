"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMockLighthouseResult } from "@/utils/mockPageSpeed";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/* ─── tiny helpers ─── */
const scoreColor   = (s) => s >= 90 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
const scoreLabel   = (s) => s >= 90 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Needs Work" : "Poor";
const gradeOf      = (s) => s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 50 ? "D" : "F";
const gradeBg      = (g) => ({ A:"#22c55e", B:"#84cc16", C:"#f59e0b", D:"#f97316", F:"#ef4444" }[g] || "#71717a");

/* ─── Engine definitions (IDs that map to the report) ─── */
const ENGINES = [
  { id:"seo-tags",             icon:"🏷️",  label:"On-Page SEO",       free: true  },
  { id:"page-speed",           icon:"⚡",  label:"Performance",        free: true  },
  { id:"mobile-structure",     icon:"📱",  label:"Mobile & UX",        free: false },
  { id:"server-security",      icon:"🔐",  label:"Security",           free: false },
  { id:"payload-code",         icon:"📦",  label:"Code Quality",       free: false },
  { id:"aeo-geo",              icon:"🤖",  label:"AI & AEO",           free: false },
  { id:"crawlability-indexing",icon:"🕷️",  label:"Crawlability",       free: false },
  { id:"content-hierarchy",    icon:"📝",  label:"Content",            free: false },
  { id:"page-weight",          icon:"🗜️",  label:"Page Weight",        free: false },
  { id:"social-media",         icon:"📣",  label:"Social Media",       free: false },
  { id:"advanced-structure",   icon:"🏗️",  label:"Structure",          free: false },
  { id:"html-css-validation",  icon:"✅",  label:"HTML/CSS Valid",     free: false },
  { id:"priority-fixes",       icon:"🚨",  label:"Priority Fixes",     free: true  },
];

export default function AuditV2Client({ initialUser = null }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [url, setUrl]           = useState(searchParams.get("url") || "");
  const [inputUrl, setInputUrl] = useState(searchParams.get("url") || "");
  const [loading, setLoading]   = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [report, setReport]     = useState(null);
  const [error, setError]       = useState(null);
  const [activeEngine, setActiveEngine] = useState("priority-fixes");
  const [filter, setFilter]     = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user]                  = useState(initialUser);
  const progressRef             = useRef(null);

  const isPremium = user?.subscription_tier !== "free" && user?.subscription_tier != null;

  const STEPS = [
    "Querying Google Lighthouse servers…",
    "Parsing Core Web Vitals…",
    "Analysing SEO tags & meta…",
    "Checking mobile structure…",
    "Auditing security headers…",
    "Compiling priority fix list…",
  ];

  /* ─── auto-run if URL in query ─── */
  useEffect(() => {
    if (searchParams.get("url")) runAudit(searchParams.get("url"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── loading step ticker ─── */
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadStep(p => Math.min(p + 1, STEPS.length - 1)), USE_MOCK ? 500 : 3500);
    return () => clearInterval(t);
  }, [loading, STEPS.length]);

  /* ─── AUDIT RUNNER ─── */
  async function runAudit(target) {
    let fmt = (target || "").trim();
    if (!fmt) return;
    if (!/^https?:\/\//i.test(fmt)) fmt = "https://" + fmt;

    setError(null); setReport(null); setLoading(true); setLoadStep(0); setUrl(fmt);

    try {
      let data;
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 3000));
        data = getMockLighthouseResult(fmt);
      } else {
        const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
        const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fmt)}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile${key ? `&key=${key}` : ""}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Google Lighthouse API error. Ensure the URL is live and public.");
        data = await res.json();
      }

      const lh   = data.lighthouseResult;
      const cats  = lh.categories;
      const a     = lh.audits;

      const perf  = Math.round((cats.performance?.score || 0) * 100);
      const seo   = Math.round((cats.seo?.score || 0) * 100);
      const acc   = Math.round((cats.accessibility?.score || 0) * 100);
      const bp    = Math.round((cats["best-practices"]?.score || 0) * 100);
      const avg   = Math.round((perf + seo + acc + bp) / 4);

      const pass  = (k, d = true) => a[k]?.score === 1 || (d && a[k]?.score === null);
      const val   = (k)           => a[k]?.displayValue || "";

      /* build engine checks — mirror the original AuditClient logic */
      const engines = {
        "seo-tags": {
          name:"On-Page SEO Tags", score:seo,
          desc:"Analyses primary search index components: title, description, robots indexing, canonical tags.",
          checks:[
            { name:"Title Tag", passed:pass("document-title",false), value:val("document-title")||"Missing", severity:"error",  impact:"High",   fix:"Add a 30–60 char title with your core keyword.", desc:"Title tag presence and length." },
            { name:"Meta Description", passed:pass("meta-description",false), value:val("meta-description")||"Missing", severity:"warning",impact:"Medium",fix:"Write a 120–160 char meta description.", desc:"Meta description presence." },
            { name:"Canonical URL", passed:pass("canonical"), value:pass("canonical")?"Set correctly":"Not configured", severity:"warning",impact:"Medium",fix:"Add a canonical tag pointing to the preferred URL.", desc:"Duplicate content prevention." },
            { name:"Link Text Quality", passed:pass("link-text"), value:pass("link-text")?"Good anchor texts":"Generic links found", severity:"warning",impact:"Low",fix:"Use descriptive, keyword-rich anchor text.", desc:"Link anchor text quality." },
            { name:"Robots Crawlable", passed:pass("is-crawlable"), value:pass("is-crawlable")?"Fully crawlable":"Blocked by robots", severity:"error",impact:"High",fix:"Remove noindex/disallow directives from robots.txt.", desc:"Crawler access check." },
            { name:"HTML lang Attribute", passed:pass("html-has-lang"), value:pass("html-has-lang")?"Present":"Missing", severity:"warning",impact:"Low",fix:"Add lang='en' to the <html> tag.", desc:"Language declaration." },
          ],
        },
        "page-speed": {
          name:"Page Speed & Core Web Vitals", score:perf,
          desc:"Measures Core Web Vitals, loading performance and interactive metrics via Google Lighthouse.",
          checks:[
            { name:"Largest Contentful Paint", passed:parseFloat(val("largest-contentful-paint"))<=2.5, value:val("largest-contentful-paint")||"—", severity:"error",  impact:"High",  fix:"Optimise largest image/text element, use CDN.", desc:"Time for the largest element to appear." },
            { name:"First Contentful Paint",   passed:parseFloat(val("first-contentful-paint"))<=1.8,   value:val("first-contentful-paint")||"—",   severity:"error",  impact:"High",  fix:"Reduce server response time and eliminate render-blocking resources.", desc:"Time to first visual content." },
            { name:"Total Blocking Time",      passed:parseInt(val("total-blocking-time"))<=200,         value:val("total-blocking-time")||"—",       severity:"warning",impact:"Medium",fix:"Split long JS tasks, use web workers.", desc:"CPU blocking time." },
            { name:"Cumulative Layout Shift",  passed:parseFloat(val("cumulative-layout-shift"))<=0.1,   value:val("cumulative-layout-shift")||"—",   severity:"warning",impact:"Medium",fix:"Reserve image/ad space with explicit dimensions.", desc:"Visual stability score." },
            { name:"Speed Index",              passed:parseFloat(val("speed-index"))<=3.4,               value:val("speed-index")||"—",               severity:"warning",impact:"Medium",fix:"Reduce page weight and enable compression.", desc:"How fast content is visually populated." },
            { name:"Time to Interactive",      passed:parseFloat(val("interactive"))<=3.8,               value:val("interactive")||"—",               severity:"warning",impact:"Medium",fix:"Defer non-critical JS, reduce main thread work.", desc:"Time until page is fully interactive." },
          ],
        },
        "mobile-structure": {
          name:"Mobile & UX Structure", score:acc,
          desc:"Checks mobile viewport setup, touch targets, font legibility and responsive layout.",
          checks:[
            { name:"Viewport Meta Tag",     passed:pass("viewport"),     value:pass("viewport")?"Configured":"Missing",          severity:"error",  impact:"High",  fix:"Add <meta name='viewport' content='width=device-width,initial-scale=1'>.", desc:"Mobile viewport configuration." },
            { name:"Tap Target Spacing",    passed:pass("tap-targets"),  value:pass("tap-targets")?"Adequate spacing":"Too small",severity:"warning",impact:"Medium",fix:"Ensure buttons ≥48×48px with 8px spacing.", desc:"Mobile tap target sizes." },
            { name:"Font Size Legibility",  passed:pass("font-size"),    value:pass("font-size")?"Legible":"Too small",           severity:"warning",impact:"Low",   fix:"Use font-size ≥16px for body text.", desc:"Text readability on mobile." },
            { name:"Heading Order",         passed:pass("heading-order"),value:pass("heading-order")?"Correct":"Skipped headings",severity:"warning",impact:"Medium",fix:"Use H1→H2→H3 in sequence, never skip levels.", desc:"Heading hierarchy structure." },
            { name:"Image Alt Text",        passed:pass("image-alt",false),value:pass("image-alt",false)?"Present":"Missing alts",severity:"error",  impact:"High",  fix:"Add descriptive alt attributes to all images.", desc:"Image accessibility." },
            { name:"Colour Contrast",       passed:pass("color-contrast"),value:pass("color-contrast")?"WCAG AA pass":"Fails WCAG",severity:"warning",impact:"Medium",fix:"Ensure 4.5:1 contrast ratio for normal text.", desc:"WCAG colour contrast ratio." },
          ],
        },
        "server-security": {
          name:"Server Security", score:bp,
          desc:"Checks HTTPS, HTTP/2, vulnerable libraries, browser errors and external link safety.",
          checks:[
            { name:"HTTPS Enabled",          passed:pass("is-on-https",false),             value:pass("is-on-https",false)?"Secure HTTPS":"HTTP only",severity:"error",  impact:"High",  fix:"Install an SSL certificate and redirect all HTTP to HTTPS.", desc:"SSL/TLS encryption." },
            { name:"HTTP/2 Protocol",        passed:pass("uses-http2"),                    value:pass("uses-http2")?"Enabled":"Not enabled",          severity:"warning",impact:"Medium",fix:"Enable HTTP/2 or HTTP/3 on your server/CDN.", desc:"HTTP protocol version." },
            { name:"No Vulnerable Libraries",passed:pass("no-vulnerable-libraries",false), value:pass("no-vulnerable-libraries",false)?"Clean":"Vulnerable libs found",severity:"error",impact:"High",fix:"Update jQuery, lodash and other front-end libraries.", desc:"Known CVE vulnerability check." },
            { name:"Browser Console Errors", passed:pass("browser-errors"),                value:pass("browser-errors")?"No errors":"JS errors detected",severity:"warning",impact:"Medium",fix:"Fix all console errors in production.", desc:"JavaScript runtime errors." },
            { name:"External Link Safety",   passed:pass("external-anchors-use-rel-noopener"),value:pass("external-anchors-use-rel-noopener")?"Safe":"Missing rel=noopener",severity:"warning",impact:"Low",fix:"Add rel='noopener noreferrer' to all external links.", desc:"Noopener attribute on external links." },
            { name:"Server Response Time",   passed:(a["server-response-time"]?.score||0)>=0.9, value:val("server-response-time")||"—",severity:"warning",impact:"High",fix:"Target <200ms TTFB via caching and server optimization.", desc:"Time To First Byte (TTFB)." },
          ],
        },
        "payload-code": {
          name:"Code Quality & Payload", score:Math.round((perf+bp)/2),
          desc:"Inspects render-blocking resources, unused CSS/JS and overall page byte weight.",
          checks:[
            { name:"Render-Blocking Resources",passed:pass("render-blocking-resources"),value:pass("render-blocking-resources")?"None found":"Blocking found",severity:"error",impact:"High",fix:"Load CSS async and defer non-critical JS.",desc:"Resources delaying first paint." },
            { name:"Unused CSS",               passed:pass("unused-css-rules"),         value:pass("unused-css-rules")?"Minimal":"Excess unused CSS",severity:"warning",impact:"Medium",fix:"Use PurgeCSS to remove unused selectors.",desc:"Unused CSS byte savings." },
            { name:"Unused JavaScript",        passed:pass("unused-javascript"),         value:pass("unused-javascript")?"Minimal":"Excess unused JS",severity:"warning",impact:"Medium",fix:"Tree-shake bundles and lazy-load non-critical scripts.",desc:"Unused JS byte savings." },
            { name:"WebP Image Format",        passed:pass("uses-webp-images"),          value:pass("uses-webp-images")?"Using WebP":"JPEG/PNG heavy",severity:"warning",impact:"Medium",fix:"Convert images to WebP/AVIF format.",desc:"Modern image format usage." },
            { name:"Optimised Images",         passed:pass("uses-optimized-images"),     value:pass("uses-optimized-images")?"Optimised":"Over-sized images",severity:"warning",impact:"Medium",fix:"Compress images with quality 75–85.",desc:"Image compression efficiency." },
          ],
        },
        "priority-fixes": {
          name:"Priority Fix List", score:0,
          desc:"Consolidated list of the most critical warnings and errors across all audits.",
          checks:[],
        },
      };

      /* build priority list from all engines */
      const priorityChecks = Object.values(engines)
        .filter(e => e.id !== "priority-fixes")
        .flatMap(e => (e.checks || []).filter(c => !c.passed && c.severity === "error"))
        .slice(0, 12);
      engines["priority-fixes"].checks = priorityChecks;
      engines["priority-fixes"].score = Math.max(0, 100 - priorityChecks.length * 8);

      setReport({ url: fmt, avg, perf, seo, acc, bp, grade: gradeOf(avg), engines, date: new Date().toLocaleDateString() });
      setActiveEngine("priority-fixes");
    } catch (e) {
      setError(e.message || "Audit failed. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  const eng  = report?.engines?.[activeEngine];
  const displayEngine = eng ? { ...eng, checks: eng.checks.filter(c => filter === "all" ? true : filter === "pass" ? c.passed : !c.passed) } : null;

  return (
    <div style={{ background:"#050507", minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:"#e4e4e7" }}>

      {/* ── TOPBAR ── */}
      <TopBar url={url} report={report} onReset={() => { setReport(null); setInputUrl(""); setUrl(""); }} />

      {/* ── HERO / FORM ── */}
      {!report && !loading && (
        <HeroForm inputUrl={inputUrl} setInputUrl={setInputUrl} onRun={() => runAudit(inputUrl)} />
      )}

      {/* ── LOADING ── */}
      {loading && <LoadingScreen step={loadStep} steps={STEPS} url={url} />}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div style={{ maxWidth:560, margin:"80px auto", padding:"0 20px", textAlign:"center" }}>
          <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:20, padding:"40px 32px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Audit Failed</h3>
            <p style={{ fontSize:12, color:"#71717a", lineHeight:1.6, marginBottom:24 }}>{error}</p>
            <button onClick={() => { setError(null); setReport(null); }} style={{ background:"#7c3aed", border:"none", borderRadius:12, padding:"10px 28px", fontSize:12, fontWeight:700, color:"#fff", cursor:"pointer" }}>Try Again</button>
          </div>
        </div>
      )}

      {/* ── REPORT ── */}
      {report && !loading && (
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 16px 60px" }}>

          {/* Score Hero Bar */}
          <ScoreBar report={report} />

          {/* Core Web Vitals Grid */}
          {(() => {
            const pageSpeedEngine = report.engines?.["page-speed"];
            if (!pageSpeedEngine || !pageSpeedEngine.checks) return null;
            const checks = pageSpeedEngine.checks;
            const lcp = checks.find(c => c.name.includes("Largest Contentful Paint"));
            const fcp = checks.find(c => c.name.includes("First Contentful Paint"));
            const cls = checks.find(c => c.name.includes("Cumulative Layout Shift"));
            const tbt = checks.find(c => c.name.includes("Total Blocking Time"));

            const renderVitalCard = (label, check) => {
              if (!check) return null;
              const isPassed = check.passed;
              const val = check.value || "N/A";
              let color = "#22c55e"; // green
              let bg = "rgba(34,197,94,0.06)";
              let border = "rgba(34,197,94,0.15)";
              if (!isPassed) {
                const numVal = parseFloat(val);
                if (label === "LCP" && numVal > 4.0) {
                  color = "#ef4444"; // red
                  bg = "rgba(239,68,68,0.06)";
                  border = "rgba(239,68,68,0.15)";
                } else if (label === "FCP" && numVal > 3.0) {
                  color = "#ef4444";
                  bg = "rgba(239,68,68,0.06)";
                  border = "rgba(239,68,68,0.15)";
                } else if (label === "CLS" && numVal > 0.25) {
                  color = "#ef4444";
                  bg = "rgba(239,68,68,0.06)";
                  border = "rgba(239,68,68,0.15)";
                } else if (label === "TBT" && numVal > 600) {
                  color = "#ef4444";
                  bg = "rgba(239,68,68,0.06)";
                  border = "rgba(239,68,68,0.15)";
                } else {
                  color = "#f59e0b"; // amber
                  bg = "rgba(245,158,11,0.06)";
                  border = "rgba(245,158,11,0.15)";
                }
              }

              return (
                <div style={{ background:"#111113", border:"1px solid #1c1c1f", borderRadius:14, padding:"12px 16px", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:4 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:"#52525b", textTransform:"uppercase", letterSpacing:".08em" }}>{label}</span>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
                    <span style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:"monospace" }}>{val}</span>
                    <span style={{ fontSize:9, fontWeight:700, color:color, background:bg, border:`1px solid ${border}`, borderRadius:4, padding:"1px 6px", display:"inline-flex", alignItems:"center", gap:3 }}>
                      <span style={{ width:4, height:4, borderRadius:"50%", background:color }} />
                      {isPassed ? "Pass" : "Fail"}
                    </span>
                  </div>
                </div>
              );
            };

            return (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginTop:16 }}>
                {renderVitalCard("LCP", lcp)}
                {renderVitalCard("FCP", fcp)}
                {renderVitalCard("CLS", cls)}
                {renderVitalCard("TBT", tbt)}
              </div>
            );
          })()}

          {/* Main layout */}
          <div style={{ display:"grid", gridTemplateColumns:"230px 1fr", gap:20, alignItems:"start", marginTop:24 }}>

            {/* LEFT SIDEBAR */}
            <Sidebar engines={ENGINES} report={report} activeEngine={activeEngine} setActiveEngine={id => { setActiveEngine(id); setFilter("all"); }} isPremium={isPremium} />

            {/* RIGHT CONTENT */}
            <div style={{ minWidth:0 }}>
              {displayEngine ? (
                <EnginePanel engine={displayEngine} engineId={activeEngine} isPremium={isPremium} filter={filter} setFilter={setFilter} report={report} router={router} url={url} />
              ) : (
                <div style={{ textAlign:"center", padding:"80px 20px", color:"#52525b", fontSize:13 }}>Select an engine from the sidebar</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOP BAR
════════════════════════════════════════════ */
function TopBar({ url, report, onReset }) {
  return (
    <div style={{ borderBottom:"1px solid #18181b", background:"rgba(5,5,7,.85)", backdropFilter:"blur(12px)", padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
        <span style={{ fontWeight:800, fontSize:13, letterSpacing:"-.01em" }}>SEO Audit</span>
        <span style={{ background:"rgba(124,58,237,.15)", color:"#a78bfa", border:"1px solid rgba(124,58,237,.3)", borderRadius:99, padding:"2px 10px", fontSize:10, fontWeight:700, letterSpacing:".08em" }}>V2 BETA</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {url && <span style={{ fontFamily:"monospace", fontSize:11, color:"#52525b", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{url}</span>}
        {report && (
          <button onClick={onReset} style={{ background:"rgba(255,255,255,.04)", border:"1px solid #27272a", borderRadius:8, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#a1a1aa", cursor:"pointer" }}>
            ← New Audit
          </button>
        )}
        <a href="/audit/" style={{ textDecoration:"none", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", borderRadius:8, padding:"5px 14px", fontSize:11, fontWeight:600, color:"#a78bfa", cursor:"pointer" }}>
          Classic UI
        </a>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   HERO FORM
════════════════════════════════════════════ */
function HeroForm({ inputUrl, setInputUrl, onRun }) {
  return (
    <div style={{ minHeight:"calc(100vh - 52px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", textAlign:"center", position:"relative", overflow:"hidden" }}>
      {/* ambient glows */}
      <div style={{ position:"absolute", top:"10%", left:"15%", width:500, height:500, background:"radial-gradient(circle,rgba(124,58,237,.08),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"15%", right:"10%", width:400, height:400, background:"radial-gradient(circle,rgba(6,182,212,.06),transparent 70%)", pointerEvents:"none" }} />

      {/* badge */}
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,.08)", border:"1px solid rgba(124,58,237,.25)", borderRadius:99, padding:"6px 16px", fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:".08em", marginBottom:28 }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:"#7c3aed", animation:"pulse 2s infinite" }} />
        NEXT-GEN AUDIT INTERFACE — V2 BETA
      </div>

      <h1 style={{ fontSize:"clamp(32px,6vw,64px)", fontWeight:900, lineHeight:1.05, letterSpacing:"-.03em", marginBottom:16, background:"linear-gradient(135deg,#fff 30%,#a78bfa 70%,#67e8f9 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        Deep-Scan SEO<br/>Command Center
      </h1>
      <p style={{ fontSize:15, color:"#71717a", maxWidth:520, lineHeight:1.6, marginBottom:40 }}>
        Enter any public URL to get a real-time, comprehensive SEO & performance audit powered by Google Lighthouse.
      </p>

      {/* search bar */}
      <div style={{ width:"100%", maxWidth:640, position:"relative" }}>
        <div style={{ display:"flex", gap:0, background:"#111113", border:"1px solid #27272a", borderRadius:16, overflow:"hidden", boxShadow:"0 0 0 4px rgba(124,58,237,.04), 0 20px 60px rgba(0,0,0,.5)" }}>
          <span style={{ padding:"0 16px", display:"flex", alignItems:"center", color:"#52525b", fontSize:16 }}>🌐</span>
          <input
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onRun()}
            placeholder="https://yourwebsite.com"
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, color:"#e4e4e7", padding:"16px 0", fontFamily:"inherit" }}
          />
          <button
            onClick={onRun}
            style={{ background:"linear-gradient(135deg,#7c3aed,#5b21b6)", border:"none", padding:"0 28px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", borderRadius:"0 14px 14px 0", letterSpacing:".02em", whiteSpace:"nowrap" }}
          >
            Run Audit →
          </button>
        </div>
      </div>

      {/* quick try */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginTop:20 }}>
        {["google.com","shopify.com","vercel.com"].map(d => (
          <button key={d} onClick={() => { setInputUrl(d); }} style={{ background:"rgba(255,255,255,.03)", border:"1px solid #27272a", borderRadius:8, padding:"6px 14px", fontSize:11, color:"#71717a", cursor:"pointer", fontFamily:"monospace" }}>
            {d}
          </button>
        ))}
      </div>

      {/* feature pills */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginTop:48 }}>
        {["⚡ Core Web Vitals","🏷️ SEO Tags","🔐 Security Headers","📱 Mobile Score","🤖 AI / AEO","🚨 Priority Fixes"].map(f => (
          <span key={f} style={{ background:"rgba(255,255,255,.03)", border:"1px solid #1f1f22", borderRadius:99, padding:"8px 16px", fontSize:12, color:"#52525b" }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   LOADING
════════════════════════════════════════════ */
function LoadingScreen({ step, steps, url }) {
  return (
    <div style={{ minHeight:"calc(100vh - 52px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32 }}>
      {/* animated rings */}
      <div style={{ position:"relative", width:96, height:96 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid #18181b" }} />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#7c3aed", animation:"spin 1s linear infinite" }} />
        <div style={{ position:"absolute", inset:6, borderRadius:"50%", border:"2px solid transparent", borderBottomColor:"#06b6d4", animation:"spin 1.4s linear infinite reverse" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🔍</div>
      </div>

      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Analysing {url}</div>
        <div style={{ fontSize:11, color:"#a78bfa", fontFamily:"monospace" }}>{steps[step]}</div>
      </div>

      {/* step pills */}
      <div style={{ display:"flex", flexDirection:"column", gap:6, width:320 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, background: i < step ? "rgba(34,197,94,.06)" : i === step ? "rgba(124,58,237,.08)" : "transparent", border: `1px solid ${i < step ? "rgba(34,197,94,.15)" : i === step ? "rgba(124,58,237,.2)" : "transparent"}`, transition:"all .3s" }}>
            <span style={{ fontSize:12 }}>{i < step ? "✓" : i === step ? "→" : "·"}</span>
            <span style={{ fontSize:11, color: i < step ? "#22c55e" : i === step ? "#a78bfa" : "#3f3f46" }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════
   SCORE BAR
════════════════════════════════════════════ */
function ScoreBar({ report }) {
  const { avg, perf, seo, acc, bp, grade, url, date } = report;
  const metrics = [
    { label:"Performance", val:perf },
    { label:"SEO",         val:seo  },
    { label:"Accessibility",val:acc },
    { label:"Best Practices",val:bp },
  ];

  return (
    <div style={{ background:"#111113", border:"1px solid #1c1c1f", borderRadius:20, padding:"28px 32px", marginTop:20, display:"grid", gridTemplateColumns:"auto 1fr", gap:32, alignItems:"center" }}>
      {/* Big grade circle */}
      <div style={{ textAlign:"center" }}>
        <div style={{ width:96, height:96, borderRadius:"50%", background:`conic-gradient(${scoreColor(avg)} ${avg}%, #1c1c1f ${avg}%)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", margin:"0 auto 8px" }}>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"#111113", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:26, fontWeight:900, color:scoreColor(avg), fontFamily:"monospace", lineHeight:1 }}>{grade}</span>
            <span style={{ fontSize:10, color:"#52525b", fontWeight:700 }}>{avg}/100</span>
          </div>
        </div>
        <div style={{ fontSize:10, color:"#52525b", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>{scoreLabel(avg)}</div>
      </div>

      {/* Metrics + URL */}
      <div>
        <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
          <span style={{ fontFamily:"monospace", fontSize:12, color:"#71717a", background:"#0a0a0b", border:"1px solid #1c1c1f", borderRadius:6, padding:"3px 10px" }}>{url.replace(/^https?:\/\//,"")}</span>
          <span style={{ fontSize:11, color:"#3f3f46" }}>• {date}</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {metrics.map(m => (
            <MiniGauge key={m.label} label={m.label} val={m.val} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniGauge({ label, val }) {
  const c = scoreColor(val);
  return (
    <div style={{ textAlign:"center" }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ display:"block", margin:"0 auto 6px" }}>
        <circle cx="28" cy="28" r="22" fill="none" stroke="#1c1c1f" strokeWidth="5" />
        <circle cx="28" cy="28" r="22" fill="none" stroke={c} strokeWidth="5" strokeDasharray={`${(val/100)*138.2} 138.2`} strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition:"stroke-dasharray 1s ease" }} />
        <text x="28" y="33" textAnchor="middle" fill={c} fontSize="13" fontWeight="800" fontFamily="monospace">{val}</text>
      </svg>
      <div style={{ fontSize:10, color:"#52525b", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════ */
function Sidebar({ engines, report, activeEngine, setActiveEngine, isPremium }) {
  return (
    <div style={{ background:"#0d0d10", border:"1px solid #1c1c1f", borderRadius:16, padding:"12px 10px", position:"sticky", top:60, maxHeight:"calc(100vh - 80px)", overflowY:"auto" }}>
      <div style={{ fontSize:9, fontWeight:700, color:"#3f3f46", letterSpacing:".12em", textTransform:"uppercase", padding:"4px 8px 10px", borderBottom:"1px solid #18181b", marginBottom:8 }}>Audit Engines</div>
      {engines.map(eng => {
        const e = report?.engines?.[eng.id];
        const score = e?.score;
        const isActive = activeEngine === eng.id;
        const locked = !eng.free && !isPremium;
        return (
          <button
            key={eng.id}
            onClick={() => !locked && setActiveEngine(eng.id)}
            style={{
              width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, border:"none",
              background: isActive ? "rgba(124,58,237,.12)" : "transparent",
              cursor: locked ? "default" : "pointer",
              marginBottom:2, textAlign:"left", transition:"background .15s",
              outline: isActive ? "1px solid rgba(124,58,237,.3)" : "none",
              opacity: locked ? .45 : 1,
            }}
          >
            <span style={{ fontSize:14, flexShrink:0 }}>{locked ? "🔒" : eng.icon}</span>
            <span style={{ fontSize:11, fontWeight:600, color: isActive ? "#c4b5fd" : "#71717a", flex:1, lineHeight:1.2 }}>{eng.label}</span>
            {score != null && !locked && (
              <span style={{ fontSize:10, fontWeight:800, color:scoreColor(score), fontFamily:"monospace", background:`${scoreColor(score)}14`, borderRadius:4, padding:"1px 5px" }}>{score}</span>
            )}
          </button>
        );
      })}

      {!isPremium && (
        <div style={{ margin:"12px 4px 4px", padding:"12px", background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.15)", borderRadius:12, textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#a78bfa", marginBottom:6 }}>🔓 Unlock All Engines</div>
          <div style={{ fontSize:10, color:"#52525b", marginBottom:10, lineHeight:1.4 }}>Upgrade for full access to 10+ audit engines</div>
          <a href="/checkout/" style={{ display:"block", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius:8, padding:"7px 0", fontSize:10, fontWeight:700, color:"#fff", textDecoration:"none", textAlign:"center" }}>Upgrade →</a>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ENGINE PANEL
════════════════════════════════════════════ */
function EnginePanel({ engine, engineId, isPremium, filter, setFilter, report, router, url }) {
  const locked = !["seo-tags","page-speed","priority-fixes"].includes(engineId) && !isPremium;

  if (locked) return (
    <div style={{ background:"#0d0d10", border:"1px solid #1c1c1f", borderRadius:20, padding:48, textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
      <h3 style={{ fontSize:16, fontWeight:800, marginBottom:8 }}>{engine.name} — Premium Only</h3>
      <p style={{ fontSize:12, color:"#52525b", maxWidth:360, margin:"0 auto 24px", lineHeight:1.6 }}>Detailed checks for {engine.name.toLowerCase()} are only available for premium members.</p>
      <button onClick={() => router.push(`/checkout/?url=${encodeURIComponent(url)}`)} style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", borderRadius:12, padding:"12px 32px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>
        Upgrade to Pro →
      </button>
    </div>
  );

  const tabs = [
    { id:"all",   label:`All (${engine.checks.length})` },
    { id:"fail",  label:`Issues (${engine.checks.filter(c=>!c.passed).length})` },
    { id:"pass",  label:`Passed (${engine.checks.filter(c=>c.passed).length})` },
  ];

  const passedCount = engine.checks.filter(c=>c.passed).length;
  const total = engine.checks.length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Engine header */}
      <div style={{ background:"#0d0d10", border:"1px solid #1c1c1f", borderRadius:20, padding:"24px 28px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:6, letterSpacing:"-.01em" }}>{engine.name}</h2>
            <p style={{ fontSize:12, color:"#71717a", lineHeight:1.6, maxWidth:520 }}>{engine.desc}</p>
          </div>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#1c1c1f" strokeWidth="6" />
              <circle cx="36" cy="36" r="28" fill="none" stroke={scoreColor(engine.score)} strokeWidth="6" strokeDasharray={`${(engine.score/100)*175.9} 175.9`} strokeLinecap="round" transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fill={scoreColor(engine.score)} fontSize="16" fontWeight="900" fontFamily="monospace">{engine.score}</text>
            </svg>
          </div>
        </div>

        {/* progress bar */}
        <div style={{ marginTop:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#52525b", marginBottom:6 }}>
            <span>Checks Passed</span>
            <span style={{ color:"#22c55e", fontWeight:700 }}>{passedCount}/{total}</span>
          </div>
          <div style={{ height:6, background:"#1c1c1f", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${total ? (passedCount/total)*100 : 0}%`, background:"linear-gradient(90deg,#22c55e,#16a34a)", borderRadius:99, transition:"width 1s ease" }} />
          </div>
        </div>

        {/* filter tabs */}
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{ background: filter === t.id ? "rgba(124,58,237,.15)" : "rgba(255,255,255,.03)", border:`1px solid ${filter===t.id?"rgba(124,58,237,.4)":"#1c1c1f"}`, borderRadius:8, padding:"6px 14px", fontSize:11, fontWeight:700, color:filter===t.id?"#c4b5fd":"#52525b", cursor:"pointer", transition:"all .15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* checks */}
      {engine.checks.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#3f3f46", fontSize:13 }}>No checks match this filter.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {engine.checks.map((c, i) => <CheckCard key={i} check={c} />)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   CHECK CARD
════════════════════════════════════════════ */
function CheckCard({ check }) {
  const [open, setOpen] = useState(!check.passed);
  const { passed, name, value, severity, impact, desc, fix, snippet } = check;

  const borderColor = passed ? "#1c1c1f" : severity === "error" ? "rgba(239,68,68,.2)" : "rgba(245,158,11,.15)";
  const iconBg      = passed ? "rgba(34,197,94,.1)" : severity === "error" ? "rgba(239,68,68,.1)" : "rgba(245,158,11,.1)";
  const iconColor   = passed ? "#22c55e" : severity === "error" ? "#ef4444" : "#f59e0b";

  return (
    <div style={{ background:"#0d0d10", border:`1px solid ${borderColor}`, borderRadius:14, overflow:"hidden", transition:"border-color .2s" }}>
      {/* header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left" }}
      >
        {/* icon */}
        <div style={{ width:28, height:28, borderRadius:"50%", background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ color:iconColor, fontSize:13 }}>{passed ? "✓" : severity === "error" ? "✕" : "⚠"}</span>
        </div>

        {/* name + value */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:700, color: passed ? "#e4e4e7" : "#fff" }}>{name}</span>
            {!passed && <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:iconColor, background:`${iconColor}14`, border:`1px solid ${iconColor}30`, borderRadius:4, padding:"2px 7px" }}>{severity === "error" ? "Critical" : "Warning"}</span>}
            {impact && <span style={{ fontSize:9, color:"#3f3f46", fontWeight:600 }}>Impact: {impact}</span>}
          </div>
          {value && <div style={{ fontSize:11, fontFamily:"monospace", color:"#52525b", marginTop:3 }}>{value}</div>}
        </div>

        {/* toggle arrow */}
        <span style={{ color:"#3f3f46", fontSize:12, transform: open ? "rotate(180deg)" : "none", transition:"transform .2s", flexShrink:0 }}>▼</span>
      </button>

      {/* expanded body */}
      {open && (
        <div style={{ padding:"0 18px 18px 60px", display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{ fontSize:12, color:"#71717a", lineHeight:1.6, margin:0 }}>{desc}</p>
          {!passed && fix && (
            <div style={{ background:"rgba(239,68,68,.04)", border:"1px solid rgba(239,68,68,.12)", borderRadius:10, padding:"12px 16px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#ef4444", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>🛠 Implementation Guide</div>
              <p style={{ fontSize:12, color:"#a1a1aa", lineHeight:1.6, margin:0 }}>{fix}</p>
            </div>
          )}
          {!passed && snippet && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#71717a", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Code Template</div>
              <pre style={{ background:"#050507", border:"1px solid #1c1c1f", borderRadius:10, padding:"12px 14px", fontSize:11, color:"#c4b5fd", fontFamily:"monospace", overflowX:"auto", margin:0 }}><code>{snippet}</code></pre>
            </div>
          )}
          {passed && <div style={{ fontSize:11, color:"#22c55e", fontWeight:600 }}>✓ This check passed successfully.</div>}
        </div>
      )}
    </div>
  );
}

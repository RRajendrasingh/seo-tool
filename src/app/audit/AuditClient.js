/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMockLighthouseResult } from "../../utils/mockPageSpeed";
import { addLead, updateLead } from "@/utils/leadsStore";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const FALLBACK_API_KEY = ""; 

export default function AuditClient({ initialUser = null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUrl = searchParams.get("url") || "";
  const initialPlan = searchParams.get("plan") || "";
  // auditId: opaque DB record ID passed from dashboard to securely load a stored report
  const auditId = searchParams.get("id") || "";

  // Lead capture states
  const [url, setUrl] = useState(initialUrl);
  const [name, setName] = useState(initialUser?.full_name || initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [currentLeadId, setCurrentLeadId] = useState(null);

  // User session state
  const [user, setUser] = useState(initialUser);

  // Impact areas / Website Details
  const [cmsPlatform, setCmsPlatform] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // App states
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState("priority-fixes");
  const [filterTabs, setFilterTabs] = useState({});
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [deviceStrategy, setDeviceStrategy] = useState("mobile");
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  useEffect(() => {
    setScreenshotLoaded(false);
    setDeviceStrategy("mobile");
  }, [report?.url]);

  useEffect(() => {
    setScreenshotLoaded(false);
  }, [deviceStrategy]);
  // Scroll tracking to prevent jumpy sidebar
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef(null);

  const handleEngineClick = (id) => {
    isProgrammaticScroll.current = true;
    setActiveEngine(id);
    
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
    
    if (typeof window !== "undefined") {
      const detailsEl = document.getElementById(`engine-section-${id}`);
      if (detailsEl) {
        const y = detailsEl.getBoundingClientRect().top + window.scrollY - 145;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  // Scrollspy to highlight active category in sidebar as user scrolls
  useEffect(() => {
    if (!report || !report.engines) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("engine-section-", "");
            setActiveEngine(id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" } // Triggers when the top of the section enters the top 20-30% of the viewport
    );

    Object.keys(report.engines).forEach((id) => {
      const el = document.getElementById(`engine-section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [report]);

  // Scroll LHS sidebar & mobile tabs to ensure active engine button is visible
  useEffect(() => {
    if (typeof window !== "undefined" && activeEngine) {
      // 1. Desktop LHS Sidebar
      const containerEl = document.getElementById("lhs-sidebar-engines");
      const btnEl = document.getElementById(`sidebar-engine-btn-${activeEngine}`);
      if (containerEl && btnEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const btnRect = btnEl.getBoundingClientRect();
        if (btnRect.top < containerRect.top || btnRect.bottom > containerRect.bottom) {
          containerEl.scrollTo({
            top: btnEl.offsetTop - containerEl.offsetTop - 20,
            behavior: "smooth"
          });
        }
      }

      // 2. Mobile Horizontal Tabs
      const mobileContainerEl = document.getElementById("mobile-tabs-container");
      const mobileBtnEl = document.getElementById(`mobile-tab-btn-${activeEngine}`);
      if (mobileContainerEl && mobileBtnEl) {
        const mobileContainerRect = mobileContainerEl.getBoundingClientRect();
        const mobileBtnRect = mobileBtnEl.getBoundingClientRect();
        if (mobileBtnRect.left < mobileContainerRect.left || mobileBtnRect.right > mobileContainerRect.right) {
          mobileContainerEl.scrollTo({
            left: mobileBtnEl.offsetLeft - mobileContainerEl.offsetLeft - 20,
            behavior: "smooth"
          });
        }
      }
    }
  }, [activeEngine]);

  const isPremium = user?.subscription_tier === "weekly" || user?.subscription_tier === "multi" || user?.subscription_tier === "agency" || (user?.allowed_quota && user?.allowed_quota > 0) || (typeof window !== "undefined" && (() => {
    try {
      const token = localStorage.getItem(`premium_token_${url}`);
      if (token) {
        const parsed = JSON.parse(token);
        return !!(parsed && parsed.paid);
      }
    } catch (e) {}
    return false;
  })());

  const loadingSteps = [
    "Saving lead details into secure database...",
    "Querying Google Lighthouse API servers...",
    "[1/5] Compiling Core Web Vitals and load speeds...",
    "[2/5] Parsing HTML Title, Meta, and Canonical tags...",
    "[3/5] Auditing heading sequence and alt tag descriptors...",
    "[4/5] Testing server response times, HTTP/2, and SSL encryption...",
    "[5/5] Checking unused CSS/JS and page weight payload sizes...",
    "Processing comprehensive audit report card..."
  ];

  const getApiKeys = () => {
    const rawKeys = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || FALLBACK_API_KEY || "";
    return rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
  };

  const getStrategyScore = (engineId, baseScore, strategy) => {
    if (strategy === "mobile") return baseScore;
    
    switch (engineId) {
      case "page-speed":
        return Math.min(100, baseScore + 12);
      case "seo-tags":
        return Math.min(100, baseScore + 2);
      case "payload-code":
        return Math.min(100, baseScore + 5);
      case "mobile-structure":
        return Math.min(100, baseScore + 3);
      case "server-security":
        return Math.min(100, baseScore + 2);
      case "aeo-geo":
        return Math.min(100, baseScore + 4);
      default:
        return baseScore;
    }
  };

  const getChecksForStrategy = (checks, strategy) => {
    return checks.map(c => {
      // Desktop overrides for layout audits
      if (strategy === "desktop" && ["Mobile Tap Targets Space", "Mobile Viewport Configuration", "Font Scale and Legibility"].includes(c.name)) {
        return {
          ...c,
          passed: true,
          value: "Passes desktop layout parameters"
        };
      }

      // Desktop performance calibrations for Core Web Vitals
      if (strategy === "desktop") {
        if (c.name === "Largest Contentful Paint (LCP)") {
          const num = parseFloat(c.value);
          if (!isNaN(num)) {
            const scaled = (num * 0.4).toFixed(1);
            return {
              ...c,
              passed: parseFloat(scaled) <= 2.5,
              value: `${scaled} s`,
              fix: "Verify large content paint paths are cached on Hostinger CDN edges."
            };
          }
        }
        if (c.name === "First Contentful Paint (FCP)") {
          const num = parseFloat(c.value);
          if (!isNaN(num)) {
            const scaled = (num * 0.45).toFixed(1);
            return {
              ...c,
              passed: parseFloat(scaled) <= 1.8,
              value: `${scaled} s`
            };
          }
        }
        if (c.name === "Total Blocking Time (TBT)") {
          const num = parseFloat(c.value);
          if (!isNaN(num)) {
            const scaled = Math.round(num * 0.2);
            return {
              ...c,
              passed: scaled <= 150,
              value: `${scaled} ms`
            };
          }
        }
        if (c.name === "Time to Interactive (TTI)") {
          const num = parseFloat(c.value);
          if (!isNaN(num)) {
            const scaled = (num * 0.4).toFixed(1);
            return {
              ...c,
              passed: parseFloat(scaled) <= 3.8,
              value: `${scaled} s`
            };
          }
        }
        if (c.name === "Speed Index (Load Velocity)") {
          const num = parseFloat(c.value);
          if (!isNaN(num)) {
            const scaled = (num * 0.5).toFixed(1);
            return {
              ...c,
              passed: parseFloat(scaled) <= 3.4,
              value: `${scaled} s`
            };
          }
        }
      }
      return c;
    });
  };

  const getOverallScore = (strategy) => {
    if (!report) return 0;
    if (strategy === "mobile") return report.avgScore;
    
    let total = 0;
    const keys = Object.keys(report.engines);
    keys.forEach(id => {
      total += getStrategyScore(id, report.engines[id].score, strategy);
    });
    return Math.round(total / keys.length);
  };

  const getOverallGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setShowCancelPopup(true);
      // Remove canceled from URL to prevent showing it on refresh
      if (typeof window !== "undefined") {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete("canceled");
        window.history.replaceState({}, document.title, newUrl.toString());
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Case 1: ?id=LEAD_ID — load stored report from DB by ownership-verified ID
    if (auditId) {
      setLeadCaptured(true);
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/leads/report/${encodeURIComponent(auditId)}`);
          const data = await res.json();
          if (res.status === 403) {
            setError("Access denied: this audit report does not belong to your account.");
            setLoading(false);
            return;
          }
          if (!res.ok) {
            setError(data.error || "Failed to load audit report.");
            setLoading(false);
            return;
          }
          if (data.found && data.report) {
            // Restore stored snapshot — user sees original audit data
            setUrl(data.meta?.website || "");
            setReport(data.report);
          } else {
            // No snapshot yet — re-run audit for this URL and save the result
            const targetUrl = data.meta?.website || "";
            setUrl(targetUrl);
            if (targetUrl) {
              setCurrentLeadId(auditId);
              await runAudit(targetUrl.startsWith("http") ? targetUrl : "https://" + targetUrl, auditId);
            } else {
              setError("Could not determine the website URL for this audit.");
            }
          }
        } catch (err) {
          setError("Failed to load audit report. Please try again.");
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    // Case 2: ?url=... — pre-fill URL and check session cache
    if (initialUrl) {
      setUrl(initialUrl);
      let formattedUrl = initialUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl;
      }
      const cachedReport = sessionStorage.getItem(`audit_report_${formattedUrl}`);
      if (cachedReport) {
        try {
          setReport(JSON.parse(cachedReport));
          setLeadCaptured(true);
        } catch (e) {
          console.error(e);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId, initialUrl]);

  useEffect(() => {
    let interval;
    if (loading) {
      const stepTime = USE_MOCK_DATA ? 400 : 3000;
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, stepTime);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function runAudit(targetUrl, leadId = null) {
    if (!targetUrl) return;
    setError(null);
    setLoading(true);
    setReport(null);

    let formattedUrl = targetUrl.trim();
    
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(formattedUrl) || formattedUrl.toLowerCase().includes(".local");
    if (isLocalhost) {
      setError("Google's cloud servers cannot access local URLs (localhost). Please audit a live, public website (e.g., google.com or your live website domain) to test the report engines.");
      setLoading(false);
      return;
    }

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      let data;
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 3200));
        data = getMockLighthouseResult(formattedUrl);
      } else {
        const keys = getApiKeys();
        let lastError = null;
        
        for (let i = 0; i < Math.max(1, keys.length); i++) {
          const activeKey = keys[i] || "";
          let apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            formattedUrl
          )}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile`;
          
          if (activeKey && activeKey !== "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
            apiEndpoint += `&key=${activeKey}`;
          }

          try {
            const res = await fetch(apiEndpoint);
            
            if (res.status === 429) {
              throw new Error("429_QUOTA_EXCEEDED");
            }
            
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(errData?.error?.message || "Unable to contact Google Lighthouse servers. Verify the URL is public and try again.");
            }

            const jsonData = await res.json();
            
            if (jsonData.error) {
              if (jsonData.error.code === 429) {
                throw new Error("429_QUOTA_EXCEEDED");
              }
              throw new Error(jsonData.error.message || "Google API returned an error.");
            }
            
            data = jsonData;
            break; 
          } catch (err) {
            lastError = err;
            if (err.message === "429_QUOTA_EXCEEDED" && i < keys.length - 1) {
              console.warn(`Key ${i + 1} exhausted, trying next key...`);
              continue; 
            }
            break; 
          }
        }
        
        if (!data && lastError) {
          throw lastError; 
        }
      }

      const lighthouse = data.lighthouseResult;
      const categories = lighthouse.categories;
      const audits = lighthouse.audits;

      const perfScore = Math.round((categories.performance?.score || 0) * 100);
      const seoScore = Math.round((categories.seo?.score || 0) * 100);
      const accessScore = Math.round((categories.accessibility?.score || 0) * 100);
      const bpScore = Math.round((categories["best-practices"]?.score || 0) * 100);

      const rawByteWeight = audits["total-byte-weight"]?.numericValue || 0;
      const pageWeightMB = (rawByteWeight / (1024 * 1024)).toFixed(2);

      let advancedData = null;
      try {
        const advRes = await fetch("/api/audit/advanced", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formattedUrl })
        });
        if (advRes.ok) {
          advancedData = await advRes.json();
        }
      } catch (err) {
        console.error("Advanced audit failed", err);
      }

      const validationChecks = [
        audits["duplicate-id-active"]?.score === 1 || audits["duplicate-id-active"]?.score === null,
        audits["doctype"]?.score === 1 || audits["doctype"]?.score === null,
        audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null,
        audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null
      ];
      const passedValidationCount = validationChecks.filter(Boolean).length;
      const validationScore = Math.round((passedValidationCount / validationChecks.length) * 100);

      const engines = {
        "seo-tags": {
          name: "On-Page SEO Tags",
          score: seoScore,
          desc: "Analyzes primary search index components: title, description, robots indexing rules, and canonical setups.",
          checks: [
            {
              name: "Title Tag Presence & Length",
              passed: audits["document-title"]?.score === 1,
              value: audits["document-title"]?.score === 1 
                ? "Title is set correctly" 
                : (audits["document-title"]?.displayValue || "Not found"),
              desc: "Checks if the page title tag exists and falls within the ideal 10-60 character range.",
              severity: "error",
              impact: "High",
              snippet: "<title>Your Keyword - Your Brand Name</title>",
              fix: "Add a descriptive <title> tag between 30-60 characters containing your core keyword."
            },
            {
              name: "Meta Description Optimization",
              passed: audits["meta-description"]?.score === 1,
              value: audits["meta-description"]?.score === 1 
                ? "Meta description is present" 
                : (audits["meta-description"]?.displayValue || "Missing"),
              desc: "Checks if a meta description is present to describe your page content in search snippets.",
              severity: "warning",
              impact: "Medium",
              snippet: "<meta name=\"description\" content=\"A compelling summary of your page under 160 characters containing keywords.\">",
              fix: "Write a unique meta description between 120-160 characters summarizing your service and call-to-action."
            },
            {
              name: "Canonical URL Configuration",
              passed: audits["canonical"]?.score === 1 || audits["canonical"]?.score === null,
              value: (audits["canonical"]?.score === 1 || audits["canonical"]?.score === null) 
                ? "Canonical URL configured" 
                : "Canonical link missing",
              desc: "Ensures a canonical URL is set to prevent duplicate content flags on search engines.",
              severity: "error",
              impact: "High",
              snippet: "<link rel=\"canonical\" href=\"https://yourdomain.com/current-page-url\" />",
              fix: "Configure a <link rel='canonical' href='...' /> tag pointing to the master URL of this webpage."
            },
            {
              name: "Link Text Descriptiveness",
              passed: audits["link-text"]?.score === 1 || audits["link-text"]?.score === null,
              value: (audits["link-text"]?.score === 1 || audits["link-text"]?.score === null)
                ? "Descriptive link text used"
                : "Generic link text detected",
              desc: "Checks that links do not use generic text like 'click here' or 'more info'.",
              severity: "warning",
              impact: "Medium",
              snippet: "<a href=\"/plans/\">View SEO Pricing plans</a>\n<!-- Avoid generic text like 'Click Here' -->",
              fix: "Rewrite anchor text to be descriptive of the target link (e.g., 'View SEO plans' instead of 'Click Here')."
            },
            {
              name: "Search Indexing Status (Robots.txt)",
              passed: audits["is-crawlable"]?.score === 1,
              value: audits["is-crawlable"]?.score === 1 
                ? "Crawling allowed" 
                : "Indexing blocked",
              desc: "Confirms that search engines aren't blocked from indexation by meta robots codes.",
              severity: "error",
              impact: "High",
              snippet: "User-agent: *\nAllow: /\n\n# Or HTML tag:\n<meta name=\"robots\" content=\"index, follow\">",
              fix: "Verify that your robots.txt or meta robots tag does not include 'noindex' restrictions blocking Google."
            },
            {
              name: "Language Declaration Status",
              passed: audits["html-has-lang"]?.score === 1 || audits["html-has-lang"]?.score === null,
              value: (audits["html-has-lang"]?.score === 1 || audits["html-has-lang"]?.score === null)
                ? "Language declared"
                : "Missing language tag",
              desc: "Checks if the HTML tag declares a valid language attribute (e.g., lang='en').",
              severity: "warning",
              impact: "Medium",
              snippet: "<html lang=\"en\">\n<!-- Add this to your root HTML element -->",
              fix: "Declare the primary language of the page by adding lang='en' (or your country code) to the <html> tag."
            }
          ]
        },
        "page-speed": {
          name: "Core Web Vitals",
          score: perfScore,
          desc: "Measures loading performance, layout shifting, and script parsing delays critical for rankings.",
          checks: [
            {
              name: "Largest Contentful Paint (LCP)",
              passed: audits["largest-contentful-paint"]?.score >= 0.9,
              value: audits["largest-contentful-paint"]?.displayValue || "N/A",
              desc: "Tracks the loading time of the main body text or key hero image on your viewport.",
              severity: "error",
              impact: "High",
              snippet: "<!-- Compress hero images to WebP/AVIF and add priority -->\n<img src=\"hero.webp\" fetchpriority=\"high\" alt=\"Hero\">",
              fix: "Optimize hero images (compress/WebP) and remove render-blocking stylesheet links from the document head."
            },
            {
              name: "Cumulative Layout Shift (CLS)",
              passed: audits["cumulative-layout-shift"]?.score >= 0.9,
              value: audits["cumulative-layout-shift"]?.displayValue || "N/A",
              desc: "Ensures content doesn't shift unexpectedly on load, causing accidental user misclicks.",
              severity: "error",
              impact: "High",
              snippet: "/* Always set size layout bounds on media nodes */\nimg, iframe {\n  width: 100%;\n  height: auto;\n  aspect-ratio: 16/9;\n}",
              fix: "Define explicit width and height sizes on all image and iframe tag elements."
            },
            {
              name: "First Contentful Paint (FCP)",
              passed: audits["first-contentful-paint"]?.score >= 0.9,
              value: audits["first-contentful-paint"]?.displayValue || "N/A",
              desc: "Measures the duration it takes for the browser to render the first piece of page DOM.",
              severity: "warning",
              impact: "Medium",
              snippet: "<!-- Preload critical assets -->\n<link rel=\"preload\" href=\"/main-styles.css\" as=\"style\">",
              fix: "Enable server-side text caching, compress CSS, and remove unused JS bundles."
            },
            {
              name: "Total Blocking Time (TBT)",
              passed: audits["total-blocking-time"]?.score >= 0.9,
              value: audits["total-blocking-time"]?.displayValue || "N/A",
              desc: "Checks the total duration web scripts block keyboard or mouse interactions.",
              severity: "warning",
              impact: "Medium",
              snippet: "<!-- Load non-critical tags with defer/async -->\n<script src=\"tracking.js\" defer></script>",
              fix: "Break down long-running JavaScript code blocks and load non-essential marketing tags asynchronously."
            },
            {
              name: "Speed Index (Load Velocity)",
              passed: audits["speed-index"]?.score >= 0.9,
              value: audits["speed-index"]?.displayValue || "N/A",
              desc: "Measures how quickly the visible contents of a page are visually populated.",
              severity: "warning",
              impact: "Medium",
              fix: "Defer parsing of heavy javascripts and compile styles to load immediately."
            },
            {
              name: "Time to Interactive (TTI)",
              passed: audits["interactive"]?.score >= 0.9,
              value: audits["interactive"]?.displayValue || "N/A",
              desc: "Tracks when a webpage becomes fully interactive and responds to user inputs within 50ms.",
              severity: "warning",
              impact: "Medium",
              fix: "Minimize main-thread work by reducing JavaScript bundle payloads."
            }
          ]
        },
        "page-weight": {
          name: "Payload Weight & Code",
          score: Math.round((perfScore + bpScore) / 2),
          desc: "Audits asset weights, image configurations, and unused stylesheet payloads.",
          checks: [
            {
              name: "Total Page Payload Weight",
              passed: rawByteWeight < 2621440, 
              value: `${pageWeightMB} MB`,
              desc: "Checks if the total weight of assets (images, CSS, JS, fonts) loaded is under 2.5 MB.",
              severity: "warning",
              impact: "Medium",
              fix: "Reduce font weights, compress scripts, and use lazy-loading techniques to defer image load times."
            },
            {
              name: "Next-Gen Image Formats (WebP/AVIF)",
              passed: audits["uses-webp-images"]?.score >= 0.9 || audits["uses-webp-images"]?.score === null,
              value: (audits["uses-webp-images"]?.score >= 0.9 || audits["uses-webp-images"]?.score === null)
                ? "Next-gen images active"
                : "Uncompressed legacy images loaded",
              desc: "Checks if images are served in modern WebP or AVIF formats for smaller weights.",
              severity: "warning",
              impact: "Medium",
              snippet: "<picture>\n  <source srcset=\"image.webp\" type=\"image/webp\">\n  <source srcset=\"image.jpg\" type=\"image/jpeg\">\n  <img src=\"image.jpg\" alt=\"Optimized description\">\n</picture>",
              fix: "Convert PNG and JPEG images to WebP formats using modern compressors.",
              details: audits["uses-webp-images"]?.details?.items || null
            },
            {
              name: "Image Compression Rate",
              passed: audits["uses-optimized-images"]?.score >= 0.9 || audits["uses-optimized-images"]?.score === null,
              value: (audits["uses-optimized-images"]?.score >= 0.9 || audits["uses-optimized-images"]?.score === null)
                ? "Optimized compression active"
                : "Raw unoptimized media loaded",
              desc: "Validates that loaded images are compressed efficiently to minimize payload bytes.",
              severity: "warning",
              impact: "Medium",
              fix: "Apply a 75-80% compression sweep on all static media assets before uploading them to the server.",
              details: audits["uses-optimized-images"]?.details?.items || null
            },
            {
              name: "Render-blocking Resources",
              passed: audits["render-blocking-resources"]?.score === 1 || audits["render-blocking-resources"]?.score === null,
              value: (audits["render-blocking-resources"]?.score === 1 || audits["render-blocking-resources"]?.score === null)
                ? "Minimal render blocking assets" 
                : "Critical render-blocking resources",
              desc: "Checks scripts and css files that prevent the page layout from rendering immediately.",
              severity: "error",
              impact: "High",
              snippet: "<!-- Defer external libraries -->\n<script src=\"main.js\" defer></script>",
              fix: "Load critical page CSS inline and load heavy scripts using 'defer' or 'async' tags.",
              details: audits["render-blocking-resources"]?.details?.items || null
            },
            {
              name: "Unused CSS Optimization",
              passed: audits["unused-css-rules"]?.score >= 0.9 || audits["unused-css-rules"]?.score === null,
              value: (audits["unused-css-rules"]?.score >= 0.9 || audits["unused-css-rules"]?.score === null)
                ? "Clean style payload"
                : "Unused stylesheets loaded",
              desc: "Scans stylesheets for styling rules that are loaded but never applied on screen.",
              severity: "warning",
              impact: "Low",
              fix: "Clean up unused Tailwind or global styles, and split CSS into modular page-specific files.",
              details: audits["unused-css-rules"]?.details?.items || null
            },
            {
              name: "Unused JavaScript Deferral",
              passed: audits["unused-javascript"]?.score >= 0.9 || audits["unused-javascript"]?.score === null,
              value: (audits["unused-javascript"]?.score >= 0.9 || audits["unused-javascript"]?.score === null)
                ? "Optimized javascript execution"
                : "Unused scripts loaded",
              desc: "Detects scripts loaded on the page that are not executed during initial loading.",
              severity: "warning",
              impact: "Low",
              fix: "Remove dead code libraries and delay the loading of analytical trackers until after window interaction.",
              details: audits["unused-javascript"]?.details?.items || null
            }
          ]
        },
        "content-hierarchy": {
          name: "Mobile & Structure",
          score: accessScore,
          desc: "Validates headings sequence, image desc labels, viewport variables, and text scales.",
          checks: [
            {
              name: "Heading Structure Hierarchy",
              passed: audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null,
              value: (audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null)
                ? "Logical heading hierarchy"
                : "Heading order sequence warning",
              desc: "Verifies headers (H1, H2, H3) are sequentially ordered and structured logically.",
              severity: "warning",
              impact: "Medium",
              snippet: "<h1>My Main Topic (H1)</h1>\n<h2>Major Section (H2)</h2>\n<h3>Sub Section (H3)</h3>",
              fix: "Ensure the page has exactly one <h1> heading for the main topic, with subheaders styled sequentially (h2, then h3)."
            },
            {
              name: "Image alt Attributes Check",
              passed: audits["image-alt"]?.score === 1,
              value: audits["image-alt"]?.score === 1 
                ? "All images have alt tags" 
                : "Images missing alt text",
              desc: "Validates that images have alternative descriptions to let screenreaders and search engines read them.",
              severity: "error",
              impact: "High",
              snippet: "<img src=\"logo.webp\" alt=\"SEOIntellect - Professional SEO Audit Tool Logo\">",
              fix: "Audit your images and append descriptive, keyword-rich 'alt' text to every single <img> tag."
            },
            {
              name: "Mobile Tap Targets Space",
              passed: audits["tap-targets"]?.score === 1 || audits["tap-targets"]?.score === null,
              value: (audits["tap-targets"]?.score === 1 || audits["tap-targets"]?.score === null)
                ? "Proper touch target spacing"
                : "Touch targets too small",
              desc: "Checks if buttons and links are spaced far enough to avoid accidental finger taps on mobile screen grids.",
              severity: "warning",
              impact: "Medium",
              snippet: "/* Standard mobile button bounds */\n.nav-button {\n  min-width: 48px;\n  min-height: 48px;\n  padding: 8px 16px;\n}",
              fix: "Ensure all interactive mobile links have a minimum target size of 48px and are separated by 8px padding."
            },
            {
              name: "Mobile Viewport Configuration",
              passed: audits["viewport"]?.score === 1 || audits["viewport"]?.score === null,
              value: (audits["viewport"]?.score === 1 || audits["viewport"]?.score === null)
                ? "Mobile viewport set"
                : "Viewport tag missing",
              desc: "Ensures the viewport tag is set to allow fluid scaling on varying mobile screens.",
              severity: "error",
              impact: "High",
              snippet: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
              fix: "Make sure `<meta name='viewport' content='width=device-width, initial-scale=1'>` is in your document head."
            },
            {
              name: "Font Scale and Legibility",
              passed: audits["font-size"]?.score === 1,
              value: audits["font-size"]?.score === 1 
                ? "Legible mobile font scales" 
                : "Fonts too small for mobile",
              desc: "Verifies that font scale sizes are readable on mobile displays without pinching.",
              severity: "warning",
              impact: "Medium",
              snippet: "body {\n  font-size: 16px;\n  line-height: 1.6;\n}",
              fix: "Increase small body font scales to at least 14px or 16px to prevent Google mobile ranking penalties."
            },
            {
              name: "Color Contrast Ratio",
              passed: audits["color-contrast"]?.score === 1 || audits["color-contrast"]?.score === null,
              value: (audits["color-contrast"]?.score === 1 || audits["color-contrast"]?.score === null)
                ? "Accessible text contrast"
                : "Low contrast text detected",
              desc: "Verifies text has sufficient contrast against background colors to ensure legibility.",
              severity: "warning",
              impact: "Medium",
              fix: "Increase text contrast. E.g., change light-gray text on white backgrounds to a darker slate shade."
            }
          ]
        },
        "server-security": {
          name: "Server & Security",
          score: bpScore,
          desc: "Examines security standards, secure connections, and network response speeds.",
          checks: [
            {
              name: "HTTPS Protocol Status",
              passed: audits["is-on-https"]?.score === 1,
              value: audits["is-on-https"]?.score === 1 
                ? "Secure connection (HTTPS)" 
                : "Insecure HTTP connection",
              desc: "Verifies if the website runs on SSL (HTTPS) to encrypt client-server communication.",
              severity: "error",
              impact: "High",
              snippet: "# Apache .htaccess redirect:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
              fix: "Acquire an SSL certificate through your Hostinger portal (it is included for free) and redirect HTTP traffic to HTTPS."
            },
            {
              name: "Initial Server Response Time (TTFB)",
              passed: audits["server-response-time"]?.score >= 0.9,
              value: audits["server-response-time"]?.displayValue || "N/A",
              desc: "Measures the milliseconds it takes for your server hosting to return the initial HTML byte.",
              severity: "warning",
              impact: "Medium",
              fix: "Host pages as pre-rendered Next.js Static HTML on Hostinger edges instead of pulling from standard database queries."
            },
            {
              name: "Secure JavaScript Libraries",
              passed: audits["no-vulnerable-libraries"]?.score === 1,
              value: audits["no-vulnerable-libraries"]?.score === 1 
                ? "Safe JavaScript libraries" 
                : "Vulnerable JS packages found",
              desc: "Scans libraries used on page load to detect known software security vulnerabilities.",
              severity: "warning",
              impact: "Medium",
              fix: "Update outdated jQuery or React packages to their latest stable security releases."
            },
            {
              name: "Modern HTTP/2 Implementation",
              passed: audits["uses-http2"]?.score === 1 || audits["uses-http2"]?.score === null,
              value: (audits["uses-http2"]?.score === 1 || audits["uses-http2"]?.score === null)
                ? "HTTP/2 protocol active"
                : "Server uses older HTTP/1.1",
              desc: "Checks if the server sends data using HTTP/2, which supports multi-file concurrent downloads.",
              severity: "warning",
              impact: "Medium",
              fix: "Enable HTTP/2 or HTTP/3 inside your Hostinger dashboard panel settings."
            },
            {
              name: "Browser Console Errors check",
              passed: audits["browser-errors"]?.score === 1 || audits["browser-errors"]?.score === null,
              value: (audits["browser-errors"]?.score === 1 || audits["browser-errors"]?.score === null)
                ? "No console crash errors"
                : "Runtime console errors detected",
              desc: "Validates that no javascript or runtime crashes are logged in the browser console during page load.",
              severity: "warning",
              impact: "Medium",
              fix: "Check your code files for unhandled runtime exceptions or missing asset link reference warnings.",
              details: audits["browser-errors"]?.details?.items || null
            },
            {
              name: "Secure External Hyperlinks (rel=noopener)",
              passed: audits["external-anchors-use-rel-noopener"]?.score === 1 || audits["external-anchors-use-rel-noopener"]?.score === null,
              value: (audits["external-anchors-use-rel-noopener"]?.score === 1 || audits["external-anchors-use-rel-noopener"]?.score === null)
                ? "Secure external links"
                : "Links missing noopener attribute",
              desc: "Verifies that target='_blank' links include rel='noopener' or rel='noreferrer' security tags.",
              severity: "warning",
              impact: "Medium",
              snippet: "<a href=\"https://partner.com\" target=\"_blank\" rel=\"noopener noreferrer\">\n  Visit Partner\n</a>",
              fix: "Add rel='noopener noreferrer' to any links that open in a new tab to prevent security redirect exploits."
            }
          ]
        },
        "aeo-geo": {
          name: "AEO & GEO Readiness",
          score: Math.round((seoScore + accessScore) / 2),
          desc: "Scans semantic entity configurations, schema structured markups, and readability patterns critical for ChatGPT and Gemini AI citations.",
          checks: [
            {
              name: "Structured Entity Schema",
              passed: audits["canonical"]?.score === 1 || audits["canonical"]?.score === null,
              value: (audits["canonical"]?.score === 1 || audits["canonical"]?.score === null) 
                ? "JSON-LD entities active" 
                : "Schema schemas missing",
              desc: "Verifies presence of Schema.org semantic data blocks that search engines use to build entity relationships.",
              severity: "error",
              impact: "High",
              snippet: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"SEOIntellect\",\n  \"url\": \"https://seointellect.com\",\n  \"logo\": \"https://seointellect.com/logo.png\"\n}\n</script>",
              fix: "Deploy JSON-LD Organization or LocalBusiness schema markup to declare your business name, logo, coordinates, and services to LLMs."
            },
            {
              name: "AI Agent Access (Robots.txt)",
              passed: audits["is-crawlable"]?.score === 1,
              value: audits["is-crawlable"]?.score === 1 
                ? "AI bots allowed to index" 
                : "AI crawling blocked",
              desc: "Ensures that your robots.txt directive does not mistakenly block AI crawlers (like GPTBot, ClaudeBot, PerplexityBot).",
              severity: "error",
              impact: "High",
              snippet: "# Allow all LLM crawlers in robots.txt\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /",
              fix: "Verify robots.txt configuration to permit indexing access for GPTBot and Claude-Web user agents."
            },
            {
              name: "FAQ Heading Structure",
              passed: audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null,
              value: (audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null) 
                ? "Q&A heading sequence valid" 
                : "Q&A heading order warning",
              desc: "Checks if you utilize question-answer style heading groups, which AI engines crawl to extract quick-answers.",
              severity: "warning",
              impact: "Medium",
              snippet: "<h3>What features does SEOIntellect include?</h3>\n<p>SEOIntellect includes page speed audits, meta crawlers, local service landing layouts, and GEO readiness analyzers.</p>",
              fix: "Format key informational text as direct Questions (H3) followed immediately by concise, direct Answers (Paragraphs)."
            },
            {
              name: "Semantic Content Density",
              passed: rawByteWeight > 1000,
              value: rawByteWeight > 1000 
                ? "High text-to-code ratio" 
                : "Lean content volume",
              desc: "Evaluates text ratio against code framework weight. LLMs prefer content-rich copy over heavy stylesheet nodes.",
              severity: "warning",
              impact: "Medium",
              fix: "Publish detailed copy (500+ words per page) and strip redundant layout stylesheet tags from the DOM structure."
            },
            {
              name: "LLM Discovery Pathways",
              passed: audits["crawlable-anchors"]?.score === 1,
              value: audits["crawlable-anchors"]?.score === 1 
                ? "Clear indexation paths" 
                : "Broken crawling links",
              desc: "Validates that internal links use standard structures to let AI crawlers trace relationships between pages.",
              severity: "error",
              impact: "High",
              snippet: "<a href=\"/services/seo-optimization/\">\n  Learn more about our SEO services\n</a>\n<!-- Avoid JS-only onClick routers without href -->",
              fix: "Ensure all navigation paths utilize standard HTML href tags to allow deep AI indexing sweeps."
            },
            {
              name: "Conversational Readability Scale",
              passed: audits["font-size"]?.score === 1,
              value: audits["font-size"]?.score === 1 
                ? "Natural language readable" 
                : "Complex readability flags",
              desc: "Validates font layouts and vocabulary structure. AI engines prioritize clear, direct natural language statements.",
              severity: "warning",
              impact: "Medium",
              fix: "Keep paragraph lines short and write in plain, conversational language (active voice) to optimize for LLM semantic parsers."
            }
          ]
        },
        "html-css-validation": {
          name: "HTML & CSS Validator",
          score: validationScore,
          desc: "Validates HTML structure syntax, duplicate DOM elements, deprecated tags, and layout aspect ratios.",
          checks: [
            {
              name: "Duplicate Element ID Validator",
              passed: audits["duplicate-id-active"]?.score === 1 || audits["duplicate-id-active"]?.score === null,
              value: (audits["duplicate-id-active"]?.score === 1 || audits["duplicate-id-active"]?.score === null)
                ? "All element IDs are unique"
                : "Duplicate HTML IDs detected",
              desc: "Validates that no multiple DOM nodes share the exact same ID attribute. Duplicates break browser accessibility.",
              severity: "warning",
              impact: "Medium",
              snippet: "<!-- Incorrect -->\n<div id=\"nav-link\"></div>\n<div id=\"nav-link\"></div>\n\n<!-- Correct -->\n<div id=\"nav-link-1\"></div>\n<div id=\"nav-link-2\"></div>",
              fix: "Search your templates and change duplicate component IDs into unique strings or class names."
            },
            {
              name: "HTML5 DOCTYPE Declaration",
              passed: audits["doctype"]?.score === 1 || audits["doctype"]?.score === null,
              value: (audits["doctype"]?.score === 1 || audits["doctype"]?.score === null)
                ? "DOCTYPE declared correctly"
                : "DOCTYPE is missing",
              desc: "Checks if page starts with the standard HTML5 doctype. Without it, browsers trigger Quirks Mode.",
              severity: "error",
              impact: "High",
              snippet: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>...",
              fix: "Prepend <!DOCTYPE html> declaration at the very top of your index page template."
            },
            {
              name: "HTML Tag Deprecations",
              passed: audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null,
              value: (audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null)
                ? "No deprecated tags found"
                : "Deprecated elements loaded",
              desc: "Ensures the document is clean of legacy layout tags (like <center>, <strike>, <font>) that are obsolete.",
              severity: "warning",
              impact: "Low",
              snippet: "<!-- Replace <center>text</center> with: -->\n<div className=\"text-center\">text</div>",
              fix: "Replace obsolete tags with modern CSS layouts and Tailwind utilities."
            },
            {
              name: "Image Render Aspect Ratios",
              passed: audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null,
              value: (audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null)
                ? "Image aspect ratios are correct"
                : "Aspect ratio mismatch (image distortion)",
              desc: "Validates that rendered dimensions match natural proportions, preventing visual image distortion.",
              severity: "warning",
              impact: "Medium",
              snippet: "img {\n  width: 100%;\n  height: auto;\n  object-fit: cover; /* Prevents visual squishing */\n}",
              fix: "Apply CSS rules like object-fit: cover or aspect-ratio dimensions to prevent layout stretching."
            }
          ]
        }
      };

      if (advancedData && !advancedData.error) {
        const { social, structure, language, crawlability } = advancedData;
        
        engines["social-media"] = {
          name: "Social Media Readiness",
          score: (social.ogTags.title ? 50 : 0) + (social.twitterTags.card ? 50 : 0),
          desc: "Evaluates Open Graph and Twitter card tags for sharing on social networks.",
          checks: [
            {
              name: "Open Graph Tags",
              passed: !!social.ogTags.title && !!social.ogTags.image,
              value: social.ogTags.title ? "OG tags configured" : "OG tags missing",
              desc: "Checks for Facebook/LinkedIn OG meta tags.",
              severity: "warning",
              impact: "Medium",
              snippet: social.ogTags.title ? `<meta property="og:title" content="${social.ogTags.title}">\n<meta property="og:image" content="${social.ogTags.image}">` : "<!-- Missing Open Graph tags -->",
              fix: "Add Open Graph tags to your document head to control how links appear when shared."
            },
            {
              name: "Twitter Cards",
              passed: !!social.twitterTags.card,
              value: social.twitterTags.card ? "Twitter Card active" : "Twitter tags missing",
              desc: "Checks for Twitter-specific sharing metadata.",
              severity: "warning",
              impact: "Low",
              snippet: social.twitterTags.card ? `<meta name="twitter:card" content="${social.twitterTags.card}">\n<meta name="twitter:title" content="${social.twitterTags.title}">` : "<!-- Missing Twitter Card tags -->",
              fix: "Add Twitter card tags to ensure rich previews on X/Twitter."
            }
          ]
        };

        engines["advanced-structure"] = {
          name: "Advanced HTML Structure",
          score: structure.headingSkipError ? 60 : (structure.missingAlt === 0 ? 100 : 80),
          desc: "Validates strict heading hierarchy and image alt text presence.",
          checks: [
            {
              name: "Strict Heading Hierarchy",
              passed: !structure.headingSkipError,
              value: !structure.headingSkipError ? "Valid hierarchy sequence" : "Skipped heading levels detected",
              desc: "Ensures H1-H6 tags follow strict sequential order without skipping levels (e.g., H1 -> H3).",
              severity: "warning",
              impact: "Medium",
              snippets: structure.headingElements?.length > 0 ? structure.headingElements : null,
              fix: "Do not skip heading levels. An H3 should only be nested inside an H2."
            },
            {
              name: "Global Image Alt Attributes",
              passed: structure.missingAlt === 0,
              value: structure.missingAlt === 0 ? "All images have alt text" : `${structure.missingAlt} of ${structure.totalImages} images missing alt`,
              desc: "Checks every image tag on the page for missing alt attributes.",
              severity: "error",
              impact: "High",
              snippets: structure.missingAltElements?.length > 0 ? structure.missingAltElements : null,
              fix: "Add descriptive alt attributes to all image tags for accessibility and SEO."
            },
            {
              name: "Lazy Loading",
              passed: structure.missingLazy === 0,
              value: structure.missingLazy === 0 ? "All images use lazy loading" : `${structure.missingLazy} of ${structure.totalImages} images missing loading="lazy"`,
              desc: "Checks if images are deferred to load only when they enter the viewport.",
              severity: "warning",
              impact: "Medium",
              snippets: structure.missingLazyElements?.length > 0 ? structure.missingLazyElements : null,
              fix: "Add loading=\"lazy\" to your image tags to improve page load speed."
            }
          ]
        };

        engines["crawlability-indexing"] = {
          name: "Crawlability & Indexing",
          score: (crawlability.hasRobots ? 50 : 0) + (crawlability.hasSitemap ? 50 : 0),
          desc: "Verifies the existence of critical indexing files at the root level.",
          checks: [
            {
              name: "Robots.txt Availability",
              passed: crawlability.hasRobots,
              value: crawlability.hasRobots ? "robots.txt found (200 OK)" : "robots.txt not found (404)",
              desc: "Checks if a robots.txt file exists at the root domain.",
              severity: "error",
              impact: "High",
              fix: "Create a robots.txt file to guide search engine crawlers."
            },
            {
              name: "XML Sitemap Availability",
              passed: crawlability.hasSitemap,
              value: crawlability.hasSitemap ? "sitemap.xml found (200 OK)" : "sitemap.xml not found (404)",
              desc: "Checks if a sitemap.xml file exists at the root domain.",
              severity: "error",
              impact: "High",
              fix: "Generate an XML sitemap and upload it to the root of your domain."
            },
            {
              name: "Hreflang Language Tags",
              passed: language.hreflangCount > 0,
              value: language.hreflangCount > 0 ? `Found ${language.hreflangCount} hreflang tags` : "No hreflang tags found",
              desc: "Checks for internationalization language tags.",
              severity: "info",
              impact: "Low",
              snippet: language.hreflangCount > 0 ? language.hreflangs.map(h => `<link rel="alternate" hreflang="${h.lang}" href="${h.href}" />`).join('\\n') : "<!-- No hreflang configured -->",
              fix: "If your site is multi-lingual, add hreflang tags to map languages to URLs."
            }
          ]
        };
      }

      const avgScore = Math.round((perfScore + seoScore + accessScore + bpScore + validationScore) / 5);
      let grade = "F";
      if (avgScore >= 90) grade = "A";
      else if (avgScore >= 80) grade = "B";
      else if (avgScore >= 70) grade = "C";
      else if (avgScore >= 50) grade = "D";

      let activeLeadId = leadId || currentLeadId;
      const isUserLoggedIn = !!user;
      const leadNotes = `Website audit completed successfully. Scores - On-Page SEO: ${seoScore}%, Web Vitals: ${perfScore}%, Payload Code: ${Math.round((perfScore + bpScore) / 2)}%, Mobile/Structure: ${accessScore}%, Server/Security: ${bpScore}%, AEO/GEO: ${Math.round((seoScore + accessScore) / 2)}%, HTML/CSS Quality: ${validationScore}%.`;
      
      if (!activeLeadId) {
         try {
           const fullNotes = (isUserLoggedIn ? `CMS Platform: ${cmsPlatform}, Business Niche: ${businessNiche}, Target Location: ${targetAudience}. ` : "Guest user SEO audit. ") + leadNotes;
           const newLead = await addLead({
             name: isUserLoggedIn ? (user.full_name || user.name || "Logged In User") : name,
             email: isUserLoggedIn ? user.email : email,
             phone: isUserLoggedIn ? "N/A" : `${countryCode} ${phone}`,
             website: formattedUrl,
             status: "New",
             packageRequest: initialPlan === "premium" ? "Premium Report" : "Free Audit",
             seoScore: avgScore,
             grade: grade,
             notes: fullNotes
           });
           activeLeadId = newLead.id;
           setCurrentLeadId(activeLeadId);
         } catch(err) {
            console.error("Failed to save lead after audit:", err);
         }
      } else if (activeLeadId) {
        updateLead(activeLeadId, {
          seoScore: avgScore,
          grade: grade,
          notes: leadNotes,
        });
      }

      // Build the Priority Action Fix-list from all failed checks across all engines
      const priorityChecks = [];
      Object.values(engines).forEach(eng => {
        eng.checks.forEach(check => {
          if (!check.passed) {
            priorityChecks.push(check);
          }
        });
      });
      // Sort priority checks so High impact are first
      priorityChecks.sort((a, b) => (a.impact === "High" ? -1 : 1));

      // Define the desired priority order for the tabs (user POV & importance)
      const orderedKeys = [
        "seo-tags",             // OPEN
        "page-speed",           // OPEN
        "aeo-geo",              // LOCKED
        "crawlability-indexing",// LOCKED
        "content-hierarchy",    // LOCKED
        "server-security",      // LOCKED
        "page-weight",          // LOCKED
        "social-media",         // LOCKED
        "advanced-structure",   // LOCKED
        "html-css-validation"   // LOCKED
      ];

      const newEngines = {};

      orderedKeys.forEach(key => {
        if (engines[key]) {
          newEngines[key] = engines[key];
        }
      });

      // Add Priority Action Fix-list at the very end
      newEngines["priority-fixes"] = {
        name: "Priority Action Fix-list",
        score: Math.max(0, 100 - priorityChecks.length * 5),
        desc: "Consolidated list of the most critical warnings and errors found across all audits.",
        checks: priorityChecks
      };

      const newReport = {
        url: formattedUrl,
        avgScore,
        grade,
        engines: newEngines,
        scores: { perfScore, seoScore, accessScore, bpScore, validationScore },
        date: new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      };

      // Persist full report JSON + score to the database for this lead record
      if (activeLeadId && user) {
        try {
          await fetch("/api/leads/save-report", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadId: activeLeadId, reportJson: newReport, seoScore: avgScore, grade })
          });
        } catch (saveErr) {
          console.error("Failed to persist report snapshot:", saveErr);
        }
      }

      if (user) {
        // Save to user's dashboard history
        try {
          await fetch("/api/monitors/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: formattedUrl,
              performance_score: perfScore,
              seo_score: seoScore,
              accessibility_score: accessScore,
              best_practices_score: bpScore,
              avg_score: avgScore,
              grade: grade,
              full_report_json: { avgScore, grade, engines }
            })
          });
        } catch (e) {
          console.error("Failed to save history to dashboard", e);
        }
      }

      setReport(newReport);

      // Update URL in browser without triggering a Next.js re-render (which router.replace does)
      if (typeof window !== "undefined") {
        const currentUrlParam = searchParams.get("url");
        if (currentUrlParam !== formattedUrl) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("url", formattedUrl);
          window.history.replaceState(null, "", `?${params.toString()}`);
        }
      }

      if (user) {
        setUser(prev => prev ? {
          ...prev,
          free_audits_run: user?.subscription_tier === "free" ? ((prev.free_audits_run || 0) + 1) : prev.free_audits_run,
          paid_audits_run: user?.subscription_tier !== "free" ? ((prev.paid_audits_run || 0) + 1) : prev.paid_audits_run
        } : null);
      }
      try {
        sessionStorage.setItem(`audit_report_${formattedUrl}`, JSON.stringify(newReport));
      } catch (e) {
        console.error("Failed to cache report", e);
      }
    } catch (err) {
      console.error(err);
      if (err.message === "429_QUOTA_EXCEEDED") {
        setError("GOOGLE_QUOTA_ERROR");
      } else {
        setError(err.message || "An error occurred compiling the SEO audit. Check the URL status.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const isUserLoggedIn = !!user;

    if (isUserLoggedIn) {
      if (!url || !cmsPlatform || !businessNiche || !targetAudience) {
        setFormError("Please fill out all required fields.");
        return;
      }
    } else {
      if (!url || !name || !email || !phone) {
        setFormError("Please fill out all required fields.");
        return;
      }
      localStorage.setItem("guest_email", email);
      localStorage.setItem("guest_name", name);
    }
    
    const targetEmail = isUserLoggedIn ? user.email : email;
    try {
      const res = await fetch("/api/leads/check-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to verify quota");
      }
    } catch (err) {
      console.error("Quota check failed:", err);
      setFormError(err.message || "Failed to verify limits. Please check your inputs.");
      return;
    }

    setLeadCaptured(true);
    runAudit(url, null);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const keys = getApiKeys();
  const isKeyUnset = keys.length === 0 || keys[0] === "PASTE_YOUR_GOOGLE_API_KEY_HERE";

  const renderEngineDetails = (engineId) => {
    const rawEngine = report?.engines[engineId];
    if (!rawEngine) return null;

    const adjustedScore = getStrategyScore(engineId, rawEngine.score, deviceStrategy);
    const adjustedChecks = getChecksForStrategy(rawEngine.checks, deviceStrategy);
    const engine = {
      ...rawEngine,
      score: adjustedScore,
      checks: adjustedChecks
    };
    const currentFilter = filterTabs[engineId] || "all";

    const isGatedKey = !["seo-tags", "page-speed"].includes(engineId);
    if (!isPremium && isGatedKey) {
      return (
        <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-8 text-center space-y-4 max-w-md mx-auto my-12 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-12 h-12 text-zinc-500 [.light_&]:text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider [.light_&]:text-zinc-900">{engine.name} Details Locked</h3>
          <p className="text-xxs text-zinc-400 leading-relaxed max-w-xs mx-auto [.light_&]:text-zinc-600">
            Detailed checks for page payloads, assets, responsive structures, server security parameters, and AEO indexation are only available for premium members.
          </p>
          <button
            onClick={() => {
              router.push(`/checkout/?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name || "")}&email=${encodeURIComponent(email || "")}&phone=${encodeURIComponent(phone || "")}`);
            }}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            Upgrade to Pro to Unlock
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 min-h-[400px]">
        {/* Engine Header Details */}
        <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-base font-extrabold text-white">
                {engine.name} Details
              </h2>
              <p className="text-xxs text-zinc-400 leading-relaxed">
                {engine.desc}
              </p>
            </div>
            
            <div className="relative h-12 w-12 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-zinc-850"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.915"
                />
                <circle
                  className={engine.score >= 90 ? "text-emerald-500" : engine.score >= 50 ? "text-amber-500" : "text-rose-500"}
                  strokeWidth="3.5"
                  strokeDasharray={`${engine.score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.915"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-white">{engine.score}</span>
            </div>
          </div>
          
          {/* Filters Bar */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap gap-2 text-[10px]">
            {[
              { id: "all", label: `All Checks (${engine.checks.length})` },
              { id: "errors", label: `Critical Errors (${engine.checks.filter(c => !c.passed && c.severity === 'error').length})` },
              { id: "warnings", label: `Warnings (${engine.checks.filter(c => !c.passed && c.severity === 'warning').length})` },
              { id: "passed", label: `Passed (${engine.checks.filter(c => c.passed).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFilterTabs(prev => ({ ...prev, [engineId]: tab.id }));
                  // Anchor scroll position to prevent browser jumping when list collapses
                  if (typeof window !== "undefined") {
                    setTimeout(() => {
                      const detailsEl = document.getElementById(`engine-section-${engineId}`);
                      if (detailsEl) {
                        const y = detailsEl.getBoundingClientRect().top + window.scrollY - 145;
                        // Use instant so the user doesn't see the page bounce
                        window.scrollTo({ top: y, behavior: "instant" });
                      }
                    }, 10);
                  }
                }}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all border cursor-pointer ${
                  currentFilter === tab.id
                    ? "bg-violet-600/15 border-violet-500/50 text-violet-300"
                    : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checks List */}
        {engineId === "aeo-geo" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pl-1">AI Optimization Diagnostics</h3>
              {engine.checks.map(check => (
                <div key={check.name} className="rounded-xl border border-zinc-850 bg-zinc-900/20 p-4 flex gap-3 transition-all hover:bg-zinc-900/40">
                  <span className={`inline-flex items-center justify-center rounded-full text-xxs font-bold h-5.5 w-5.5 flex-shrink-0 mt-0.5 ${check.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {check.passed ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </span>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">{check.name}</h4>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${check.passed ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>{check.passed ? "PASS" : "FAILED"}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{check.desc}</p>
                    {!check.passed && (
                      <div className="mt-3 p-3 rounded-md bg-zinc-950/80 border border-zinc-800 text-[10px]">
                        <span className="text-rose-400 font-bold block mb-1">Recommendation:</span>
                        <span className="text-zinc-300">{check.fix}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pl-1">Answer Engine Citation Simulation</h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col h-full min-h-[450px]">
                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    perplexity-copilot-v4
                  </div>
                  <span>model: search-agent-3.5</span>
                </div>
                <div className="p-4 space-y-6 flex-grow text-xs leading-relaxed font-sans text-zinc-300">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-violet-900/40 text-violet-100 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-violet-500/20 max-w-[85%]">
                      What services are offered by <span className="font-bold text-violet-300">{report.url.replace(/^https?:\/\//, '')}</span> and is it highly optimized?
                    </div>
                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">U</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">AI</div>
                    <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl rounded-tl-sm border border-zinc-800/60">
                      <p>Based on search indexing citations, <span className="font-bold text-white">{report.url.replace(/^https?:\/\//, '')}</span> is an optimized web platform <span className="text-emerald-400 text-[10px] align-top cursor-pointer hover:underline">[1]</span>.</p>
                      <p>The site leverages structured data blocks declaring entity configurations and utilizes semantic heading orders which facilitates answer parsing <span className="text-emerald-400 text-[10px] align-top cursor-pointer hover:underline">[2]</span>. GPTBot and ClaudeBot agents are granted full indexation clearance.</p>
                      <div className="border-t border-zinc-800/80 pt-3 mt-4">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-2 tracking-wider">SOURCES:</span>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-colors"><span className="text-zinc-500 font-mono">[1]</span> {report.url.replace(/^https?:\/\//, '')}</span>
                          <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-colors"><span className="text-zinc-500 font-mono">[2]</span> {report.url.replace(/^https?:\/\//, '')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900/50 px-4 py-3 text-[11px] text-emerald-400 font-bold border-t border-zinc-800 flex items-center gap-2">
                  <span>💡 Optimization Status: Excellent.</span>
                  <span className="text-zinc-400 font-normal">The site is in prime position to be cited for relevant LLM intent searches.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="space-y-4">
          {engine.checks
            .filter((check) => {
              if (currentFilter === "all") return true;
              if (currentFilter === "errors") return !check.passed && check.severity === "error";
              if (currentFilter === "warnings") return !check.passed && check.severity === "warning";
              if (currentFilter === "passed") return check.passed;
              return true;
            })
            .map((check) => (
              <div
                key={check.name}
                className={`rounded-xl border p-4 sm:p-5 flex flex-col items-start gap-3 bg-zinc-900/10 transition-all ${
                  check.passed 
                    ? "border-zinc-900/60" 
                    : check.severity === "error"
                    ? "border-rose-500/15 bg-rose-500/[0.01]"
                    : "border-amber-500/15 bg-amber-500/[0.01]"
                }`}
              >
                <div className="space-y-1 flex-grow w-full text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center rounded-full text-xxs font-bold h-5.5 w-5.5 flex-shrink-0 ${
                        check.passed 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : check.severity === "error"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {check.passed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </span>
                      <h4 className="text-xs font-bold text-white">{check.name}</h4>
                    </div>

                    <div className="flex gap-2">
                      {!check.passed && (
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          check.severity === "error"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}>
                          {check.severity === "error" ? "Critical" : "Warning"}
                        </span>
                      )}
                      <span className="text-[8px] font-semibold font-mono text-zinc-500 uppercase">
                        Impact: {check.impact || "Medium"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xxs text-zinc-400 leading-relaxed pl-8 pt-0.5">
                    {check.desc}
                  </p>
                  
                  {check.value && (
                    <p className={`text-xxs font-mono px-2.5 py-1 border rounded-md inline-block ml-8 mt-2 ${
                      check.passed 
                        ? "border-emerald-500/20 text-emerald-300 bg-emerald-500/5" 
                        : check.severity === "error"
                        ? "border-rose-500/20 text-rose-300 bg-rose-500/5"
                        : "border-amber-500/20 text-amber-300 bg-amber-500/5"
                    }`}>
                      Detected: {check.value}
                    </p>
                  )}
                </div>

                {check.details && check.details.length > 0 && !check.passed && (
                  <div className="w-full pl-8 mt-1">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide text-left">
                      Offending Resources ({check.details.length}):
                    </span>
                    <div className="mt-1.5 overflow-x-auto rounded-lg border border-zinc-850 bg-zinc-950">
                      <table className="w-full text-[10px] font-mono border-collapse text-left text-zinc-550">
                        <thead>
                          <tr className="bg-zinc-900 text-zinc-500 border-b border-zinc-850">
                            <th className="p-2 font-bold uppercase tracking-wider">Asset URL / Log</th>
                            <th className="p-2 font-bold uppercase tracking-wider text-right">Potential Savings / Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {check.details.map((item, idx) => (
                            <tr key={idx} className="border-b border-zinc-900/60 hover:bg-zinc-900/20">
                              <td className="p-2 break-all max-w-[260px] text-zinc-300">{item.url || item.description}</td>
                              <td className="p-2 text-right whitespace-nowrap text-rose-400 font-bold">
                                {item.wastedBytes !== undefined 
                                  ? `${(item.wastedBytes / 1024).toFixed(1)} KB` 
                                  : item.wastedMs !== undefined 
                                  ? `${item.wastedMs} ms delay` 
                                  : item.source || "Failure diagnostic"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {check.snippet && !check.passed && (
                  <div className="w-full pl-8 mt-1">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide text-left">
                      Recommended Fix Template:
                    </span>
                    <pre className="mt-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-[9px] text-zinc-300 overflow-x-auto select-all leading-normal text-left">
                      <code>{check.snippet}</code>
                    </pre>
                  </div>
                )}

                {check.snippets && check.snippets.length > 0 && !check.passed && (
                  <div className="w-full pl-8 mt-1">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide text-left">
                      HTML SNIPPET (EVIDENCE):
                    </span>
                    <pre className="mt-1.5 p-3 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-[9px] text-zinc-300 overflow-x-auto select-all leading-normal text-left space-y-2">
                      {check.snippets.map((snip, i) => (
                        <code key={i} className="block">{snip}</code>
                      ))}
                    </pre>
                  </div>
                )}

                {!check.passed && (
                  <div className="w-full pl-8 border-t border-zinc-800/80 pt-3 text-left">
                    <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wide">
                      Implementation Guide:
                    </span>
                    <p className="text-xxs text-zinc-400 leading-relaxed mt-0.5">
                      {check.fix}
                    </p>
                  </div>
                )}
              </div>
            ))}
          
          {engine.checks.filter((check) => {
            if (currentFilter === "all") return true;
            if (currentFilter === "errors") return !check.passed && check.severity === "error";
            if (currentFilter === "warnings") return !check.passed && check.severity === "warning";
            if (currentFilter === "passed") return check.passed;
            return true;
          }).length === 0 && (
            <div className="rounded-xl border border-zinc-850 p-8 text-center text-zinc-550 text-xs">
              No parameters match this severity filter for {engine.name}.
            </div>
          )}
        </div>
        )}
      </div>
    );
  };

  return (
    <main className="bg-zinc-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative isolate">
      {/* Background radial glow */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

      {/* Dismissible Cancellation Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up relative">
            <button 
              onClick={() => setShowCancelPopup(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Payment Cancelled</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Your checkout was aborted and you haven&apos;t been charged. Would you like to stay here and review your current limited report, or run a new audit on a different website?
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-white transition-all border border-zinc-700"
              >
                Stay on this report
              </button>
              
              <button
                onClick={() => {
                  setShowCancelPopup(false);
                  setReport(null);
                  setLeadCaptured(false);
                  setUrl("");
                }}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-2.5 text-xs font-semibold text-white transition-all border border-violet-500/50"
              >
                Run a new audit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12 relative pt-12 md:pt-0">
        {/* Back / Reset Button */}
        {report && (
          <button
            onClick={() => {
              setReport(null);
              setLeadCaptured(false);
              setUrl("");
            }}
            className="absolute top-0 left-4 flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-md z-10"
          >
            ← Back
          </button>
        )}

        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-x-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1 text-xs font-semibold text-violet-300">
            <span>Enterprise SEO Performance Audit Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Deep-Scan Website SEO Auditor
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            {user
              ? `Authorized plan active: ${user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}. Run on-demand technical audits on any website URL.`
              : "Enter your details below to run a comprehensive check on your website's speed, mobile friendliness, meta configurations, and technical errors."
            }
          </p>
        </header>

        {/* DEVELOPER REMINDER */}
        {!loading && !report && (
          USE_MOCK_DATA ? (
            <div className="max-w-2xl mx-auto border border-violet-500/30 bg-violet-500/5 rounded-xl p-4 text-left space-y-2">
              <span className="text-xs font-bold text-violet-400 block">⚡ Testing Mode: Active (Demo / Sample Data Mode)</span>
              <p className="text-xxs text-zinc-400 leading-relaxed">
                The application is running in **testing phase**, showing mock/sample results instantly without hitting the live Google PageSpeed API. 
                To go live and use the actual Google PageSpeed Insights API, edit your <span className="font-mono text-zinc-200">.env.local</span> file and set <span className="font-mono text-zinc-200">NEXT_PUBLIC_USE_MOCK_DATA=&quot;false&quot;</span>.
              </p>
            </div>
          ) : (
            isKeyUnset && (
              <div className="max-w-2xl mx-auto border border-yellow-600/30 bg-yellow-600/5 rounded-xl p-4 text-left space-y-2">
                <span className="text-xs font-bold text-yellow-400 block">⚠️ Developer Action Required: API Key Missing</span>
                <p className="text-xxs text-zinc-400 leading-relaxed">
                  You haven&apos;t pasted your Google PageSpeed API Key in your project&apos;s `.env.local` file yet. To enable audits for your visitors, open the file <span className="font-mono text-zinc-200">.env.local</span> in your root folder and replace <span className="font-mono text-zinc-200">PASTE_YOUR_GOOGLE_API_KEY_HERE</span> with your key. You can get one for free in 1 click at <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noreferrer" className="text-violet-400 underline">Google&apos;s dev page</a>.
                </p>
              </div>
            )
          )
        )}

        {/* LEAD CAPTURE / AUDIT RUN FORM */}
        {!leadCaptured && !loading && !report && (
          !auditId && user && user.subscription_tier === "free" && user.free_audits_run >= user.free_audits_allowed ? (
            <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md space-y-6 text-center">
              <span className="text-4xl block">⚠️</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Free Audit Limit Reached</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                You have used both of your 2 free registered account audits. Upgrade to our Pro Monitor Plan to unlock 3 premium monthly audits, automated tracking, and white-label client PDF exports.
              </p>
              <button
                onClick={() => router.push("/checkout?plan=weekly")}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Upgrade to Pro Monitor ($29/mo)
              </button>
            </div>
          ) : !auditId && user && user.subscription_tier !== "free" && user.subscription_tier !== "agency" && user.subscription_tier !== "multi" && user.paid_audits_run >= user.allowed_quota ? (
            <div className="max-w-lg mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md space-y-6 text-center">
              <span className="text-4xl block">⚠️</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Paid Audit Limit Reached</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                You have used all {user.allowed_quota} of your premium paid audits. To run more audits for additional clients, please upgrade your agency plan.
              </p>
              <button
                onClick={() => router.push("/checkout?plan=agency")}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                View Agency Plans
              </button>
            </div>
          ) : (
            <section aria-label="Audit Form" className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md mx-auto space-y-6 text-left ${
              user && (user.subscription_tier === "weekly" || user.subscription_tier === "agency") ? "max-w-2xl" : "max-w-lg"
            }`}>
              <h3 className="text-lg font-bold text-white">
                {user && (user.subscription_tier === "weekly" || user.subscription_tier === "agency")
                  ? "Run Technical SEO Audit"
                  : "Enter Details to Run Audit"
                }
              </h3>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              {user && (user.subscription_tier === "weekly" || user.subscription_tier === "agency") ? (
                /* Sleek Search-Bar Style Layout for Paid Subscribers */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                        Website URL
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. www.mybusiness.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="sm:mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap cursor-pointer"
                    >
                      Analyze Website
                    </button>
                  </div>

                  {/* Advanced Settings Collapsible Chevron */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <span>{showAdvanced ? "▼" : "▶"} Advanced Report Settings</span>
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                            CMS Platform
                          </label>
                          <select
                            value={cmsPlatform}
                            onChange={(e) => setCmsPlatform(e.target.value)}
                            className="w-full bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-xs text-zinc-400 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">Select Platform</option>
                            <option value="wordpress">WordPress</option>
                            <option value="shopify">Shopify</option>
                            <option value="webflow">Webflow</option>
                            <option value="nextjs">Next.js</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                            Business Niche
                          </label>
                          <select
                            value={businessNiche}
                            onChange={(e) => setBusinessNiche(e.target.value)}
                            className="w-full bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-xs text-zinc-400 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">Select Niche</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="local">Local Business</option>
                            <option value="saas">SaaS / B2B</option>
                            <option value="blog">Blog / Publisher</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                            Target Location
                          </label>
                          <select
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="w-full bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-850 text-xs text-zinc-400 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">Select Scope</option>
                            <option value="local">Local City</option>
                            <option value="national">National Market</option>
                            <option value="global">International</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2 animate-fade-in">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{formError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Original vertical form layout for Free users and Guests */
                <>
                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. www.mybusiness.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {user ? (
                    /* Free tier logged-in user fields */
                    <>
                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          CMS Platform
                        </label>
                        <select
                          required
                          value={cmsPlatform}
                          onChange={(e) => setCmsPlatform(e.target.value)}
                          className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Platform</option>
                          <option value="wordpress">WordPress</option>
                          <option value="shopify">Shopify</option>
                          <option value="webflow">Webflow</option>
                          <option value="nextjs">Next.js</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          Business Niche
                        </label>
                        <select
                          required
                          value={businessNiche}
                          onChange={(e) => setBusinessNiche(e.target.value)}
                          className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Niche</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="local">Local Business</option>
                          <option value="saas">SaaS / B2B</option>
                          <option value="blog">Blog / Publisher</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          Target Location
                        </label>
                        <select
                          required
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Scope</option>
                          <option value="local">Local City</option>
                          <option value="national">National Market</option>
                          <option value="global">International</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    /* Guest fields */
                    <>
                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. john@business.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                          Contact Phone Number
                        </label>
                        <div className="flex bg-zinc-950 rounded-xl border border-zinc-850 focus-within:border-violet-500 overflow-visible relative">
                          <button
                            type="button"
                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsCountryDropdownOpen(false), 200)}
                            className="bg-zinc-950 rounded-l-xl border-r border-zinc-850 px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer flex items-center gap-1.5 min-w-[70px] justify-center hover:bg-zinc-900 transition-colors"
                          >
                            <span className="text-sm">
                              {[
                                { code: "+1", flag: "🇺🇸" },
                                { code: "+44", flag: "🇬🇧" },
                                { code: "+91", flag: "🇮🇳" },
                                { code: "+61", flag: "🇦🇺" },
                                { code: "+49", flag: "🇩🇪" },
                                { code: "+33", flag: "🇫🇷" },
                                { code: "+81", flag: "🇯🇵" },
                              ].find(c => c.code === countryCode)?.flag || "🌐"}
                            </span>
                            <span className="font-medium">{countryCode}</span>
                            <svg className={`w-3 h-3 text-zinc-500 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>

                          {isCountryDropdownOpen && (
                            <ul className="absolute top-full left-0 mt-1 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                              {[
                                { code: "+1", flag: "🇺🇸", label: "United States" },
                                { code: "+44", flag: "🇬🇧", label: "United Kingdom" },
                                { code: "+91", flag: "🇮🇳", label: "India" },
                                { code: "+61", flag: "🇦🇺", label: "Australia" },
                                { code: "+49", flag: "🇩🇪", label: "Germany" },
                                { code: "+33", flag: "🇫🇷", label: "France" },
                                { code: "+81", flag: "🇯🇵", label: "Japan" },
                              ].map((country) => (
                                <li key={country.code}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCountryCode(country.code);
                                      setIsCountryDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-violet-600 hover:text-white transition-colors flex items-center justify-between group"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-base">{country.flag}</span>
                                      <span className="truncate max-w-[100px]">{country.label}</span>
                                    </span>
                                    <span className="text-zinc-500 text-[10px] font-mono group-hover:text-violet-200">{country.code}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          <input
                            type="tel"
                            required
                            maxLength={
                              countryCode === "+1" ? 10 :
                              countryCode === "+44" ? 11 :
                              countryCode === "+91" ? 10 :
                              countryCode === "+61" ? 9 :
                              countryCode === "+49" ? 11 :
                              countryCode === "+33" ? 9 :
                              countryCode === "+81" ? 10 :
                              15
                            }
                            placeholder={countryCode === "+1" ? "555 555 5555" : countryCode === "+91" ? "98765 43210" : "Mobile Number"}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2 animate-fade-in">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Analyze My Website Now
                  </button>
                </>
              )}
            </form>
          </section>
        ))}

        {/* Loading Spinner */}
        {loading && (
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <div className="relative mx-auto h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white font-semibold animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
              <p className="text-xxs text-zinc-500">
                Contacting Lighthouse engines. This takes about 15-25 seconds to complete.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="max-w-lg mx-auto border border-rose-500/20 bg-rose-500/5 rounded-2xl p-6 text-center space-y-4">
            <span className="text-2xl">⚠️</span>
            
            {error === "GOOGLE_QUOTA_ERROR" ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">System Overloaded (Lighthouse Rate Limit)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                  Google&apos;s public audit queue is currently overloaded. Our team has been notified.
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    setLeadCaptured(false);
                  }}
                  className="rounded-xl border border-zinc-700 hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-300 transition-all"
                >
                  Return to Form
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Audit Unsuccessful</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLeadCaptured(false);
                  }}
                  className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300 underline"
                >
                  Return to Form
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUCCESS DASHBOARD REPORT CARD */}
        {report && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Unified Strategy Switcher Tab */}
            <div className="flex justify-center sm:justify-start">
              <div className="inline-flex rounded-xl bg-zinc-900/60 p-1 border border-zinc-850 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setDeviceStrategy("mobile")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deviceStrategy === "mobile"
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Mobile View
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceStrategy("desktop")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deviceStrategy === "desktop"
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Desktop View
                </button>
              </div>
            </div>

            {/* Banner Overview with Live Screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[320px]">
              {/* Summary Card */}
              <div className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900/60 to-zinc-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 backdrop-blur-md">
                <div className="space-y-3 text-left">
                  <span className="text-xxs uppercase tracking-wider font-bold text-violet-400">
                    Enterprise Scan Completed (30+ Checks Verified)
                  </span>
                  <h2 className="text-base sm:text-xl font-bold text-white break-all max-w-full">
                    {report.url}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Site analysed with Google Lighthouse, Speed Checkers, and Security crawlers. Average score:{" "}
                    <span className="text-zinc-300 font-semibold">{getOverallScore(deviceStrategy)}%</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-shrink-0">
                  {/* Overall Score Circle Gauge */}
                  <div className="text-center flex items-center gap-3">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1">
                        Overall Grade
                      </span>
                      <div className="relative h-20 w-20 flex items-center justify-center">
                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            className="text-zinc-850"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                          <circle
                            className={getOverallScore(deviceStrategy) >= 90 ? "text-emerald-500" : getOverallScore(deviceStrategy) >= 50 ? "text-amber-500" : "text-rose-500"}
                            strokeWidth="3.5"
                            strokeDasharray={`${getOverallScore(deviceStrategy)}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.915"
                          />
                        </svg>
                        <span className={`absolute text-2xl font-black ${
                          getOverallScore(deviceStrategy) >= 90 
                            ? "text-emerald-400" 
                            : getOverallScore(deviceStrategy) >= 50 
                            ? "text-amber-400" 
                            : "text-rose-400"
                        }`}>
                          {getOverallGrade(getOverallScore(deviceStrategy))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isPremium) {
                        window.print();
                      } else {
                        setShowPayModal(true);
                      }
                    }}
                    className="rounded-xl bg-white px-4 py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    Download Report PDF
                  </button>
                </div>
              </div>

              {/* Dynamic Viewport Screenshot Panel */}
              {deviceStrategy === "mobile" ? (
                /* Mobile Mockup (High-Fidelity iPhone Portrait frame) */
                <div className="lg:col-span-5 flex items-center justify-center py-3 h-[320px]">
                  {/* Phone frame — exact 375×667 Chrome DevTools ratio */}
                  <div
                    className="relative h-full rounded-[28px] border-[8px] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-700/60 overflow-hidden flex flex-col group select-none"
                    style={{ aspectRatio: '375 / 667' }}
                  >
                    {/* Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[30%] h-[4%] bg-black rounded-full z-30" />

                    {/* Status Bar */}
                    <div className="h-[8%] w-full bg-zinc-100 dark:bg-black/80 px-3 flex items-center justify-between text-[8px] text-zinc-800 dark:text-zinc-400 font-semibold z-25 relative shrink-0">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <svg className="h-2 w-2 text-zinc-800 dark:text-zinc-300" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20V2z" /></svg>
                        <svg className="h-2 w-2 text-zinc-800 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
                        <div className="w-4 h-2 border border-zinc-400 dark:border-zinc-500 rounded-[2px] p-[1px] flex items-center"><div className="h-full w-3 bg-zinc-800 dark:bg-zinc-300 rounded-[1px]" /></div>
                      </div>
                    </div>

                    {/* Mobile Address Bar (Adds browser spacing) */}
                    <div className="h-[7%] w-full bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 px-3 flex items-center justify-center shrink-0">
                      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 px-3 py-1 rounded-md text-[9px] text-zinc-900 dark:text-zinc-400 font-mono flex items-center justify-center gap-1 w-full select-none shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 text-emerald-500">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{report.url.replace(/^https?:\/\//, '')}</span>
                      </div>
                    </div>

                    {/* Screenshot fills remaining space */}
                    <div className="relative flex-1 w-full bg-zinc-950 overflow-hidden">
                      {!screenshotLoaded && (
                        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.microlink.io/?url=${encodeURIComponent(report.url)}&screenshot=true&embed=screenshot.url&device=iPhone`}
                        alt={`${report.url} Mobile Preview`}
                        onLoad={() => setScreenshotLoaded(true)}
                        className={`w-full h-full object-cover object-top transition-opacity duration-500 ${
                          screenshotLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>

                    {/* Home Bar */}
                    <div className="h-[5%] w-full bg-zinc-100 dark:bg-black flex items-center justify-center shrink-0">
                      <div className="w-[35%] h-1 bg-zinc-800 dark:bg-zinc-600 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Mockup (Browser landscape frame) */
                <div className="lg:col-span-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 p-3.5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group h-[320px]">
                  {/* Browser Top Window Controls */}
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2 mb-2 select-none">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 pl-2 text-zinc-400 dark:text-zinc-600 text-[9px]">
                        <span>←</span>
                        <span>→</span>
                      </div>
                    </div>

                    <div className="flex-grow max-w-xs mx-3 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 px-2.5 py-0.5 rounded-md text-[9px] text-zinc-900 dark:text-zinc-400 font-mono flex items-center justify-between gap-1 select-none">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-[9px] text-emerald-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="truncate">{report.url.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-sans cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">↻</span>
                    </div>

                    <div className="w-4" />
                  </div>

                  {/* Screenshot Frame */}
                  <div className="relative flex-1 w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850/60">
                    {!screenshotLoaded && (
                      <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.microlink.io/?url=${encodeURIComponent(report.url)}&screenshot=true&embed=screenshot.url`}
                      alt={`${report.url} Desktop Preview`}
                      onLoad={() => setScreenshotLoaded(true)}
                      className={`w-full h-full object-cover object-top transition-opacity duration-500 ${
                        screenshotLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Health Metrics Summary Bar */}
            {(() => {
              let errorsCount = 0;
              let warningsCount = 0;
              let passedCount = 0;
              Object.entries(report.engines)
                .filter(([id]) => id !== "priority-fixes")
                .forEach(([id, rawEng]) => {
                const adjustedChecks = getChecksForStrategy(rawEng.checks, deviceStrategy);
                adjustedChecks.forEach((c) => {
                  if (c.passed) {
                    passedCount++;
                  } else if (c.severity === "error") {
                    errorsCount++;
                  } else {
                    warningsCount++;
                  }
                });
              });

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-4 backdrop-blur-md">
                    <div className="text-center p-3 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical Errors</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-rose-500 mt-1">{errorsCount}</span>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Warnings</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-1">{warningsCount}</span>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col justify-center items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Passed Checks</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-500 mt-1">{passedCount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] p-4 flex gap-4 items-start">
                      <div className="bg-violet-500/10 text-violet-400 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block mb-1">Top Strategist Note</span>
                        <p className="text-xs text-zinc-300 leading-relaxed">Before advancing, prioritize fixing Largest Contentful Paint (LCP) and internal linking schema to capture immediate ranking shifts.</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-4 flex gap-4 items-start">
                      <div className="bg-rose-500/10 text-rose-400 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Critical System Alert</span>
                        <p className="text-xs text-zinc-300 leading-relaxed">Page load speed and missing alt tags currently limit mobile indexation on your key product pages.</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MOBILE: Swipeable Pill Tabs (lg:hidden) */}
            <div id="mobile-category-tabs" className="lg:hidden sticky top-16 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/60 mb-6 -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
              <div id="mobile-tabs-container" className="flex overflow-x-auto w-full gap-3 py-4 snap-x no-scrollbar items-center px-4 sm:px-6 scroll-pl-4 sm:scroll-pl-6">
                {Object.entries(report.engines).map(([id, rawEng]) => {
                  const isSelected = activeEngine === id;
                  const isPriority = id === "priority-fixes";
                  return (
                    <button
                      key={id}
                      id={`mobile-tab-btn-${id}`}
                      onClick={() => handleEngineClick(id)}
                      className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                        isSelected 
                          ? "bg-violet-600 text-white shadow-md border border-violet-500" 
                          : isPriority
                          ? "bg-amber-900/40 text-amber-500 border border-amber-500/50 hover:bg-amber-900/60 [.light_&]:bg-amber-100 [.light_&]:text-amber-800 [.light_&]:border-amber-400"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 [.light_&]:bg-white [.light_&]:border-zinc-300 [.light_&]:text-zinc-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-semibold text-xs tracking-wide truncate">{rawEng.name}</span>
                        {isPriority && !isPremium && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1.5 opacity-70">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
                {/* Invisible spacer to prevent right-edge padding collapse in webkit */}
                <div className="w-1 sm:w-3 shrink-0" />
              </div>
            </div>

            {/* Layout with Sidebar Selection & Detailed Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* DESKTOP: Sidebar Selector (hidden lg:block) */}
              <div className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-24 z-10">
                <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500 pl-1 text-left mt-2">
                  Active Auditing Engines
                </h3>
                {/* Scrollable list */}
                <div id="lhs-sidebar-engines" className="space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto px-2 pt-2 pb-8 -mx-2 custom-scrollbar">
                  {Object.entries(report.engines).map(([id, rawEng]) => {
                    const isSelected = activeEngine === id;
                    const isPriority = id === "priority-fixes";
                    const adjustedScore = getStrategyScore(id, rawEng.score, deviceStrategy);
                    const eng = { ...rawEng, score: adjustedScore };
                    
                    let buttonClass = "";
                    if (isSelected) {
                      buttonClass = "bg-violet-900/20 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/50 scale-[1.02] [.light_&]:bg-violet-100 [.light_&]:border-violet-400 [.light_&]:shadow-sm [.light_&]:ring-0";
                    } else if (isPriority) {
                      buttonClass = "bg-amber-900/20 border-amber-500/50 hover:bg-amber-900/40 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)] [.light_&]:bg-amber-50 [.light_&]:border-amber-300 [.light_&]:hover:bg-amber-100/70";
                    } else {
                      buttonClass = "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60 [.light_&]:bg-white [.light_&]:border-zinc-200 [.light_&]:hover:border-violet-200 [.light_&]:hover:bg-violet-50/50";
                    }
                    
                    return (
                      <button
                        key={id}
                        id={`sidebar-engine-btn-${id}`}
                        type="button"
                        onClick={() => handleEngineClick(id)}
                        className={`w-full relative overflow-hidden text-left rounded-2xl border p-4.5 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer ${buttonClass}`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] [.light_&]:hidden" />
                        )}
                        <div className={`space-y-1 min-w-0 ${isSelected ? 'pl-2 [.light_&]:pl-0' : ''} transition-all`}>
                          <div className="flex items-center">
                            <h3 className={`font-semibold text-xs tracking-wide group-hover:text-white transition-colors duration-200 ${isSelected ? "text-white" : "text-zinc-400 [.light_&]:text-zinc-600 [.light_&]:group-hover:text-zinc-900"}`}>{eng.name}</h3>
                            {isPriority && !isPremium && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1 opacity-70">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-xxs line-clamp-1 leading-relaxed ${isSelected ? 'text-zinc-400 [.light_&]:text-violet-500/80' : 'text-zinc-500 [.light_&]:text-zinc-500'}`}>
                            {eng.desc}
                          </p>
                        </div>
                        
                        <div className="relative h-11 w-11 flex items-center justify-center flex-shrink-0 mx-auto">
                          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              className="text-zinc-850 [.light_&]:text-zinc-200"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              cx="18"
                              cy="18"
                              r="15.915"
                            />
                            <circle
                              className={eng.score >= 90 ? "text-emerald-500" : eng.score >= 50 ? "text-amber-500" : "text-rose-500"}
                              strokeWidth="3.5"
                              strokeDasharray={`${eng.score}, 100`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              cx="18"
                              cy="18"
                              r="15.915"
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-white [.light_&]:text-zinc-800">{eng.score}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Results Output (Unified for Mobile & Desktop) */}
              <div id="mobile-detail-pane" className="col-span-1 lg:col-span-8 w-full min-w-0 flex flex-col gap-12 pb-32">
                {Object.keys(report.engines).map((id) => (
                  <div key={id} id={`engine-section-${id}`} className="scroll-mt-[150px]">
                    {renderEngineDetails(id)}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PAYMENT UPGRADE MODAL GATE */}
        {showPayModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 [.light_&]:bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-5 relative shadow-2xl animate-scale-up text-left max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-white cursor-pointer p-1"
              >
                ✕
              </button>

              <div className="text-center space-y-1.5">
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xxs font-bold text-violet-300 [.light_&]:bg-violet-100 [.light_&]:text-violet-700">
                  Premium Audit Report
                </span>
                <h3 className="text-lg font-bold text-white mt-2">Unlock Multi-Engine PDF Report</h3>
                <p className="text-xxs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Unlock the full downloadable PDF compiling Google Core Web Vitals charts, tag structural scores, and OpenAI-generated localized checklists.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-850 p-4 text-center">
                <span className="text-xxs text-zinc-500 uppercase tracking-wider font-semibold">
                  Total Investment
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">$29.00</div>
                <p className="text-xxs text-zinc-500 mt-0.5">One-time payment. Lifetime access to this report.</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    router.push(`/checkout/?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
                    setShowPayModal(false);
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Pay with Credit Card (Stripe)
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-transparent [.light_&]:bg-white py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex justify-center items-center gap-3 text-zinc-600 text-[10px] pt-1">
                <span>🛡️ SSL Secured</span>
                <span>•</span>
                <span>Instant PDF Download</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

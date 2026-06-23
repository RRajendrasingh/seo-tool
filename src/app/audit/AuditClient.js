/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMockLighthouseResult } from "../../utils/mockPageSpeed";
import { addLead, updateLead } from "@/utils/leadsStore";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
const FALLBACK_API_KEY = ""; 

export default function AuditClient({ initialUser = null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUrl = searchParams.get("url") || "";
  const initialPlan = searchParams.get("plan") || "";

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
  const [activeEngine, setActiveEngine] = useState("seo-tags");
  const [filterTab, setFilterTab] = useState("all");
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

  const isPremium = user?.subscription_tier === "weekly" || user?.subscription_tier === "agency" || (user?.allowed_quota && user?.allowed_quota > 0) || (typeof window !== "undefined" && (() => {
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

  const getApiKey = () => {
    return process.env.NEXT_PUBLIC_GOOGLE_API_KEY || FALLBACK_API_KEY || "";
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
  }, [initialUrl]);

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

  const runAudit = async (targetUrl, leadId = null) => {
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
        const activeKey = getApiKey();
        
        let apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
          formattedUrl
        )}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile`;
        
        if (activeKey && activeKey !== "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
          apiEndpoint += `&key=${activeKey}`;
        }

        const res = await fetch(apiEndpoint);
        
        if (res.status === 429) {
          throw new Error("429_QUOTA_EXCEEDED");
        }
        
        if (!res.ok) {
          throw new Error("Unable to contact Google Lighthouse servers. Verify the URL is public and try again.");
        }

        data = await res.json();
      }

      if (data.error) {
        if (data.error.code === 429) {
          throw new Error("429_QUOTA_EXCEEDED");
        }
        throw new Error(data.error.message || "Google API returned an error.");
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

      const avgScore = Math.round((perfScore + seoScore + accessScore + bpScore + validationScore) / 5);
      let grade = "F";
      if (avgScore >= 90) grade = "A";
      else if (avgScore >= 80) grade = "B";
      else if (avgScore >= 70) grade = "C";
      else if (avgScore >= 50) grade = "D";

      const activeLeadId = leadId || currentLeadId;
      if (activeLeadId) {
        updateLead(activeLeadId, {
          seoScore: avgScore,
          grade: grade,
          notes: `Website audit completed successfully. Scores - On-Page SEO: ${seoScore}%, Web Vitals: ${perfScore}%, Payload Code: ${Math.round((perfScore + bpScore) / 2)}%, Mobile/Structure: ${accessScore}%, Server/Security: ${bpScore}%, AEO/GEO: ${Math.round((seoScore + accessScore) / 2)}%, HTML/CSS Quality: ${validationScore}%.`,
        });
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

      const newReport = {
        url: formattedUrl,
        avgScore,
        grade,
        engines,
        scores: { perfScore, seoScore, accessScore, bpScore, validationScore },
        date: new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      };

      setReport(newReport);
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
  };

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
    }
    
    let leadId = null;
    try {
      const leadNotes = isUserLoggedIn
        ? `CMS Platform: ${cmsPlatform}, Business Niche: ${businessNiche}, Target Location: ${targetAudience}. (Logged in user SEO audit)`
        : "Guest user SEO audit";

      const newLead = await addLead({
        name: isUserLoggedIn ? (user.full_name || user.name || "Logged In User") : name,
        email: isUserLoggedIn ? user.email : email,
        phone: isUserLoggedIn ? "N/A" : `${countryCode} ${phone}`,
        website: url,
        status: "New",
        packageRequest: initialPlan === "premium" ? "Premium Report" : "Free Audit",
        seoScore: 0,
        grade: "Pending",
        notes: leadNotes
      });
      leadId = newLead.id;
      setCurrentLeadId(leadId);
    } catch (err) {
      console.error("Failed to save lead:", err);
      setFormError(err.message || "Failed to submit. Please check your inputs.");
      return;
    }

    setLeadCaptured(true);
    runAudit(url, leadId);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const activeKey = getApiKey();
  const isKeyUnset = !activeKey || activeKey === "PASTE_YOUR_GOOGLE_API_KEY_HERE";

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

    const isGatedKey = !["seo-tags", "page-speed"].includes(engineId);
    if (!isPremium && isGatedKey) {
      return (
        <div className="rounded-2xl border border-zinc-850 bg-zinc-900/10 p-8 text-center space-y-4 max-w-md mx-auto my-6 flex flex-col items-center justify-center min-h-[350px]">
          <span className="text-3xl">🔒</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{engine.name} Details Locked</h3>
          <p className="text-xxs text-zinc-400 leading-relaxed max-w-xs mx-auto">
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
                onClick={() => setFilterTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all border cursor-pointer ${
                  filterTab === tab.id
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
        <div className="space-y-4">
          {engine.checks
            .filter((check) => {
              if (filterTab === "all") return true;
              if (filterTab === "errors") return !check.passed && check.severity === "error";
              if (filterTab === "warnings") return !check.passed && check.severity === "warning";
              if (filterTab === "passed") return check.passed;
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
                        {check.passed ? "✓" : "✗"}
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
            if (filterTab === "all") return true;
            if (filterTab === "errors") return !check.passed && check.severity === "error";
            if (filterTab === "warnings") return !check.passed && check.severity === "warning";
            if (filterTab === "passed") return check.passed;
            return true;
          }).length === 0 && (
            <div className="rounded-xl border border-zinc-850 p-8 text-center text-zinc-550 text-xs">
              No parameters match this severity filter for {engine.name}.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-zinc-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative isolate overflow-x-hidden">
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
            className="absolute top-0 left-4 flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-all bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded-xl backdrop-blur-md z-10"
          >
            ← Back
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
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
        </div>

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
          <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md mx-auto space-y-6 text-left ${
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
          </div>
        )}

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Summary Card */}
              <div className="lg:col-span-8 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900/60 to-zinc-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 backdrop-blur-md">
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
                        window.open(`/audit/report/?url=${encodeURIComponent(report.url)}`, '_blank');
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
                <div className="lg:col-span-4 flex items-center justify-center p-2">
                  <div className="relative w-[230px] aspect-[9/18.5] rounded-[38px] border-[10px] border-zinc-900 bg-zinc-950 shadow-2xl ring-1 ring-zinc-800/80 overflow-hidden flex flex-col group select-none">
                    {/* iPhone Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-black rounded-full z-30 flex items-center justify-center" />

                    {/* iOS Status Bar */}
                    <div className="h-7 w-full bg-black/60 px-5 flex items-center justify-between text-[9px] text-zinc-400 font-semibold select-none z-25 relative shrink-0 pt-1 border-b border-zinc-900/40">
                      <span>9:41</span>
                      <div className="w-14 h-3" />
                      <div className="flex items-center gap-1 scale-[0.85] origin-right">
                        {/* Signal */}
                        <svg className="h-2.5 w-2.5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2 22h20V2z" />
                        </svg>
                        {/* Wifi */}
                        <svg className="h-2.5 w-2.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 00-7.743-3.486m15.486 0A6 6 0 0012 18.75m0 0a3.75 3.75 0 01-4.84-2.18m9.68 0A3.75 3.75 0 0112 18.75m0-11.25a11.25 11.25 0 00-14.516 6.536m29.032 0A11.25 11.25 0 0012 7.5z" />
                        </svg>
                        {/* Battery */}
                        <div className="w-4.5 h-2.5 border border-zinc-500 rounded-[2px] p-[1px] flex items-center">
                          <div className="h-full w-3 bg-zinc-400 rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Container */}
                    <div className="relative flex-1 w-full bg-zinc-950 overflow-hidden">
                      {!screenshotLoaded && (
                        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                          <div className="text-[10px] text-zinc-500 font-medium flex flex-col items-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5 text-violet-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Loading Mobile...</span>
                          </div>
                        </div>
                      )}
                      <img
                        src={`https://api.microlink.io/?url=${encodeURIComponent(report.url)}&screenshot=true&embed=screenshot.url&device=iPhone`}
                        alt={`${report.url} Mobile Preview`}
                        onLoad={() => setScreenshotLoaded(true)}
                        className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                          screenshotLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>

                    {/* iOS Bottom Home Indicator Bar */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-700 rounded-full z-35" />
                  </div>
                </div>
              ) : (
                /* Desktop Mockup (Browser landscape frame) */
                <div className="lg:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900/10 p-3.5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
                  {/* Browser Top Window Controls */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 select-none">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500/80 block" />
                        <span className="w-2 h-2 rounded-full bg-amber-500/80 block" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80 block" />
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 pl-2 text-zinc-600 text-[9px]">
                        <span>←</span>
                        <span>→</span>
                      </div>
                    </div>

                    <div className="flex-grow max-w-xs mx-3 bg-zinc-950/60 border border-zinc-850 px-2.5 py-0.5 rounded-md text-[9px] text-zinc-500 font-mono flex items-center justify-between gap-1 select-none">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-[9px] text-emerald-500">🔒</span>
                        <span className="truncate">{report.url.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <span className="text-[9px] text-zinc-650 font-sans cursor-pointer hover:text-zinc-400">↻</span>
                    </div>

                    <div className="w-4" />
                  </div>

                  {/* Screenshot Image Container */}
                  <div className="relative aspect-[16/10.5] w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850/60">
                    {!screenshotLoaded && (
                      <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                        <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-2">
                          <svg className="animate-spin h-3.5 w-3.5 text-violet-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating Desktop...
                        </div>
                      </div>
                    )}
                    <img
                      src={`https://api.microlink.io/?url=${encodeURIComponent(report.url)}&screenshot=true&embed=screenshot.url`}
                      alt={`${report.url} Desktop Preview`}
                      onLoad={() => setScreenshotLoaded(true)}
                      className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                        screenshotLoaded ? "opacity-100" : "opacity-0"
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
              Object.entries(report.engines).forEach(([id, rawEng]) => {
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
              );
            })()}

            {/* Layout with Sidebar Selection & Detailed Outputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sidebar Selector: 7 Engines */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500 pl-1 text-left">
                  Active Auditing Engines
                </h3>
                <div className="space-y-4 lg:space-y-3">
                  {Object.entries(report.engines).map(([id, rawEng]) => {
                    const isSelected = activeEngine === id;
                    const adjustedScore = getStrategyScore(id, rawEng.score, deviceStrategy);
                    const eng = {
                      ...rawEng,
                      score: adjustedScore
                    };
                    return (
                      <div key={id} id={`engine-accordion-${id}`} className="w-full scroll-mt-24">
                        <button
                          type="button"
                          onClick={() => {
                            // On mobile, allow toggling the accordion closed
                            if (typeof window !== "undefined" && window.innerWidth < 1024) {
                              if (activeEngine === id) {
                                setActiveEngine(null); // Close it
                                return;
                              }
                            }
                            
                            setActiveEngine(id);
                            setFilterTab("all");

                            // Smooth scroll the accordion to the top of the viewport on mobile
                            if (typeof window !== "undefined" && window.innerWidth < 1024) {
                              setTimeout(() => {
                                document.getElementById(`engine-accordion-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }, 250); // wait for previous accordion to collapse
                            }
                          }}
                        className={`w-full text-left rounded-2xl border p-4.5 transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-violet-500/50 shadow-md shadow-violet-500/2"
                            : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-bold text-white">{eng.name}</h4>
                          <p className="text-xxs text-zinc-500 line-clamp-1 leading-relaxed">
                            {eng.desc}
                          </p>
                        </div>
                        
                        <div className="relative h-11 w-11 flex items-center justify-center flex-shrink-0 mx-auto">
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
                          <span className="absolute text-[10px] font-black text-white">{eng.score}</span>
                        </div>
                      </button>
                      
                      {/* Mobile Accordion Details */}
                      <div 
                        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                          isSelected 
                            ? 'max-h-[5000px] opacity-100 mt-4 mb-8' 
                            : 'max-h-0 opacity-0 mt-0 mb-0'
                        }`}
                      >
                        {isSelected && renderEngineDetails(id)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Results Output (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-8">
              {renderEngineDetails(activeEngine)}
            </div>
          </div>

          {/* Back Button */}
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setReport(null);
                  setLeadCaptured(false);
                  setUrl("");
                  setName("");
                  setEmail("");
                  setPhone("");
                }}
                className="rounded-xl border border-zinc-850 hover:bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                ← Audit Another Website
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT UPGRADE MODAL GATE */}
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6 relative shadow-2xl animate-scale-up text-left">
              <button
                onClick={() => setShowPayModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xxs font-bold text-violet-300">
                  Premium Audit Report
                </span>
                <h3 className="text-lg font-bold text-white">Unlock Multi-Engine PDF Report</h3>
                <p className="text-xxs text-zinc-400 max-w-xs mx-auto">
                  Unlock the full downloadable PDF compiling Google Core Web Vitals charts, tag structural scores, and OpenAI-generated localized checklists.
                </p>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-850 p-4 text-center">
                <span className="text-xxs text-zinc-500 uppercase tracking-wider font-semibold">
                  Total Investment
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">$29.00</div>
                <p className="text-xxs text-zinc-650 mt-0.5">One-time payment. Lifetime access to this report.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push(`/checkout/?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
                    setShowPayModal(false);
                  }}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Pay with Credit Card (Stripe)
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-700 py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex justify-center items-center gap-3 text-zinc-600 text-xxs pt-1">
                <span>🛡️ SSL Secured</span>
                <span>•</span>
                <span>Instant PDF Download</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

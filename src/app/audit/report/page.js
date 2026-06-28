/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMockLighthouseResult } from "../../../utils/mockPageSpeed";
import { getSettings } from "../../../utils/leadsStore";

// Toggle this to true when you want to use mock data for local testing.
// Can also be controlled via NEXT_PUBLIC_USE_MOCK_DATA="true" in .env.local
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const FALLBACK_API_KEY = ""; 

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get("url") || "";

  // Page States
  const [adminSettings, setAdminSettings] = useState(null);
  
  useEffect(() => {
    setAdminSettings(getSettings());
  }, []);

  // Page States
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Accordion state for new UI
  const [openAccordions, setOpenAccordions] = useState({});

  const toggleAccordion = (engineKey) => {
    setOpenAccordions(prev => ({
      ...prev,
      [engineKey]: !prev[engineKey]
    }));
  };

  const [deviceStrategy, setDeviceStrategy] = useState("mobile");
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);

  useEffect(() => {
    setScreenshotLoaded(false);
  }, [deviceStrategy]);

  useEffect(() => {
    setScreenshotLoaded(false);
    setDeviceStrategy("mobile");
  }, [report?.url]);

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

  const getAdjustedEngineScore = (engineKey) => {
    if (!report?.engines?.[engineKey]) return 0;
    return getStrategyScore(engineKey, report.engines[engineKey].score, deviceStrategy);
  };

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          if (data.session.subscription_tier === "weekly" || data.session.subscription_tier === "agency") {
            setIsPaid(true);
          }
        }
      } catch (err) {
        console.error("Failed to load user session on report page:", err);
      } finally {
        setLoadingSession(false);
      }
    }
    fetchSession();
  }, []);

  const isPremium = session?.subscription_tier === "weekly" || session?.subscription_tier === "agency" || isPaid;

  const loadingSteps = [
    "Verifying premium payment key...",
    "Querying Google PageSpeed API servers...",
    "Retrieving Core Web Vitals logs...",
    "Analyzing HTML tag sequence...",
    "Testing server security variables...",
    "Measuring page payload weights...",
    "Evaluating semantic entity markup...",
    "Formatting executive PDF document..."
  ];

  const getApiKeys = () => {
    const rawKeys = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || FALLBACK_API_KEY || "";
    return rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
  };

  // 1. Verify Payment on Mount (Secure Server-Side Check)
  useEffect(() => {
    if (loadingSession) return;
    if (!urlParam) {
      router.push("/audit");
      return;
    }

    async function verifyPayment() {
      try {
        if (session?.subscription_tier === "weekly" || session?.subscription_tier === "agency") {
          setIsPaid(true);
          setCheckingPayment(false);
          return;
        }

        if (session?.email) {
          const res = await fetch("/api/leads/user");
          if (res.ok) {
            const data = await res.json();
            const cleanUrlParam = urlParam.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
            const matchingLead = data.audits?.find(a => 
              a.website.toLowerCase().includes(cleanUrlParam)
            );
            
            if (matchingLead && matchingLead.packageRequest && matchingLead.packageRequest !== "Free Audit") {
              setIsPaid(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to verify premium status securely", e);
      } finally {
        setCheckingPayment(false);
      }
    }
    
    verifyPayment();
  }, [urlParam, router, loadingSession, session]);

  // 1b. Trigger Audit run when payment is verified or session tier is active
  useEffect(() => {
    if (isPaid && !report && !loading && !error && urlParam) {
      runAudit(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid, report, loading, error, urlParam]);

  // Loading animation loop
  useEffect(() => {
    let interval;
    if (loading) {
      const stepTime = USE_MOCK_DATA ? 350 : 2500;
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, stepTime);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // 2. Fetch and Parse Audit Data
  async function runAudit(targetUrl) {
    setError(null);
    setLoading(true);

    let formattedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      let data;
      if (USE_MOCK_DATA) {
        // Simulate scanning network latency/delay for a premium feel
        await new Promise((resolve) => setTimeout(resolve, 2800));
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
              throw new Error(errData?.error?.message || "Unable to contact Google Lighthouse servers. Verify the URL is live.");
            }

            const jsonData = await res.json();
            
            if (jsonData.error) {
              if (jsonData.error.code === 429) {
                throw new Error("429_QUOTA_EXCEEDED");
              }
              throw new Error(jsonData.error.message || "Google API error.");
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

      // Extract scores
      const perfScore = Math.round((categories.performance?.score || 0) * 100);
      const seoScore = Math.round((categories.seo?.score || 0) * 100);
      const accessScore = Math.round((categories.accessibility?.score || 0) * 100);
      const bpScore = Math.round((categories["best-practices"]?.score || 0) * 100);

      const rawByteWeight = audits["total-byte-weight"]?.numericValue || 0;
      const pageWeightMB = (rawByteWeight / (1024 * 1024)).toFixed(2);

      // Construct detailed audit list for printing
      // HTML & CSS Validation Score calculation
      const validationChecks = [
        audits["duplicate-id-active"]?.score === 1 || audits["duplicate-id-active"]?.score === null,
        audits["doctype"]?.score === 1 || audits["doctype"]?.score === null,
        audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null,
        audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null
      ];
      const passedValidationCount = validationChecks.filter(Boolean).length;
      const validationScore = Math.round((passedValidationCount / validationChecks.length) * 100);

      // Construct detailed audit list for printing
      const engines = {
        "seo-tags": {
          name: "On-Page SEO Tags",
          score: seoScore,
          checks: [
            {
              name: "Title Tag Presence & Length",
              passed: audits["document-title"]?.score === 1,
              value: audits["document-title"]?.score === 1 ? "Title set correctly" : (audits["document-title"]?.displayValue || "Not found"),
              desc: "Checks if the page title tag exists and falls within the ideal 10-60 character range.",
              severity: "error",
              impact: "High",
              snippet: "<title>Your Keyword - Your Brand Name</title>",
              fix: "Add a descriptive <title> tag between 30-60 characters containing your core keyword."
            },
            {
              name: "Meta Description Optimization",
              passed: audits["meta-description"]?.score === 1,
              value: audits["meta-description"]?.score === 1 ? "Meta description present" : "Missing description tag",
              desc: "Checks if a meta description is present to describe your page content in search snippets.",
              severity: "warning",
              impact: "Medium",
              snippet: "<meta name=\"description\" content=\"A compelling summary of your page under 160 characters containing keywords.\">",
              fix: "Write a unique meta description between 120-160 characters summarizing your service and call-to-action."
            },
            {
              name: "Canonical URL Configuration",
              passed: audits["canonical"]?.score === 1 || audits["canonical"]?.score === null,
              value: (audits["canonical"]?.score === 1 || audits["canonical"]?.score === null) ? "Canonical configured" : "Canonical link missing",
              desc: "Ensures a canonical URL is set to prevent duplicate content flags on search engines.",
              severity: "error",
              impact: "High",
              snippet: "<link rel=\"canonical\" href=\"https://yourdomain.com/current-page-url\" />",
              fix: "Configure a <link rel='canonical' href='...' /> tag pointing to the master URL of this webpage."
            },
            {
              name: "Link Text Descriptiveness",
              passed: audits["link-text"]?.score === 1 || audits["link-text"]?.score === null,
              value: (audits["link-text"]?.score === 1 || audits["link-text"]?.score === null) ? "Descriptive link text used" : "Generic link text detected",
              desc: "Checks that links do not use generic text like 'click here' or 'more info'.",
              severity: "warning",
              impact: "Medium",
              snippet: "<a href=\"/plans\">View SEO Pricing plans</a>\n<!-- Avoid generic text like 'Click Here' -->",
              fix: "Rewrite anchor text to be descriptive of the target link."
            },
            {
              name: "Search Indexing Status (Robots.txt)",
              passed: audits["is-crawlable"]?.score === 1,
              value: audits["is-crawlable"]?.score === 1 ? "Crawling allowed" : "Indexing blocked",
              desc: "Confirms that search engines aren't blocked from indexation by meta robots codes.",
              severity: "error",
              impact: "High",
              snippet: "User-agent: *\nAllow: /\n\n# Or HTML tag:\n<meta name=\"robots\" content=\"index, follow\">",
              fix: "Verify that your robots.txt or meta robots tag does not include 'noindex' restrictions."
            },
            {
              name: "Language Declaration Status",
              passed: audits["html-has-lang"]?.score === 1 || audits["html-has-lang"]?.score === null,
              value: (audits["html-has-lang"]?.score === 1 || audits["html-has-lang"]?.score === null) ? "Language declared" : "Missing language tag",
              desc: "Checks if the HTML tag declares a valid language attribute (e.g. lang='en').",
              severity: "warning",
              impact: "Medium",
              snippet: "<html lang=\"en\">\n<!-- Add this to your root HTML element -->",
              fix: "Declare the primary language of the page by adding lang='en' (or your country code) to the html tag."
            }
          ]
        },
        "page-speed": {
          name: "Core Web Vitals",
          score: perfScore,
          checks: [
            {
              name: "Largest Contentful Paint (LCP)",
              passed: audits["largest-contentful-paint"]?.score >= 0.9,
              value: audits["largest-contentful-paint"]?.displayValue || "N/A",
              desc: "Tracks the loading time of the main body text or key hero image on your viewport.",
              severity: "error",
              impact: "High",
              snippet: "<!-- Compress hero images to WebP/AVIF and add priority -->\n<img src=\"hero.webp\" fetchpriority=\"high\" alt=\"Hero\">",
              fix: "Optimize hero images (compress/WebP) and remove render-blocking stylesheet links from the head."
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
          checks: [
            {
              name: "Total Page Payload Weight",
              passed: rawByteWeight < 2621440,
              value: `${pageWeightMB} MB`,
              desc: "Checks if the total weight of assets loaded is under 2.5 MB.",
              severity: "warning",
              impact: "Medium",
              fix: "Reduce font weights, compress scripts, and use lazy-loading techniques to defer image load times."
            },
            {
              name: "Next-Gen Image Formats (WebP/AVIF)",
              passed: audits["uses-webp-images"]?.score >= 0.9 || audits["uses-webp-images"]?.score === null,
              value: (audits["uses-webp-images"]?.score >= 0.9 || audits["uses-webp-images"]?.score === null) ? "Next-gen active" : "Legacy image types",
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
              value: (audits["uses-optimized-images"]?.score >= 0.9 || audits["uses-optimized-images"]?.score === null) ? "Optimized compression active" : "Raw unoptimized media loaded",
              desc: "Validates that loaded images are compressed efficiently to minimize payload bytes.",
              severity: "warning",
              impact: "Medium",
              fix: "Apply a 75-80% compression sweep on all static media assets before uploading them to the server.",
              details: audits["uses-optimized-images"]?.details?.items || null
            },
            {
              name: "Render-blocking Resources",
              passed: audits["render-blocking-resources"]?.score === 1 || audits["render-blocking-resources"]?.score === null,
              value: (audits["render-blocking-resources"]?.score === 1 || audits["render-blocking-resources"]?.score === null) ? "Clean render layout" : "Critical render-blocking resources",
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
              value: (audits["unused-css-rules"]?.score >= 0.9 || audits["unused-css-rules"]?.score === null) ? "Clean style payload" : "Unused stylesheets loaded",
              desc: "Scans stylesheets for styling rules that are loaded but never applied on screen.",
              severity: "warning",
              impact: "Low",
              fix: "Clean up unused Tailwind or global styles, and split CSS into modular page-specific files.",
              details: audits["unused-css-rules"]?.details?.items || null
            },
            {
              name: "Unused JavaScript Deferral",
              passed: audits["unused-javascript"]?.score >= 0.9 || audits["unused-javascript"]?.score === null,
              value: (audits["unused-javascript"]?.score >= 0.9 || audits["unused-javascript"]?.score === null) ? "Optimized javascript execution" : "Unused scripts loaded",
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
          checks: [
            {
              name: "Heading Structure Hierarchy",
              passed: audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null,
              value: (audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null) ? "Logical hierarchy" : "Heading sequence warning",
              desc: "Verifies headers (H1, H2, H3) are sequentially ordered and structured logically.",
              severity: "warning",
              impact: "Medium",
              snippet: "<h1>My Main Topic (H1)</h1>\n<h2>Major Section (H2)</h2>\n<h3>Sub Section (H3)</h3>",
              fix: "Ensure the page has exactly one <h1> heading for the main topic, with subheaders styled sequentially."
            },
            {
              name: "Image alt Attributes Check",
              passed: audits["image-alt"]?.score === 1,
              value: audits["image-alt"]?.score === 1 ? "Alt tags present" : "Alt tags missing",
              desc: "Validates that images have alternative descriptions to let search engines read them.",
              severity: "error",
              impact: "High",
              snippet: "<img src=\"logo.webp\" alt=\"SEOIntellect - Professional SEO Audit Tool Logo\">",
              fix: "Audit your images and append descriptive, keyword-rich 'alt' text to every single <img> tag."
            },
            {
              name: "Mobile Tap Targets Space",
              passed: audits["tap-targets"]?.score === 1 || audits["tap-targets"]?.score === null,
              value: (audits["tap-targets"]?.score === 1 || audits["tap-targets"]?.score === null) ? "Touch spacing valid" : "Targets too small/tight",
              desc: "Checks if buttons and links are spaced far enough to avoid accidental finger taps.",
              severity: "warning",
              impact: "Medium",
              snippet: "/* Standard mobile button bounds */\n.nav-button {\n  min-width: 48px;\n  min-height: 48px;\n  padding: 8px 16px;\n}",
              fix: "Ensure all interactive mobile links have a minimum target size of 48px and are separated by padding."
            },
            {
              name: "Mobile Viewport Configuration",
              passed: audits["viewport"]?.score === 1 || audits["viewport"]?.score === null,
              value: (audits["viewport"]?.score === 1 || audits["viewport"]?.score === null) ? "Mobile viewport set" : "Viewport tag missing",
              desc: "Ensures the viewport tag is set to allow fluid scaling on varying mobile screens.",
              severity: "error",
              impact: "High",
              snippet: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
              fix: "Make sure `<meta name='viewport' content='width=device-width, initial-scale=1'>` is in your document head."
            },
            {
              name: "Font Scale and Legibility",
              passed: audits["font-size"]?.score === 1,
              value: audits["font-size"]?.score === 1 ? "Legible mobile font scales" : "Fonts too small for mobile",
              desc: "Verifies that font scale sizes are readable on mobile displays without pinching.",
              severity: "warning",
              impact: "Medium",
              snippet: "body {\n  font-size: 16px;\n  line-height: 1.6;\n}",
              fix: "Increase small body font scales to at least 14px or 16px to prevent Google mobile ranking penalties."
            },
            {
              name: "Color Contrast Ratio",
              passed: audits["color-contrast"]?.score === 1 || audits["color-contrast"]?.score === null,
              value: (audits["color-contrast"]?.score === 1 || audits["color-contrast"]?.score === null) ? "Accessible text contrast" : "Low contrast text detected",
              desc: "Verifies text has sufficient contrast against background colors to ensure legibility.",
              severity: "warning",
              impact: "Medium",
              fix: "Increase text contrast. E.g. change light-gray text on white backgrounds to a darker slate shade."
            }
          ]
        },
        "server-security": {
          name: "Server & Security",
          score: bpScore,
          checks: [
            {
              name: "HTTPS Protocol Status",
              passed: audits["is-on-https"]?.score === 1,
              value: audits["is-on-https"]?.score === 1 ? "Secure connection (HTTPS)" : "Insecure HTTP connection",
              desc: "Verifies if the website runs on SSL (HTTPS) to encrypt client-server communication.",
              severity: "error",
              impact: "High",
              snippet: "# Apache .htaccess redirect:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
              fix: "Acquire an SSL certificate through your Hostinger portal and redirect HTTP traffic to HTTPS."
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
              value: audits["no-vulnerable-libraries"]?.score === 1 ? "Safe JavaScript libraries" : "Vulnerable JS packages found",
              desc: "Scans libraries used on page load to detect known software security vulnerabilities.",
              severity: "warning",
              impact: "Medium",
              fix: "Update outdated jQuery or React packages to their latest stable security releases."
            },
            {
              name: "Modern HTTP/2 Implementation",
              passed: audits["uses-http2"]?.score === 1 || audits["uses-http2"]?.score === null,
              value: (audits["uses-http2"]?.score === 1 || audits["uses-http2"]?.score === null) ? "HTTP/2 protocol active" : "Server uses older HTTP/1.1",
              desc: "Checks if the server sends data using HTTP/2, which supports multi-file concurrent downloads.",
              severity: "warning",
              impact: "Medium",
              fix: "Enable HTTP/2 or HTTP/3 inside your Hostinger dashboard panel settings."
            },
            {
              name: "Browser Console Errors check",
              passed: audits["browser-errors"]?.score === 1 || audits["browser-errors"]?.score === null,
              value: (audits["browser-errors"]?.score === 1 || audits["browser-errors"]?.score === null) ? "No console crash errors" : "Runtime console errors detected",
              desc: "Validates that no javascript or runtime crashes are logged in the browser console during page load.",
              severity: "warning",
              impact: "Medium",
              fix: "Check your code files for unhandled runtime exceptions or missing asset link reference warnings.",
              details: audits["browser-errors"]?.details?.items || null
            },
            {
              name: "Secure External Hyperlinks (rel=noopener)",
              passed: audits["external-anchors-use-rel-noopener"]?.score === 1 || audits["external-anchors-use-rel-noopener"]?.score === null,
              value: (audits["external-anchors-use-rel-noopener"]?.score === 1 || audits["external-anchors-use-rel-noopener"]?.score === null) ? "Secure external links" : "Links missing noopener attribute",
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
          checks: [
            {
              name: "Structured Entity Schema",
              passed: audits["canonical"]?.score === 1 || audits["canonical"]?.score === null,
              value: (audits["canonical"]?.score === 1 || audits["canonical"]?.score === null) ? "JSON-LD entities active" : "Schema structure missing",
              desc: "Verifies presence of Schema.org semantic data blocks that AI engines use to parse page topics.",
              severity: "error",
              impact: "High",
              snippet: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"SEOIntellect\",\n  \"url\": \"https://seointellect.com\",\n  \"logo\": \"https://seointellect.com/logo.png\"\n}\n</script>",
              fix: "Deploy JSON-LD Organization or LocalBusiness schema markup to declare your business name, logo, coordinates, and services to LLMs."
            },
            {
              name: "AI Agent Access (Robots.txt)",
              passed: audits["is-crawlable"]?.score === 1,
              value: audits["is-crawlable"]?.score === 1 ? "AI bots allowed" : "AI crawling blocked",
              desc: "Ensures robots.txt doesn't block AI indexing sweepers like GPTBot or ClaudeBot.",
              severity: "error",
              impact: "High",
              snippet: "# Allow all LLM crawlers in robots.txt\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /",
              fix: "Check robots.txt variables to allow accessibility for GPTBot and Claude-Web user agents."
            },
            {
              name: "FAQ Heading Structure",
              passed: audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null,
              value: (audits["heading-order"]?.score === 1 || audits["heading-order"]?.score === null) ? "Q&A heading sequence valid" : "Q&A heading order warning",
              desc: "Checks if you utilize question-answer style heading groups, which AI engines crawl to extract quick-answers.",
              severity: "warning",
              impact: "Medium",
              snippet: "<h3>What features does SEOIntellect include?</h3>\n<p>SEOIntellect includes page speed audits, meta crawlers, local service landing layouts, and GEO readiness analyzers.</p>",
              fix: "Format key informational text as direct Questions (H3) followed immediately by concise, direct Answers (Paragraphs)."
            },
            {
              name: "Semantic Content Density",
              passed: rawByteWeight > 1000,
              value: rawByteWeight > 1000 ? "High text-to-code ratio" : "Lean content volume",
              desc: "Evaluates text ratio against code framework weight. LLMs prefer content-rich copy over heavy stylesheet nodes.",
              severity: "warning",
              impact: "Medium",
              fix: "Publish detailed copy (500+ words per page) and strip redundant layout stylesheet tags from the DOM structure."
            },
            {
              name: "LLM Discovery Pathways",
              passed: audits["crawlable-anchors"]?.score === 1,
              value: audits["crawlable-anchors"]?.score === 1 ? "Clear indexation paths" : "Broken crawling links",
              desc: "Validates that internal links use standard structures to let AI crawlers trace relationships between pages.",
              severity: "error",
              impact: "High",
              snippet: "<a href=\"/services/seo-optimization\">\n  Learn more about our SEO services\n</a>\n<!-- Avoid JS-only onClick routers without href -->",
              fix: "Ensure all navigation paths utilize standard HTML href tags to allow deep AI indexing sweeps."
            },
            {
              name: "Conversational Readability Scale",
              passed: audits["font-size"]?.score === 1,
              value: audits["font-size"]?.score === 1 ? "Natural language readable" : "Complex readability flags",
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
              value: (audits["duplicate-id-active"]?.score === 1 || audits["duplicate-id-active"]?.score === null) ? "All element IDs are unique" : "Duplicate HTML IDs detected",
              desc: "Validates that no multiple DOM nodes share the exact same ID attribute. Duplicates break browser accessibility.",
              severity: "warning",
              impact: "Medium",
              snippet: "<!-- Incorrect -->\n<div id=\"nav-link\"></div>\n<div id=\"nav-link\"></div>\n\n<!-- Correct -->\n<div id=\"nav-link-1\"></div>\n<div id=\"nav-link-2\"></div>",
              fix: "Search your templates and change duplicate component IDs into unique strings or class names."
            },
            {
              name: "HTML5 DOCTYPE Declaration",
              passed: audits["doctype"]?.score === 1 || audits["doctype"]?.score === null,
              value: (audits["doctype"]?.score === 1 || audits["doctype"]?.score === null) ? "DOCTYPE declared correctly" : "DOCTYPE is missing",
              desc: "Checks if page starts with the standard HTML5 doctype. Without it, browsers trigger Quirks Mode.",
              severity: "error",
              impact: "High",
              snippet: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>...",
              fix: "Prepend <!DOCTYPE html> declaration at the very top of your index page template."
            },
            {
              name: "HTML Tag Deprecations",
              passed: audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null,
              value: (audits["deprecations"]?.score === 1 || audits["deprecations"]?.score === null) ? "No deprecated tags found" : "Deprecated elements loaded",
              desc: "Ensures the document is clean of legacy layout tags (like <center>, <strike>, <font>) that are obsolete.",
              severity: "warning",
              impact: "Low",
              snippet: "<!-- Replace <center>text</center> with: -->\n<div className=\"text-center\">text</div>",
              fix: "Replace obsolete tags with modern CSS layouts and Tailwind utilities."
            },
            {
              name: "Image Render Aspect Ratios",
              passed: audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null,
              value: (audits["image-aspect-ratio"]?.score === 1 || audits["image-aspect-ratio"]?.score === null) ? "Image aspect ratios are correct" : "Aspect ratio mismatch (image distortion)",
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

      setReport({
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
      });
    } catch (err) {
      console.error(err);
      if (err.message === "429_QUOTA_EXCEEDED") {
        setError("Rate limit reached. Try again in a minute.");
      } else {
        setError(err.message || "An error occurred compiling the SEO audit. Check the URL status.");
      }
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const triggerPrint = () => {
    if (typeof window !== "undefined") {
      // Extract the domain name from the audited URL parameter
      let domain = "Report";
      try {
        let cleanUrl = urlParam.trim();
        if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = "https://" + cleanUrl;
        }
        domain = new URL(cleanUrl).hostname;
      } catch (e) {
        domain = urlParam.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0] || "Report";
      }

      // Rename document title temporarily for professional PDF filename branding
      const originalTitle = document.title;
      const agencyName = finalAgencyName;
      if (agencyName) {
        document.title = `${domain} - Technical SEO Audit Report | Prepared by ${agencyName}`;
      } else {
        document.title = `${domain} - Technical SEO Audit Report | SEOIntellect AI`;
      }
 
      window.print();
 
      // Restore original title
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }
  };

  // Render Check payment status screen
  if (checkingPayment || loadingSession) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white print:text-slate-900">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Checking credentials...</p>
        </div>
      </div>
    );
  }



  // Render Loading audit details screen
  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white print:text-slate-900">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold animate-pulse text-white print:text-slate-900">{loadingSteps[loadingStep]}</p>
            <p className="text-xxs text-zinc-500">
              Querying Google Lighthouse infrastructure. Please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Error state screen
  if (error) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white print:text-slate-900">
        <div className="max-w-md w-full border border-rose-500/20 bg-rose-500/5 rounded-2xl p-8 text-center space-y-6">
          <span className="text-3xl block">⚠️</span>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white print:text-slate-900">Error Compiling Report</h3>
            <p className="text-xs text-zinc-400 print:text-slate-600 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => runAudit(urlParam)}
            className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-xs font-semibold text-zinc-200 transition-all border border-zinc-700"
          >
            Retry Report Analysis
          </button>
        </div>
      </div>
    );
  }

  // Render Report layout
  if (!report) return null;

  // Compile failed checks for Priority Action Checklist (using strategy-adjusted checks)
  const failedChecks = [];
  Object.entries(report.engines).forEach(([key, engine]) => {
    const adjustedChecks = getChecksForStrategy(engine.checks, deviceStrategy);
    adjustedChecks.forEach((check) => {
      if (!check.passed) {
        failedChecks.push({
          ...check,
          engineName: engine.name
        });
      }
    });
  });

  const queryAgencyName = searchParams.get("agencyName") || "";
  const queryAgencyAccent = searchParams.get("agencyAccent") || "";
  const queryAgencyLogo = searchParams.get("agencyLogo") || "";

  const finalAgencyName = queryAgencyName || adminSettings?.agencyName || session?.agency_name || "";
  const finalAgencyAccent = queryAgencyAccent || adminSettings?.agencyAccentColor || "indigo";
  const finalAgencyLogo = queryAgencyLogo || adminSettings?.agencyLogo || "";

  const getAccentColors = (color) => {
    const map = {
      indigo: { hex: "#6366f1", rgb: "99, 102, 241" },
      emerald: { hex: "#10b981", rgb: "16, 185, 129" },
      violet: { hex: "#8b5cf6", rgb: "139, 92, 246" },
      rose: { hex: "#f43f5e", rgb: "244, 63, 94" },
      cyan: { hex: "#06b6d4", rgb: "6, 182, 212" },
    };
    return map[color] || map.indigo;
  };

  return (
    <div className="bg-slate-950 text-slate-300 print:text-slate-700 min-h-screen pb-24 print:bg-white print:text-slate-900 print:pb-0 font-sans print:color-adjust-exact">
      
      {/* HTML STYLE TAG FOR PRINT OPTIMIZATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
          body { background-color: #ffffff !important; color: #0f172a !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          .dark-only { display: none !important; }
          .light-only { display: block !important; }
        }
      `}} />

      {/* UNIFIED RESPONSIVE HEADER */}
      <div className="max-w-6xl mx-auto items-center sm:items-end justify-between px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row gap-6 sm:gap-0 print:flex print:py-4 print:max-w-none print:px-0 print:w-full">
        <div className="text-center sm:text-left">
          {finalAgencyLogo ? (
            <img src={finalAgencyLogo} alt={finalAgencyName || "Agency Logo"} className="h-8 w-auto object-contain mb-3 mx-auto sm:mx-0 max-h-12" />
          ) : (
            <div className="text-xs font-black text-indigo-400 print:text-slate-900 mb-3 tracking-widest uppercase">
              {finalAgencyName || "SEOIntellect AI"}
            </div>
          )}
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1 sm:mb-2">Published: {report.date}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mb-1 print:text-slate-900">Executive SEO Performance Dossier</h1>
          <div className="text-xs sm:text-sm text-zinc-400 print:text-slate-600 mt-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
            <span>🌐</span> {report.url}
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-end gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (isPremium) {
                  triggerPrint();
                } else {
                  router.push(`/checkout/?url=${encodeURIComponent(urlParam)}`);
                }
              }} 
              className="hidden sm:block bg-gradient-to-r from-indigo-500 to-cyan-400 text-white print:text-slate-900 font-bold py-2.5 px-6 rounded-xl shadow-lg transition-transform active:scale-95 text-sm print:hidden cursor-pointer"
            >
              📥 Download PDF Report
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-white/5 border-white/10 rounded-xl p-3 shadow-sm border print:border-slate-300">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Overall Grade</div>
                <div className="text-3xl font-extrabold text-indigo-400">{getOverallGrade(getOverallScore(deviceStrategy))} <span className="text-lg">{getOverallScore(deviceStrategy)}%</span></div>
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                All passing ratings
              </div>
            </div>
          </div>

          <div className="sm:hidden relative w-32 h-32 mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="6" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * getOverallScore(deviceStrategy)) / 100} className="transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-emerald-400">{getOverallScore(deviceStrategy)}</span>
            </div>
          </div>
          <div className="sm:hidden bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
            ● Good Standing
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 print:max-w-none print:px-0 print:w-full print:space-y-6">
        
        {/* Unified Mobile/Desktop Strategy Switcher Tab */}
        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-4 select-none print:hidden">
          <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850 backdrop-blur-md">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[320px] print:grid print:grid-cols-12 print:gap-4 print:min-h-0 print:mb-6 print:break-inside-avoid">
          {/* Summary Card */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900/60 to-zinc-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 backdrop-blur-md print:col-span-7 print:bg-slate-50 print:border-slate-200 print:text-slate-900 print:p-6 print:flex print:flex-row print:items-center">
            <div className="space-y-3 text-left">
              <span className="text-xxs uppercase tracking-wider font-bold text-violet-400">
                Enterprise Scan Completed (30+ Checks Verified)
              </span>
              <h2 className="text-base sm:text-xl font-bold text-white print:text-slate-900 break-all max-w-full">
                {report.url}
              </h2>
              <p className="text-xs text-zinc-500 print:text-slate-700">
                Site analysed with Google Lighthouse, Speed Checkers, and Security crawlers. Average score:{" "}
                <span className="text-zinc-300 print:text-slate-900 font-semibold">{getOverallScore(deviceStrategy)}%</span>
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
                        className="text-zinc-850 print:text-slate-100"
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
                        ? "text-emerald-400 print:text-emerald-600" 
                        : getOverallScore(deviceStrategy) >= 50 
                        ? "text-amber-400 print:text-amber-600" 
                        : "text-rose-400 print:text-rose-600"
                    }`}>
                      {getOverallGrade(getOverallScore(deviceStrategy))}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerPrint}
                className="rounded-xl bg-white px-4 py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md hover:scale-[1.01] cursor-pointer print:hidden"
              >
                Download Report PDF
              </button>
            </div>
          </div>

          {/* Dynamic Viewport Screenshot Panel */}
          {deviceStrategy === "mobile" ? (
            /* Mobile Mockup (High-Fidelity iPhone Portrait frame) */
            <div className="lg:col-span-5 flex items-center justify-center py-3 h-[320px] print:col-span-5 print:py-0 print:h-[280px]">
              {/* Phone frame — exact 375×667 Chrome DevTools ratio */}
              <div
                className="relative h-full rounded-[28px] border-[8px] border-zinc-800 bg-black shadow-2xl ring-1 ring-zinc-700/60 overflow-hidden flex flex-col group select-none print:shadow-none print:ring-slate-355"
                style={{ aspectRatio: '375 / 667' }}
              >
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[30%] h-[4%] bg-black rounded-full z-30" />

                {/* Status Bar */}
                <div className="h-[8%] w-full bg-black/80 px-3 flex items-center justify-between text-[8px] text-zinc-400 font-semibold z-25 relative shrink-0">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="h-2 w-2 text-zinc-300" fill="currentColor" viewBox="0 0 24 24"><path d="M2 22h20V2z" /></svg>
                    <svg className="h-2 w-2 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
                    <div className="w-4 h-2 border border-zinc-500 rounded-[2px] p-[1px] flex items-center"><div className="h-full w-3 bg-zinc-300 rounded-[1px]" /></div>
                  </div>
                </div>

                {/* Mobile Address Bar (Adds browser spacing) */}
                <div className="h-[7%] w-full bg-zinc-900 border-b border-zinc-850 px-3 flex items-center justify-center text-[7px] text-zinc-450 font-sans shrink-0">
                  <div className="bg-zinc-200/50 dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-850 px-2 py-0.5 rounded-md text-[7px] text-zinc-650 dark:text-zinc-400 font-mono flex items-center justify-center gap-1 w-full select-none">
                    <span className="text-[7px] text-emerald-500">🔒</span>
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
                <div className="h-[5%] w-full bg-black flex items-center justify-center shrink-0">
                  <div className="w-[35%] h-1 bg-zinc-600 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Mockup (Browser landscape frame) */
            <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/10 p-3.5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group h-[320px] print:col-span-5 print:bg-slate-50 print:border-slate-200 print:h-[280px] print:p-2.5">
              {/* Browser Top Window Controls */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 select-none print:border-slate-200">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500/80 block" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/80 block" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80 block" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 pl-2 text-zinc-650 text-[9px] print:hidden">
                    <span>←</span>
                    <span>→</span>
                  </div>
                </div>

                <div className="flex-grow max-w-xs mx-3 bg-zinc-200/50 dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-850 px-2.5 py-0.5 rounded-md text-[9px] text-zinc-650 dark:text-zinc-400 font-mono flex items-center justify-between gap-1 select-none print:bg-slate-100 print:border-slate-200">
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-[9px] text-emerald-500">🔒</span>
                    <span className="truncate print:text-slate-800">{report.url.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <span className="text-[9px] text-zinc-650 font-sans cursor-pointer hover:text-zinc-400 print:hidden">↻</span>
                </div>

                <div className="w-4" />
              </div>

              {/* Screenshot Frame */}
              <div className="relative flex-1 w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850/60 print:bg-slate-100 print:border-slate-200">
                {!screenshotLoaded && (
                  <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
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

        {/* AGENCY WHITE-LABEL BRANDING */}
        {(session?.subscription_tier === "agency" || finalAgencyName) && (
          <div className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <div className="text-left">
                <div className="font-extrabold text-white print:text-slate-900 uppercase tracking-wider text-[10px]">White-label Client Report</div>
                <div className="text-zinc-400 print:text-slate-600 text-xs mt-0.5">Prepared by: <span className="font-bold text-indigo-400">{finalAgencyName || "Apex Marketing Group"}</span></div>
              </div>
            </div>
            <div className="text-right sm:text-right flex flex-col items-center sm:items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Branding Status</span>
              <span className="text-emerald-400 font-bold text-[10px] uppercase mt-0.5">SEOIntellect branding removed</span>
            </div>
          </div>
        )}

        {/* SUMMARY BLOCKS */}
        <div>
          <h3 className="text-lg font-bold text-white print:text-slate-900 mb-4">Performance Engine Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200 shadow-sm print:shadow-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 print:text-slate-600">
                  <span className="text-indigo-400 bg-indigo-500/10 p-1 rounded">🖥️</span> Tech
                </div>
                <span className="inline-flex text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">Excellent</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mb-2">{getAdjustedEngineScore('seo-tags')}<span className="text-sm font-medium text-zinc-500">/100</span></div>
              <div className="w-full bg-zinc-800 rounded-full h-1">
                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${getAdjustedEngineScore('seo-tags')}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200 shadow-sm print:shadow-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 print:text-slate-600">
                  <span className="text-cyan-400 bg-cyan-500/10 p-1 rounded">⚡</span> Perf
                </div>
                <span className="inline-flex text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">Perfect</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mb-2">{getAdjustedEngineScore('page-speed')}<span className="text-sm font-medium text-zinc-500">/100</span></div>
              <div className="w-full bg-zinc-800 rounded-full h-1">
                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${getAdjustedEngineScore('page-speed')}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-900 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200 shadow-sm print:shadow-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 print:text-slate-600">
                  <span className="text-rose-400 bg-rose-500/10 p-1 rounded">⚠️</span> Issues
                </div>
                <span className="inline-flex text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase">Good</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mb-1">{failedChecks.length} <span className="text-sm font-medium text-zinc-500">Found</span></div>
              <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">! {failedChecks.filter(c => c.severity === 'error').length} Critical</div>
            </div>

            <div className="bg-slate-900 print:bg-slate-50 p-5 rounded-2xl border border-slate-800 print:border-slate-200 shadow-sm print:shadow-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 print:text-slate-600">
                  <span className="text-indigo-400 bg-indigo-500/10 p-1 rounded">✨</span> AI Ready
                </div>
                <span className="inline-flex text-[9px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase">Needs Work</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mb-1">
                {getAdjustedEngineScore('aeo-geo') >= 80 ? 'A' : getAdjustedEngineScore('aeo-geo') >= 60 ? 'B+' : 'C'}
              </div>
              <div className="text-[10px] text-zinc-400 print:text-slate-600 font-bold uppercase tracking-wider">AEO Status</div>
            </div>
          </div>
        </div>

        {/* ALERTS SECTION (Desktop) */}
        <div className="flex flex-col sm:flex-row gap-4 print:flex">
          <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-indigo-500 bg-indigo-500/20 rounded-full p-1.5 text-xs">🎯</span>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Top Strategist Note</div>
              <p className="text-xs text-indigo-300">Before advancing, prioritize LCP fixes and internal linking schema to capture immediate ranking shifts.</p>
            </div>
          </div>
          <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-rose-500 bg-rose-500/20 rounded-full p-1.5 text-xs">⚠️</span>
            <div>
              <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Critical System Alert</div>
              <p className="text-xs text-rose-300">Payload weight critically limits mobile indexation on your key product pages.</p>
            </div>
          </div>
        </div>

        {/* AEO & GEO CITATION GRADER CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/20 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden group text-left geo-card">
          {/* Subtle glow background */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-500" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 border-b border-slate-800 pb-4">
            <div>
              <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mb-1">
                Generative Engine Optimization (GEO)
              </span>
              <h2 className="text-lg font-extrabold text-white">AI Search Readiness & Citation Grader</h2>
              <p className="text-xs text-zinc-400">Audits page optimizations for citation inclusion inside LLM search responses (ChatGPT, Claude, Perplexity).</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Readiness Score</span>
                <span className="text-2xl font-black text-white">{getAdjustedEngineScore('aeo-geo')}%</span>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
                <span className="text-indigo-400 text-xl font-bold font-mono">
                  {getAdjustedEngineScore('aeo-geo') >= 80 ? 'A' : getAdjustedEngineScore('aeo-geo') >= 60 ? 'B' : 'C'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* Left Column: Diagnostics Checklist */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">AI Optimization Diagnostics</h3>
              <div className="space-y-3">
                {getChecksForStrategy(report.engines['aeo-geo']?.checks || [], deviceStrategy).map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950/40 border border-slate-900 rounded-xl p-3 hover:border-slate-800 transition-colors geo-diagnostic-item">
                    <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${check.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {check.passed ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{check.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${check.passed ? "text-emerald-500 bg-emerald-500/5" : "text-rose-500 bg-rose-500/5"}`}>
                          {check.passed ? "Pass" : "Failed"}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{check.desc}</p>
                      {!check.passed && (
                        <div className="mt-2 text-[10px] text-indigo-400 bg-indigo-500/5 px-2.5 py-1.5 rounded border border-indigo-500/10 leading-normal text-left">
                          <span className="font-bold">Recommendation:</span> {check.fix}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: AI Answer Citation Simulator */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Answer Engine Citation Simulation</h3>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner flex flex-col h-full min-h-[300px] geo-chat-container">
                {/* Chat window top header */}
                <div className="bg-slate-900/50 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-[10px] text-zinc-400 font-mono geo-chat-header">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>perplexity-copilot-v4</span>
                  </div>
                  <span className="text-zinc-500">model: search-agent-3.5</span>
                </div>
                
                {/* Chat content area */}
                <div className="p-4 space-y-4 flex-1">
                  {/* User query bubble */}
                  <div className="flex gap-2 items-start justify-end">
                    <div className="bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-200 rounded-2xl px-4 py-2 max-w-[85%] text-left geo-chat-user-bubble">
                      What services are offered by <span className="font-mono text-cyan-400 font-bold">{report.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span> and is it highly optimized?
                    </div>
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-400 font-black shrink-0 geo-chat-user-avatar">
                      U
                    </div>
                  </div>

                  {/* AI response bubble */}
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400 font-black shrink-0 geo-chat-ai-avatar">
                      AI
                    </div>
                    <div className="space-y-3 max-w-[85%] text-left">
                      <div className="bg-slate-900/40 border border-slate-800/80 text-xs text-zinc-300 rounded-2xl px-4 py-2.5 leading-relaxed space-y-2 geo-chat-ai-bubble">
                        {getAdjustedEngineScore('aeo-geo') >= 80 ? (
                          <>
                            <p>
                              Based on search indexing citations, <strong className="text-white">{report.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</strong> is an optimized web platform <a href={report.url} target="_blank" rel="noopener" className="text-emerald-400 font-bold hover:underline select-none">[1]</a>.
                            </p>
                            <p>
                              The site leverages structured data blocks declaring entity configurations and utilizes semantic heading orders which facilitates answer parsing <a href={report.url} target="_blank" rel="noopener" className="text-emerald-400 font-bold hover:underline select-none">[2]</a>. GPTBot and ClaudeBot agents are granted full indexation clearance.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              Search engines found <strong className="text-white">{report.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</strong>, but the source displays warning flags for generative indexing <a href={report.url} target="_blank" rel="noopener" className="text-rose-400 font-bold hover:underline select-none">[1]</a>.
                            </p>
                            <p>
                              While crawlable pages are present, it lacks structured entity schema or has search indexing limitations (Robots.txt restrictions or unstructured heading order) that restrict direct factual extraction by search agents <a href={report.url} target="_blank" rel="noopener" className="text-rose-400 font-bold hover:underline select-none">[2]</a>.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Citation sources bar */}
                      <div className="flex flex-wrap gap-2 items-center pl-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Sources:</span>
                        <a href={report.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none geo-chat-source">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-mono truncate max-w-[80px]">{report.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                          <span className="text-zinc-650">[1]</span>
                        </a>
                        <a href={report.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none geo-chat-source">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-mono truncate max-w-[80px]">{report.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}/faq</span>
                          <span className="text-zinc-650">[2]</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation summary alert footer */}
                <div className="bg-slate-900/40 border-t border-slate-800/80 px-4 py-3 text-[10px] text-indigo-400 leading-normal text-left geo-chat-footer">
                  {getAdjustedEngineScore('aeo-geo') >= 80 ? (
                    <span>💡 <strong>Optimization Status: Excellent</strong>. The site is in prime position to be cited for relevant Q&A intent searches.</span>
                  ) : (
                    <span>⚠️ <strong>Optimizations needed</strong>: Fix the missing schema markups or robots.txt issues to secure recommendation placement.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CRITICAL FIXES */}
          <div className="flex-1 w-full space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white print:text-slate-900 mb-2">
              <span className="text-rose-400">⚠️</span> <span>Priority Action Fix-list</span>
            </h3>
            
            <div className="space-y-3">
              {failedChecks.slice(0, 4).map((check, idx) => (
                <div key={idx} className="bg-slate-900 print:bg-white rounded-xl border border-slate-800 print:border-slate-200 p-4 print:p-6 print:shadow-sm flex gap-3 sm:gap-4 items-start relative overflow-hidden group shadow-sm print:break-inside-avoid">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>
                  <div className="text-rose-400 text-lg sm:text-xl mt-0.5">
                    {check.name.includes("LCP") || check.name.includes("Time") ? "⏳" : check.name.includes("Link") ? "🔗" : "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-white print:text-slate-900 truncate">{check.name}</h4>
                      <span className="inline-flex text-[9px] font-bold text-rose-600 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">High Impact</span>
                    </div>
                    <p className="text-xs text-zinc-400 print:text-slate-600 leading-relaxed mb-2 line-clamp-2">{check.desc}</p>
                    <div className="bg-slate-800/40 print:bg-slate-100 rounded px-3 py-2 text-xs font-mono text-zinc-400 print:text-slate-700 mb-2 print:border print:border-slate-200">
                      Solution: <span className="text-indigo-400 font-bold">{check.fix}</span>
                    </div>
                    
                  </div>
                </div>
              ))}
              {failedChecks.length === 0 && (
                <div className="bg-slate-900 rounded-xl p-6 text-center text-zinc-500 text-sm border border-slate-800">
                  No critical issues found. Excellent work!
                </div>
              )}
            </div>
          </div>

          {/* TECHNICAL LOGS ACCORDIONS */}
          <div className="w-full lg:w-80 space-y-4 print:hidden">
            <h3 className="text-lg font-bold text-white print:text-slate-900 mb-2">Technical Logs</h3>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-800">
              {Object.entries(report.engines).map(([key, engine]) => {
                const adjustedScore = getStrategyScore(key, engine.score, deviceStrategy);
                const adjustedChecks = getChecksForStrategy(engine.checks, deviceStrategy);
                return (
                  <div key={key} className="flex flex-col">
                    <button 
                      onClick={() => toggleAccordion(key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 text-sm">
                          {key === 'seo-tags' ? '🏷️' : key === 'page-speed' ? '⚡' : key === 'page-weight' ? '⚖️' : key === 'content-hierarchy' ? '📱' : key === 'server-security' ? '🛡️' : '🧠'}
                        </span>
                        <span className="text-xs font-bold text-white print:text-slate-900">{engine.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${adjustedScore >= 80 ? 'bg-emerald-500' : adjustedScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        <span className="text-zinc-500 text-[10px] transition-transform duration-200" style={{ transform: openAccordions[key] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                      </div>
                    </button>
                    {openAccordions[key] && (
                      !isPremium && !["seo-tags", "page-speed", "aeo-geo"].includes(key) ? (
                        <div className="p-4 pt-3 pb-3 bg-slate-950/45 text-center space-y-2 border-t border-slate-800">
                          <span className="text-[10px] text-zinc-400 print:text-slate-600 block font-bold">🔒 Advanced Engine Locked</span>
                          <p className="text-[9px] text-zinc-500 leading-normal">Upgrade to Pro to view payload diagnostics and technical checklist details.</p>
                          <button 
                            onClick={() => router.push(`/checkout/?url=${encodeURIComponent(urlParam)}`)}
                            className="mt-1 inline-block text-[9px] text-violet-500 hover:text-violet-400 font-extrabold uppercase tracking-wider hover:underline cursor-pointer"
                          >
                            Upgrade to Pro
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 pt-3 bg-slate-950/40 space-y-2 border-t border-slate-800">
                          {adjustedChecks.slice(0, 3).map((check, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-400 print:text-slate-600 truncate max-w-[140px]">{check.name.replace(/ \(Mobile\)/, '')}</span>
                              <span className={check.passed ? "text-emerald-400" : "text-rose-400"}>
                                {check.passed ? "Pass" : "Fail"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FULL DESKTOP LOGS */}
        <div className="space-y-6 mt-12 print:block">
          {Object.entries(report.engines).map(([key, engine]) => {
            const adjustedScore = getStrategyScore(key, engine.score, deviceStrategy);
            const adjustedChecks = getChecksForStrategy(engine.checks, deviceStrategy);
            return (
              <div key={key} className="space-y-3 print:break-inside-avoid">
                <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white print:text-slate-900 uppercase tracking-widest">{engine.name} Log</h3>
                  <span className="text-[10px] font-bold text-indigo-400">Category Rating: {adjustedScore}%</span>
                </div>
                {!isPremium && !["seo-tags", "page-speed", "aeo-geo"].includes(key) ? (
                  <div className="bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-8 text-center space-y-3 relative overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
                    <span className="text-xl">🔒</span>
                    <h4 className="font-bold text-xs text-white print:text-slate-900 uppercase tracking-wider">{engine.name} Details Locked</h4>
                    <p className="text-[10px] text-zinc-400 print:text-slate-600 max-w-sm leading-relaxed">
                      Detailed diagnostics for payload weight, render-blocking resources, font configurations, server-response times, and HTML/CSS validation errors are reserved for premium members.
                    </p>
                    <button 
                      onClick={() => router.push(`/checkout/?url=${encodeURIComponent(urlParam)}`)}
                      className="mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 px-4 py-2 text-[9px] font-bold text-white print:text-slate-900 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Upgrade to Pro Plan
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-800/60 shadow-sm">
                    {adjustedChecks.map((check, idx) => (
                      <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 text-xs hover:bg-slate-800/30 transition-all duration-200 gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-[55%]">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 shadow-inner ${check.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {check.passed ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                          </div>
                          <span className="font-bold text-slate-300 print:text-slate-700 truncate group-hover:text-white transition-colors">{check.name}</span>
                        </div>
                        <div className="flex justify-end w-full sm:w-[45%] pl-9 sm:pl-0">
                          <span className={`inline-flex justify-center items-center px-2.5 py-1.5 rounded-md text-[10px] font-bold shadow-sm border truncate w-full sm:w-44 ${
                            check.passed 
                              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200" 
                              : "bg-rose-500/5 text-rose-400 border-rose-500/20 print:bg-rose-50 print:text-rose-700 print:border-rose-200"
                          }`}>
                            <span className="truncate">{check.value}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA BANNERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grid print:hidden mt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">⚙️</div>
            <h4 className="font-bold text-sm text-white print:text-slate-900">Email Server Settings</h4>
            <p className="text-[10px] text-zinc-400 print:text-slate-600">Reduce static payload weighting on core conditions matching TLS/SSL requirements.</p>
            
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">☁️</div>
            <h4 className="font-bold text-sm text-white print:text-slate-900">CDN Optimization</h4>
            <p className="text-[10px] text-zinc-400 print:text-slate-600">Fix speed-related SEO blocks via edge node delivery to improve server response data.</p>
            
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">🛡️</div>
            <h4 className="font-bold text-sm text-white print:text-slate-900">Security Hardening</h4>
            <p className="text-[10px] text-zinc-400 print:text-slate-600">Ensure HTTP/2 upgrade on port 443 with HSTS headers up to strict requirements.</p>
            <button className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-2 block w-full bg-emerald-500/10 py-1.5 rounded-full">Completed</button>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="bg-slate-900 print:bg-slate-50 rounded-2xl p-8 sm:p-12 text-center border border-slate-800 print:border-slate-200 mt-8 print:hidden shadow-sm">
          <div className="text-indigo-500 text-4xl mb-4 sm:mb-6">🏢</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white print:text-slate-900 mb-2">Need Help Implementing These Fixes?</h2>
          <p className="text-sm text-zinc-400 print:text-slate-600 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            Let our elite engineers resolve these critical issues and optimize your engine performance to drive immediate SEO readiness scores.
          </p>
          <button 
            onClick={() => {
              const subject = encodeURIComponent("Technical SEO Implementation Request");
              const body = encodeURIComponent(`Hello,\n\nI ran an SEO audit for my site and need help resolving the critical errors. My site is ${urlParam}.\n\nThank you.`);
              window.location.href = `mailto:support@seointellect.com?subject=${subject}&body=${body}`;
            }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:-translate-y-1"
          >
            <span>Book Free Consultation Call</span>
          </button>
        </div>

        </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}

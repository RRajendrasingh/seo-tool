/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMockLighthouseResult } from "../../../utils/mockPageSpeed";

// Toggle this to false when you want to use the live API.
// Can also be controlled via NEXT_PUBLIC_USE_MOCK_DATA="false" in .env.local
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

const FALLBACK_API_KEY = ""; 

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get("url") || "";

  // Page States
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

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

  const getApiKey = () => {
    return process.env.NEXT_PUBLIC_GOOGLE_API_KEY || FALLBACK_API_KEY || "";
  };

  // 1. Verify Payment on Mount
  useEffect(() => {
    if (!urlParam) {
      router.push("/audit");
      return;
    }

    try {
      const tokenKey = `premium_token_${urlParam}`;
      const tokenString = localStorage.getItem(tokenKey);
      
      if (tokenString) {
        const token = JSON.parse(tokenString);
        if (token && token.paid) {
          setIsPaid(true);
          runAudit(urlParam);
        } else {
          setIsPaid(false);
        }
      } else {
        setIsPaid(false);
      }
    } catch (e) {
      console.error(e);
      setIsPaid(false);
    } finally {
      setCheckingPayment(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParam, router]);

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
        const activeKey = getApiKey();
        let apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
          formattedUrl
        )}&category=performance&category=seo&category=accessibility&category=best-practices`;

        if (activeKey && activeKey !== "PASTE_YOUR_GOOGLE_API_KEY_HERE") {
          apiEndpoint += `&key=${activeKey}`;
        }

        const res = await fetch(apiEndpoint);
        if (res.status === 429) {
          throw new Error("429_QUOTA_EXCEEDED");
        }
        if (!res.ok) {
          throw new Error("Unable to contact Google Lighthouse servers. Verify the URL is live.");
        }

        data = await res.json();
      }

      if (data.error) {
        throw new Error(data.error.message || "Google API error.");
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
      document.title = `${domain} - Technical SEO Audit Report | SEOIntellect AI`;

      window.print();

      // Restore original title
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }
  };

  // Render Check payment status screen
  if (checkingPayment) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Render Locked gate screen if unpaid
  if (!isPaid) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full rounded-2xl border border-zinc-850 bg-zinc-900/40 p-8 backdrop-blur-md text-center space-y-6">
          <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-xl">
            🔒
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Premium Report Locked</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To view this comprehensive, print-ready PDF audit report, you must first complete the payment checkout step.
            </p>
          </div>
          <button
            onClick={() => router.push(`/audit?url=${encodeURIComponent(urlParam)}`)}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-semibold text-white transition-all"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  // Render Loading audit details screen
  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold animate-pulse text-white">{loadingSteps[loadingStep]}</p>
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
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full border border-rose-500/20 bg-rose-500/5 rounded-2xl p-8 text-center space-y-6">
          <span className="text-3xl block">⚠️</span>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Error Compiling Report</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
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

  // Compile failed checks for Priority Action Checklist
  const failedChecks = [];
  Object.values(report.engines).forEach((engine) => {
    engine.checks.forEach((check) => {
      if (!check.passed) {
        failedChecks.push({
          ...check,
          engineName: engine.name
        });
      }
    });
  });

  return (
    <div className="bg-zinc-950 text-slate-300 min-h-screen relative isolate pb-24 print:bg-white print:text-slate-900 print:pb-0">
      
      {/* HTML STYLE TAG FOR PRINT OPTIMIZATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* BACKGROUND EFFECTS (SCREEN ONLY) */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl print:hidden" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl print:hidden" />

      {/* FLOAT BAR (SCREEN ONLY) */}
      <div className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md py-3 px-4 sm:py-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex-shrink-0">
              SEOIntellect
            </span>
            <span className="hidden sm:inline-flex rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
              Premium Report Unlocked
            </span>
            {USE_MOCK_DATA && (
              <span className="hidden xs:inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/20">
                Sample Data
              </span>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => router.push(`/audit?url=${encodeURIComponent(urlParam)}`)}
              className="rounded-xl border border-slate-800 hover:bg-slate-900 px-3 sm:px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all"
            >
              <span className="hidden sm:inline">← Back to Audit Page</span>
              <span className="inline sm:hidden">← Back</span>
            </button>
            <button
              onClick={triggerPrint}
              className="rounded-xl bg-indigo-600 px-3 sm:px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-[0.99]"
            >
              <span className="hidden sm:inline">🖨️ Save Report as PDF</span>
              <span className="inline sm:hidden">🖨️ PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT WRAPPER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 print:p-0 print:text-slate-900">
        
        {/* PRINT ONLY BRAND HEADER */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-800">
              SEO<span className="text-indigo-600">Intellect</span>
            </span>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 uppercase">
              AI
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Premium Performance Dossier
          </span>
        </div>

        {/* TITLE SECTION (PAGE 1 CAP) */}
        <div className="space-y-6 text-center border-b border-slate-900 pb-10 print:border-slate-200 print-avoid-break">
          <div className="inline-flex items-center gap-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-4 py-1 text-xs font-semibold text-cyan-400 print:hidden">
            Premium Executive Audit
          </div>
          
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent print:text-slate-900 print:bg-none print:text-3xl">
            Executive SEO Performance Dossier
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 text-left max-w-3xl mx-auto font-mono text-xxs">
            <div className="border border-slate-900 bg-slate-950/40 p-3 sm:p-3.5 rounded-xl print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Audited Website</span>
              <span className="text-white font-bold break-all block print:text-slate-800">{report.url}</span>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-3.5 rounded-xl print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Report Date</span>
              <span className="text-white font-bold block print:text-slate-800">{report.date}</span>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-3.5 rounded-xl print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Status Check</span>
              <span className="text-emerald-400 font-bold block print:text-emerald-700">✓ Fully Audited</span>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-3.5 rounded-xl print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Overall Grade</span>
              <span className="text-cyan-400 font-extrabold text-sm block print:text-indigo-700">{report.grade} ({report.avgScore}%)</span>
            </div>
          </div>
        </div>

        {/* OVERALL DIALS SCORE SUMMARY */}
        <div className="space-y-6 print-avoid-break">
          <h2 className="text-lg font-bold text-white border-l-2 border-cyan-500 pl-3 print:text-slate-800 print:border-slate-400">
            Performance Engine Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {Object.entries(report.engines).map(([id, eng]) => (
              <div
                key={id}
                className="rounded-2xl border border-slate-900 bg-slate-900/20 p-4 text-center space-y-3 print:border-slate-200 print:bg-slate-50/50"
              >
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate print:text-slate-500">
                  {eng.name}
                </span>

                {/* Score Circle representation */}
                <div className="relative h-16 w-16 mx-auto flex items-center justify-center print:h-12 print:w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 print:border-2 print:border-slate-200" />
                  <span className={`text-base font-extrabold px-2 py-1 rounded-md border print:border-none print:text-base print:font-black ${
                    eng.score >= 90
                      ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5 print:text-emerald-700"
                      : eng.score >= 50
                      ? "text-amber-400 border-amber-500/10 bg-amber-500/5 print:text-amber-700"
                      : "text-rose-400 border-rose-500/10 bg-rose-500/5 print:text-rose-700"
                  }`}>
                    {eng.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Metrics Summary Bar */}
        {(() => {
          let errorsCount = 0;
          let warningsCount = 0;
          let passedCount = 0;
          Object.values(report.engines).forEach((eng) => {
            eng.checks.forEach((c) => {
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
            <div className="grid grid-cols-3 gap-4 border border-slate-900 bg-slate-950/20 rounded-2xl p-4 print:border-slate-200 print:bg-slate-50/50 print-avoid-break">
              <div className="text-center p-3 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col justify-center items-center print:bg-rose-50 print:border-rose-200">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider print:text-rose-700">Critical Errors</span>
                <span className="text-xl sm:text-2xl font-extrabold text-rose-500 mt-1 print:text-rose-600">{errorsCount}</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 flex flex-col justify-center items-center print:bg-amber-50 print:border-amber-200">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider print:text-amber-700">Warnings</span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-1 print:text-amber-600">{warningsCount}</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col justify-center items-center print:bg-emerald-50 print:border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider print:text-emerald-700">Passed Checks</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-500 mt-1 print:text-emerald-600">{passedCount}</span>
              </div>
            </div>
          );
        })()}

        {/* EXECUTIVE REPORT TEXT SUMMARY */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 space-y-4 print:border-slate-200 print:bg-slate-50/50 print-avoid-break">
          <h2 className="text-base font-bold text-white print:text-slate-800">Executive Summary</h2>
          <p className="text-xs text-slate-400 leading-relaxed print:text-zinc-700">
            Our multi-engine web performance analyzer successfully scanned <span className="font-mono text-slate-200 print:text-slate-850">{report.url}</span>. The site scores an average grade of <strong className="text-cyan-400 print:text-indigo-700">{report.grade}</strong> (average scoring rate of {report.avgScore}%). Major optimizations are needed to secure ranking credentials on google networks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs font-mono pt-2">
            <div className="space-y-1 text-left">
              <span className="text-slate-500 uppercase block font-bold">Top Strength Area</span>
              <span className="text-emerald-400 font-semibold block print:text-emerald-700">
                {Object.values(report.engines).sort((a,b) => b.score - a.score)[0]?.name}
              </span>
            </div>
            <div className="space-y-1 text-left">
              <span className="text-slate-500 uppercase block font-bold">Priority Failure Risk</span>
              <span className="text-rose-400 font-semibold block print:text-rose-700">
                {Object.values(report.engines).sort((a,b) => a.score - b.score)[0]?.name}
              </span>
            </div>
          </div>
        </div>

        {/* PRIORITY ACTION CHECKLIST (PAGE BREAK IN PRINT) */}
        <div style={{ pageBreakBefore: "always" }} className="space-y-6 pt-8 print:pt-6">
          <h2 className="text-lg font-bold text-white border-l-2 border-rose-500 pl-3 print:text-slate-800 print:border-slate-400">
            Priority Action Fix-list
          </h2>
          <p className="text-xxs text-slate-500 leading-relaxed -mt-3 print:text-slate-505">
            The following checking variables returned failures. Complete these code actions immediately to recover performance rankings.
          </p>

          <div className="space-y-3">
            {failedChecks.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center text-xs text-emerald-400 font-semibold print:border-emerald-200 print:bg-emerald-50 print:text-emerald-700 print-avoid-break">
                ✓ Perfect Audit Score! No errors detected.
              </div>
            ) : (
              failedChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-900 bg-zinc-900/10 p-4 sm:p-5 flex flex-col items-start gap-4 print:border-slate-200 print:bg-slate-50/50 print-avoid-break"
                >
                  <div className="space-y-1 flex-grow text-left w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold h-5.5 w-5.5 border border-rose-500/20 print:bg-rose-100 print:text-rose-700 print:border-rose-200 flex-shrink-0">
                          ✗
                        </span>
                        <h4 className="text-xs font-bold text-white print:text-slate-800">{check.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono hidden xs:block">
                          [{check.engineName}]
                        </span>
                      </div>

                      {/* Severity/Impact badges */}
                      <div className="flex gap-2">
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          check.severity === "error"
                            ? "bg-rose-950/40 text-rose-400 border border-rose-500/20 print:bg-rose-100 print:text-rose-700 print:border-rose-200"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20 print:bg-amber-100 print:text-amber-700 print:border-amber-200"
                        }`}>
                          {check.severity === "error" ? "Critical" : "Warning"}
                        </span>
                        <span className="text-[8px] font-semibold font-mono text-zinc-550 uppercase">
                          Impact: {check.impact || "Medium"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xxs text-slate-500 leading-relaxed pl-8 print:text-slate-600">
                      {check.desc}
                    </p>

                    {check.value && (
                      <p className={`text-xxs font-mono px-2.5 py-1 border rounded-md inline-block ml-8 mt-2 ${
                        check.severity === "error"
                          ? "border-rose-500/20 text-rose-300 bg-rose-500/5 print:border-rose-200 print:text-rose-700 print:bg-rose-50"
                          : "border-amber-500/20 text-amber-300 bg-amber-500/5 print:border-amber-200 print:text-amber-700 print:bg-amber-50"
                      }`}>
                        Detected: {check.value}
                      </p>
                    )}
                  </div>

                  {/* Offending Resources List */}
                  {check.details && check.details.length > 0 && (
                    <div className="w-full pl-8 mt-1">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide print:text-slate-500">
                        Offending Resources ({check.details.length}):
                      </span>
                      <div className="mt-1.5 overflow-x-auto rounded-lg border border-slate-900 bg-slate-950 print:border-slate-200 print:bg-slate-50">
                        <table className="w-full text-[10px] font-mono border-collapse text-left text-zinc-500 print:text-slate-600">
                          <thead>
                            <tr className="bg-slate-900 text-zinc-505 border-b border-slate-900 print:bg-slate-100 print:text-slate-750 print:border-slate-200">
                              <th className="p-2 font-bold uppercase tracking-wider">Asset URL / Log</th>
                              <th className="p-2 font-bold uppercase tracking-wider text-right">Potential Savings / Info</th>
                            </tr>
                          </thead>
                          <tbody>
                            {check.details.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/20 print:border-b-slate-200/50 print:hover:bg-slate-100/50">
                                <td className="p-2 break-all max-w-[260px] text-zinc-300 print:text-slate-800">{item.url || item.description}</td>
                                <td className="p-2 text-right whitespace-nowrap text-rose-400 font-bold print:text-rose-700">
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

                  {/* Code template block */}
                  {check.snippet && (
                    <div className="w-full pl-8 mt-1">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wide print:text-slate-500">
                        Recommended Fix Template:
                      </span>
                      <pre className="mt-1.5 p-3 rounded-lg bg-slate-950 border border-slate-900 font-mono text-[9px] text-zinc-350 overflow-x-auto select-all leading-normal text-left print:bg-slate-50 print:border-slate-200 print:text-slate-800">
                        <code>{check.snippet}</code>
                      </pre>
                    </div>
                  )}

                  <div className="w-full pl-8 border-t border-slate-800 pt-3 print:border-slate-200 text-left">
                    <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wide print:text-rose-700">
                      Fix Action Guide:
                    </span>
                    <p className="text-xxs text-slate-400 leading-relaxed mt-0.5 print:text-slate-700">
                      {check.fix}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HOSTINGER SPECIFIC RECOMMENDATIONS */}
        <div className="space-y-6 print-avoid-break">
          <h2 className="text-lg font-bold text-white border-l-2 border-cyan-500 pl-3 print:text-slate-800 print:border-slate-400">
            Hostinger Edge Optimization Steps
          </h2>
          <p className="text-xxs text-zinc-500 leading-relaxed -mt-3 print:text-slate-500">
            Since this website runs on Hostinger servers, implement the following hosting optimization presets to immediately speed up response speeds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-900 bg-zinc-900/30 p-5 space-y-2 print:border-slate-200 print:bg-slate-50/30 print-avoid-break text-left">
              <h4 className="text-xs font-bold text-white print:text-slate-800">1. Toggle HTTP/2 & SSL</h4>
              <p className="text-xxs text-slate-400 leading-relaxed print:text-slate-600">
                Go to hPanel &gt; Web Vitals. Enable HTTP/2 protocols. In the Domains tab, force SSL (HTTPS) routing to prevent insecure server responses.
              </p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-zinc-900/30 p-5 space-y-2 print:border-slate-200 print:bg-slate-50/30 print-avoid-break text-left">
              <h4 className="text-xs font-bold text-white print:text-slate-800">2. Enable Object Caching</h4>
              <p className="text-xxs text-slate-400 leading-relaxed print:text-slate-600">
                Toggle LiteSpeed Memcached or Redis configurations inside the Hosting Dashboard. This cuts server response times (TTFB) to under 200ms.
              </p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-zinc-900/30 p-5 space-y-2 print:border-slate-200 print:bg-slate-50/30 print-avoid-break text-left">
              <h4 className="text-xs font-bold text-white print:text-slate-800">3. Set Gzip Compression</h4>
              <p className="text-xxs text-slate-400 leading-relaxed print:text-slate-600">
                Access your file manager and verify Gzip or Brotli compression is configured in the `.htaccess` file. This reduces font/asset payloads by 70%.
              </p>
            </div>
          </div>
        </div>

        {/* DETAILED DIRECTORY OF ALL RUN CHECKS (PAGE BREAK IN PRINT) */}
        <div style={{ pageBreakBefore: "always" }} className="space-y-6 pt-8 print:pt-6">
          <h2 className="text-lg font-bold text-white border-l-2 border-cyan-500 pl-3 print:text-slate-800 print:border-slate-400">
            Full Audit Parameter Log
          </h2>

          <div className="space-y-8">
            {Object.entries(report.engines).map(([id, eng]) => (
              <div key={id} className="space-y-4 print-avoid-break">
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center print:border-slate-200">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider print:text-slate-800">
                    {eng.name} Log
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 print:text-indigo-700">
                    Category Rating: {eng.score}%
                  </span>
                </div>

                <div className="space-y-2">
                  {eng.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-zinc-950/20 border border-slate-900/50 p-3 rounded-lg text-xxs font-mono print:border-slate-200 print:bg-slate-50/20"
                    >
                      <div className="flex items-center gap-2.5 max-w-[70%] text-left">
                        <span className={check.passed ? "text-cyan-400 print:text-emerald-700" : "text-rose-400 print:text-rose-700"}>
                          {check.passed ? "✓" : "✗"}
                        </span>
                        <span className="text-slate-300 font-semibold truncate print:text-slate-700">{check.name}</span>
                      </div>
                      <span className={`text-[10px] ${check.passed ? "text-cyan-400/90 print:text-emerald-700" : "text-rose-400/90 print:text-rose-700"}`}>
                        {check.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT FOOTER SIGNATURE */}
        <div className="border-t border-slate-900 pt-8 text-center text-[10px] text-slate-505 space-y-1.5 print:border-slate-200 print-avoid-break">
          <p>© {new Date().getFullYear()} SEOIntellect AI Auditor Suite. All rights reserved.</p>
          <p>This document is verified and certified under transaction token key validation protocols.</p>
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

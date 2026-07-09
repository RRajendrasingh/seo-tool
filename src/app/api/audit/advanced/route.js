import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  // BUG H-3 FIX: Require auth — prevent anonymous SSRF via server-side fetch
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    const urlObj = new URL(targetUrl);
    const origin = urlObj.origin;

    // Fetch the HTML page
    const htmlRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!htmlRes.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${htmlRes.statusText}` }, { status: 400 });
    }

    const html = await htmlRes.text();
    const $ = cheerio.load(html);

    // 1. Social Media Tags (Open Graph & Twitter)
    const ogTags = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content'),
    };

    const twitterTags = {
      card: $('meta[name="twitter:card"]').attr('content'),
      title: $('meta[name="twitter:title"]').attr('content'),
      description: $('meta[name="twitter:description"]').attr('content'),
      image: $('meta[name="twitter:image"]').attr('content'),
    };

    // 2. Advanced HTML Structure
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    
    // Simple heading skip check (e.g., if there are h3s but no h2s)
    let headingSkipError = false;
    let headingElements = [];
    if (h3Count > 0 && h2Count === 0) {
      headingSkipError = true;
      $('h3').slice(0, 5).each((_, el) => {
        headingElements.push($.html(el));
      });
    }

    // Image alt tags & Lazy loading
    const images = $('img');
    let totalImages = images.length;
    
    let missingAlt = 0;
    let missingAltElements = [];
    
    let missingLazy = 0;
    let missingLazyElements = [];
    
    images.each((_, el) => {
      const alt = $(el).attr('alt');
      const lazy = $(el).attr('loading');
      
      if (alt === undefined || alt.trim() === '') {
        missingAlt++;
        if (missingAltElements.length < 5) {
          missingAltElements.push($.html(el));
        }
      }
      
      if (lazy !== 'lazy') {
        missingLazy++;
        if (missingLazyElements.length < 5) {
          missingLazyElements.push($.html(el));
        }
      }
    });

    // 3. Language & Canonical
    const canonical = $('link[rel="canonical"]').attr('href');
    const hreflangs = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      hreflangs.push({
        lang: $(el).attr('hreflang'),
        href: $(el).attr('href')
      });
    });

    // 4. Crawlability (Robots.txt & Sitemap.xml)
    let hasRobots = false;
    let hasSitemap = false;
    try {
      const robotsRes = await fetch(`${origin}/robots.txt`, { method: "HEAD", signal: AbortSignal.timeout(3000) });
      if (robotsRes.ok) hasRobots = true;
    } catch (e) {}

    try {
      const sitemapRes = await fetch(`${origin}/sitemap.xml`, { method: "HEAD", signal: AbortSignal.timeout(3000) });
      if (sitemapRes.ok) hasSitemap = true;
    } catch (e) {}
    
    // 5. New Checks: Links, Text, Tags, Server
    // Text-to-HTML and Word Count
    const rawText = $('body').text() || "";
    const cleanText = rawText.replace(/\s+/g, " ").trim();
    const wordCount = cleanText.split(" ").filter(w => w.length > 0).length;
    const textBytes = new Blob([cleanText]).size;
    const htmlBytes = new Blob([html]).size;
    const textRatio = htmlBytes > 0 ? parseFloat(((textBytes / htmlBytes) * 100).toFixed(2)) : 0;

    // Links Profiling
    let internalLinks = 0;
    let externalLinks = 0;
    let nofollowLinks = 0;
    let genericAnchors = 0;
    
    const genericWords = ["click here", "read more", "learn more", "here", "more"];
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const rel = $(el).attr('rel') || "";
      const text = $(el).text().trim().toLowerCase();
      
      if (href.startsWith("http") && !href.includes(origin)) {
        externalLinks++;
      } else {
        internalLinks++;
      }
      
      if (rel.toLowerCase().includes("nofollow")) {
        nofollowLinks++;
      }
      
      if (genericWords.includes(text)) {
        genericAnchors++;
      }
    });

    // Icons & Iframes & Pagination
    const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    const hasAppleIcon = $('link[rel="apple-touch-icon"]').length > 0;
    const iframeCount = $('iframe').length;
    const hasPrev = $('link[rel="prev"]').length > 0;
    const hasNext = $('link[rel="next"]').length > 0;

    // Server Headers
    const serverHeader = htmlRes.headers.get("server") || null;
    const xPoweredBy = htmlRes.headers.get("x-powered-by") || null;
    const redirected = htmlRes.redirected;

    return NextResponse.json({
      social: { ogTags, twitterTags },
      structure: { 
        h1Count, h2Count, h3Count, headingSkipError, headingElements, 
        totalImages, missingAlt, missingAltElements, missingLazy, missingLazyElements,
        hasFavicon, hasAppleIcon, iframeCount 
      },
      language: { canonical, hreflangCount: hreflangs.length, hreflangs },
      crawlability: { hasRobots, hasSitemap },
      content: { wordCount, textRatio },
      links: { internalLinks, externalLinks, nofollowLinks, genericAnchors, hasPrev, hasNext },
      server: { serverHeader, xPoweredBy, redirected }
    });
  } catch (error) {
    console.error("Advanced API Error:", error);
    return NextResponse.json({ error: "Failed to run advanced audit" }, { status: 500 });
  }
}

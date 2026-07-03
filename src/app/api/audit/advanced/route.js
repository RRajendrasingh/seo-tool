import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function POST(request) {
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

    return NextResponse.json({
      social: { ogTags, twitterTags },
      structure: { h1Count, h2Count, h3Count, headingSkipError, headingElements, totalImages, missingAlt, missingAltElements, missingLazy, missingLazyElements },
      language: { canonical, hreflangCount: hreflangs.length, hreflangs },
      crawlability: { hasRobots, hasSitemap }
    });
  } catch (error) {
    console.error("Advanced API Error:", error);
    return NextResponse.json({ error: "Failed to run advanced audit" }, { status: 500 });
  }
}

export function getUrlHash(url) {
  let hash = 0;
  const str = (url || "").toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getMockLighthouseResult(targetUrl) {
  const hash = getUrlHash(targetUrl);
  
  // Deterministic score generation (same domain gets same scores)
  const getScore = (offset, min = 60, max = 99) => {
    return min + ((hash + offset) % (max - min + 1));
  };

  const perfScore = getScore(10, 65, 95) / 100;
  const seoScore = getScore(20, 75, 98) / 100;
  const accessScore = getScore(30, 70, 96) / 100;
  const bpScore = getScore(40, 78, 99) / 100;

  // Total byte weight between 800KB and 3.5MB
  const byteWeight = getScore(50, 800000, 3500000);

  const categories = {
    performance: { score: perfScore },
    seo: { score: seoScore },
    accessibility: { score: accessScore },
    "best-practices": { score: bpScore },
  };

  // Custom function to calculate pass/fail status
  const checkPass = (offset, probability = 0.75) => {
    const val = getScore(offset, 1, 100);
    return val <= (probability * 100);
  };

  const cleanDomain = targetUrl.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0] || "mysite.com";

  const audits = {
    "total-byte-weight": { numericValue: byteWeight },
    "document-title": { 
      score: checkPass(60, 0.8) ? 1 : 0, 
      displayValue: checkPass(60, 0.8) ? "Title is set correctly" : "Document title is missing or too generic" 
    },
    "meta-description": { 
      score: checkPass(70, 0.75) ? 1 : 0, 
      displayValue: checkPass(70, 0.75) ? "Meta description is present" : "Meta description tag is missing" 
    },
    "canonical": { 
      score: checkPass(80, 0.9) ? 1 : 0 
    },
    "link-text": { 
      score: checkPass(90, 0.85) ? 1 : null 
    },
    "is-crawlable": { 
      score: checkPass(100, 0.95) ? 1 : 0 
    },
    "html-has-lang": { 
      score: checkPass(110, 0.9) ? 1 : null 
    },
    "largest-contentful-paint": { 
      score: perfScore, 
      displayValue: `${(1.2 + (1 - perfScore) * 6).toFixed(1)} s` 
    },
    "cumulative-layout-shift": { 
      score: getScore(120, 50, 100) / 100, 
      displayValue: `${(0.01 + (1 - (getScore(120, 50, 100) / 100)) * 0.25).toFixed(3)}` 
    },
    "first-contentful-paint": { 
      score: Math.min(perfScore + 0.05, 1), 
      displayValue: `${(0.8 + (1 - perfScore) * 3).toFixed(1)} s` 
    },
    "total-blocking-time": { 
      score: Math.min(perfScore + 0.1, 1), 
      displayValue: `${Math.round((1 - perfScore) * 500)} ms` 
    },
    "speed-index": { 
      score: perfScore, 
      displayValue: `${(1.5 + (1 - perfScore) * 4).toFixed(1)} s` 
    },
    "interactive": { 
      score: perfScore, 
      displayValue: `${(1.8 + (1 - perfScore) * 6).toFixed(1)} s` 
    },
    "uses-webp-images": { 
      score: checkPass(130, 0.7) ? 1 : 0,
      details: {
        items: [
          { url: `https://${cleanDomain}/assets/images/banner.png`, totalBytes: 620000, wastedBytes: 480000 },
          { url: `https://${cleanDomain}/assets/images/product-grid.jpg`, totalBytes: 310000, wastedBytes: 245000 }
        ]
      }
    },
    "uses-optimized-images": { 
      score: checkPass(140, 0.75) ? 1 : null,
      details: {
        items: [
          { url: `https://${cleanDomain}/assets/images/heavy-hero.jpg`, totalBytes: 1540000, wastedBytes: 1200000 },
          { url: `https://${cleanDomain}/assets/images/about-team.jpg`, totalBytes: 420000, wastedBytes: 290000 }
        ]
      }
    },
    "render-blocking-resources": { 
      score: perfScore >= 0.9 ? 1 : 0,
      details: {
        items: [
          { url: `https://${cleanDomain}/assets/js/jquery-3.6.0.js`, totalBytes: 89000, wastedMs: 340 },
          { url: `https://${cleanDomain}/assets/css/fontawesome-all.css`, totalBytes: 154000, wastedMs: 220 },
          { url: `https://${cleanDomain}/assets/css/theme-core.css`, totalBytes: 48000, wastedMs: 110 }
        ]
      }
    },
    "unused-css-rules": { 
      score: checkPass(160, 0.8) ? 1 : null,
      details: {
        items: [
          { url: `https://${cleanDomain}/assets/css/bootstrap-layout.css`, totalBytes: 145000, wastedBytes: 116000 },
          { url: `https://${cleanDomain}/assets/css/theme-core.css`, totalBytes: 48000, wastedBytes: 24000 }
        ]
      }
    },
    "unused-javascript": { 
      score: checkPass(170, 0.75) ? 1 : null,
      details: {
        items: [
          { url: `https://${cleanDomain}/assets/js/jquery-3.6.0.js`, totalBytes: 89000, wastedBytes: 54000 },
          { url: `https://${cleanDomain}/assets/js/moment-timezone.js`, totalBytes: 124000, wastedBytes: 98000 }
        ]
      }
    },
    "heading-order": { 
      score: checkPass(180, 0.8) ? 1 : null 
    },
    "image-alt": { 
      score: checkPass(190, 0.7) ? 1 : 0 
    },
    "tap-targets": { 
      score: checkPass(200, 0.85) ? 1 : null 
    },
    "viewport": { 
      score: checkPass(210, 0.95) ? 1 : null 
    },
    "font-size": { 
      score: checkPass(220, 0.9) ? 1 : 0 
    },
    "color-contrast": { 
      score: checkPass(230, 0.8) ? 1 : null 
    },
    "is-on-https": { 
      score: checkPass(240, 0.95) ? 1 : 0 
    },
    "server-response-time": { 
      score: getScore(250, 50, 100) / 100, 
      displayValue: `${Math.round((1 - (getScore(250, 50, 100) / 100)) * 600 + 80)} ms` 
    },
    "no-vulnerable-libraries": { 
      score: checkPass(260, 0.9) ? 1 : 0 
    },
    "uses-http2": { 
      score: checkPass(270, 0.85) ? 1 : null 
    },
    "browser-errors": { 
      score: checkPass(280, 0.8) ? 1 : null,
      details: {
        items: [
          { description: "TypeError: Cannot read properties of undefined (reading 'init')", source: `https://${cleanDomain}/assets/js/app-dashboard.js:124` },
          { description: "Failed to load resource: net::ERR_CONNECTION_REFUSED", source: `https://api.externaltracker.net/v1/log` }
        ]
      }
    },
    "external-anchors-use-rel-noopener": { 
      score: checkPass(290, 0.9) ? 1 : null 
    },
    "crawlable-anchors": { 
      score: checkPass(300, 0.95) ? 1 : 0 
    },
    "duplicate-id-active": { 
      score: checkPass(310, 0.8) ? 1 : 0 
    },
    "doctype": { 
      score: checkPass(320, 0.95) ? 1 : 0 
    },
    "deprecations": { 
      score: checkPass(330, 0.9) ? 1 : 0 
    },
    "image-aspect-ratio": { 
      score: checkPass(340, 0.85) ? 1 : 0 
    }
  };

  return {
    lighthouseResult: {
      categories,
      audits
    }
  };
}

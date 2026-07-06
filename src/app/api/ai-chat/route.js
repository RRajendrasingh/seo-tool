import puppeteer from "puppeteer";

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Simple URL extraction regex
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,10}(?:\/[^\s]*)?)/i;
    const match = message.match(urlRegex);
    let url = null;
    let auditData = null;

    if (match) {
      url = match[0];
      // Standardize protocol
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
    }

    // If a URL was found, run a Puppeteer browser inspection in the background
    if (url) {
      let browser = null;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        
        // Wait for page load
        await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

        // Retrieve meta-tags & DOM elements
        auditData = await page.evaluate(() => {
          const title = document.title || "No Title Found";
          
          const metaDescEl = document.querySelector('meta[name="description"]');
          const description = metaDescEl ? metaDescEl.getAttribute("content") : "Missing Meta Description";
          
          const h1s = Array.from(document.querySelectorAll("h1")).map(h => h.innerText.trim()).filter(Boolean);
          
          const images = Array.from(document.querySelectorAll("img"));
          const totalImages = images.length;
          const missingAlts = images.filter(img => !img.getAttribute("alt")?.trim()).length;

          return {
            title,
            description,
            h1s: h1s.slice(0, 5),
            totalImages,
            missingAlts
          };
        });
      } catch (err) {
        console.error("Puppeteer audit failed:", err.message);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    // Construct the AI response response based on the Puppeteer crawl
    let aiResponse = "";
    if (auditData) {
      aiResponse = `🔍 **I visited ${url} using my Puppeteer browser and analyzed its SEO structure.** Here is my report:\n\n` +
        `*   **Meta Title:** "${auditData.title}" (${auditData.title.length} characters)\n` +
        `    ${auditData.title.length > 60 ? "⚠️ Title is too long (keep under 60 chars for Google)." : "✅ Length is optimal."}\n` +
        `*   **Meta Description:** "${auditData.description}"\n` +
        `    ${auditData.description === "Missing Meta Description" ? "❌ Critical error: Missing description." : auditData.description.length > 160 ? "⚠️ Description is too long (keep under 160 chars)." : "✅ Description looks good."}\n` +
        `*   **Heading Tags (H1):** ${auditData.h1s.length > 0 ? auditData.h1s.map(h => `"${h}"`).join(", ") : "❌ Missing H1 tag!"}\n` +
        `    ${auditData.h1s.length > 1 ? "⚠️ Alert: Multiple H1 tags found. Stick to a single H1 tag for optimal crawler indexation." : ""}\n` +
        `*   **Image Optimization:** Found **${auditData.totalImages} images**, and **${auditData.missingAlts} are missing alt text**.\n` +
        `    ${auditData.missingAlts > 0 ? `💡 Recommendation: Add descriptive alt attributes to the ${auditData.missingAlts} un-optimized images to build keyword relevance.` : "✅ All images optimized."}\n\n` +
        `What would you like me to rewrite or fix for you next?`;
    } else {
      // General advice or query
      const lower = message.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi")) {
        aiResponse = "Hi! I'm Sarah, your AI SEO Assistant. Give me a website link (like `example.com`), and I will launch Puppeteer to load it and run a real-time crawl analysis for you!";
      } else {
        aiResponse = "I can analyze any website for SEO. Just send me a message containing a website URL (e.g., `mysite.com`) and I will crawl the site and run an audit.";
      }
    }

    return Response.json({ response: aiResponse });
  } catch (err) {
    console.error("AI chat error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import puppeteer from "puppeteer";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

// BUG C-5 FIX: Block SSRF — internal IPs and metadata endpoints are off-limits
function isSafeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    // Block localhost, loopback, private ranges, and cloud metadata endpoints
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host === "169.254.169.254" || // AWS/GCP metadata
      host === "metadata.google.internal" ||
      parsed.protocol === "file:"
    ) {
      return false;
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function callGemini(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is unconfigured.");
  }
  
  // Try gemini-2.5-flash first, fallback to gemini-1.5-flash
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      console.warn(`Gemini model ${model} failed:`, data.error?.message || "unknown error");
    } catch (e) {
      console.warn(`Failed to connect to ${model}:`, e.message);
    }
  }
  throw new Error("All Gemini API models failed.");
}

export async function POST(req) {
  // BUG C-5 FIX: Require authentication — no anonymous access to AI + Puppeteer
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token || !verifyToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

      // BUG C-5 FIX: Block SSRF — reject internal/private URLs before launching Chrome
      if (!isSafeUrl(url)) {
        url = null; // Silently drop the URL — don't crawl internal networks
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

    // Construct prompt for Gemini
    const systemInstruction = "You are Sarah, a highly experienced and professional AI SEO Consultant. You are helping the user optimize their website. You can answer general SEO questions, analyze websites, and offer specific technical recommendations. Keep your answers concise, clear, and structured in Markdown.";
    
    let userPrompt = message;
    if (auditData) {
      userPrompt = `Website Audited: ${url}
Title: "${auditData.title}" (${auditData.title.length} characters)
Description: "${auditData.description}"
H1 Headings: ${JSON.stringify(auditData.h1s)}
Total Images: ${auditData.totalImages}, Missing Alt text: ${auditData.missingAlts}

User query: "${message}"

Analyze the audited website data above and respond directly to the user's query with actionable recommendations. Include specific call-outs for any critical errors (like missing descriptions or multiple/missing H1 tags). Keep the response engaging, conversational, and highly structured in Markdown.`;
    }

    let aiResponse = "";
    try {
      aiResponse = await callGemini(systemInstruction, userPrompt);
    } catch (err) {
      console.error("Gemini call failed, falling back:", err.message);
      // Static fallback if API fails
      if (auditData) {
        aiResponse = `🔍 **I visited ${url} using my Puppeteer browser.** Here is my report:\n\n` +
          `*   **Meta Title:** "${auditData.title}" (${auditData.title.length} characters)\n` +
          `    ${auditData.title.length > 60 ? "⚠️ Title is too long (keep under 60 chars)." : "✅ Length is optimal."}\n` +
          `*   **Meta Description:** "${auditData.description}"\n` +
          `    ${auditData.description === "Missing Meta Description" ? "❌ Critical error: Missing description." : "✅ Description looks good."}\n` +
          `*   **Heading Tags (H1):** ${auditData.h1s.length > 0 ? auditData.h1s.map(h => `"${h}"`).join(", ") : "❌ Missing H1 tag!"}\n` +
          `*   **Image alt attributes:** Found ${auditData.totalImages} images (${auditData.missingAlts} missing alt text).\n\n` +
          `What would you like me to optimize next?`;
      } else {
        aiResponse = "I can analyze any website. Send a message containing a website URL (e.g. `mysite.com`) and I will crawl the site and run an audit.";
      }
    }

    return Response.json({ response: aiResponse });
  } catch (err) {
    console.error("AI chat error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

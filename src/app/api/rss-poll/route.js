import { query } from "@/utils/db";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RSS_SOURCES } from "@/data/rssSources";

// ─── Config ───────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const CRON_SECRET   = process.env.CRON_SECRET || "";
const IMAGE_W       = 1280;
const IMAGE_H       = 675;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Fetch and parse raw RSS/Atom XML, return array of items */
async function fetchRSSItems(feedUrl) {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "SEOIntelligence RSS Bot/1.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${feedUrl} (${res.status})`);
  const xml = await res.text();

  const items = [];
  // Match <item> or <entry> blocks
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      // Try CDATA first, then plain text
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, "i"));
      if (cdataMatch) return cdataMatch[1].trim();
      const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
      return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    };
    const getAttr = (tag, attr) => {
      const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i"));
      return m ? m[1] : "";
    };

    const guid = get("guid") || get("id") || getAttr("link", "href") || get("link");
    const link = get("link") || getAttr("link", "href") || guid;
    const title = get("title");
    const pubDate = get("pubDate") || get("published") || get("updated");

    if (guid && title && link) {
      items.push({ guid, link, title, pubDate });
    }
  }
  return items;
}

/** Fetch full article HTML and extract readable text content */
async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOBot/1.0)",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();

    // Remove scripts, styles, nav, footer, aside, ads
    let cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Limit to first 4000 chars for Gemini context
    return cleaned.substring(0, 4000);
  } catch {
    return "";
  }
}

/** Rewrite article using Gemini 2.0 Flash */
async function rewriteWithGemini(title, rawContent, sourceName) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
  });

  const prompt = `You are an expert SEO journalist writing for a leading SEO tools blog. 
Rewrite the following article titled "${title}" (originally from ${sourceName}) as a fresh, engaging blog post.

STRICT RULES:
- Write in a natural, human voice — conversational but authoritative
- Use contractions (it's, you'll, we've, don't)
- Vary sentence lengths — mix short punchy lines with longer explanations
- Add your own editorial perspective ("In our view...", "What this means for you...", "Here's the thing...")
- NEVER use: "In conclusion", "It's worth noting", "Delve into", "Certainly", "Moreover", "Furthermore", "Leverage"
- Ground abstract points with real examples
- Structure with proper H2/H3 headings using HTML tags
- Output VALID HTML only (h2, h3, p, ul, li, strong, em tags)
- Aim for 500-700 words
- At the end, add one paragraph that ties the insight back to the reader's SEO strategy
- DO NOT mention the original source or that this is a rewrite

SOURCE CONTENT:
${rawContent}

OUTPUT: HTML blog post content only (no <html>, <body>, or markdown).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

/** Build a Pollinations.ai image URL (no API key needed, 1280×675) */
function buildImageUrl(title) {
  const prompt = `Professional blog cover image for an SEO article titled: "${title}". Modern tech aesthetic, dark gradient background with glowing violet and cyan accents, abstract data visualization, search engine icons, clean typography. No text overlay. Ultra HD, 16:9 ratio.`;
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${IMAGE_W}&height=${IMAGE_H}&nologo=true&seed=${Date.now()}`;
}

/** Generate a URL slug from a title */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 80);
}

/** Estimate read time from word count */
function readTime(content) {
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 225))} min read`;
}

// ─── Ensure tables exist ──────────────────────────────────────────────────
async function ensureTables() {
  // Add status column if it doesn't exist yet
  try {
    await query(`ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'published'`);
  } catch {
    // Column already exists — ignore
  }

  // Create rss_seen deduplication table
  await query(`
    CREATE TABLE IF NOT EXISTS rss_seen (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guid VARCHAR(512) NOT NULL UNIQUE,
      source_url VARCHAR(255),
      seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// ─── Main Handler ─────────────────────────────────────────────────────────
export async function GET(request) {
  // Security: verify CRON_SECRET header (Vercel sends this automatically)
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (
    CRON_SECRET &&
    !isVercelCron &&
    authHeader !== `Bearer ${CRON_SECRET}` &&
    cronHeader !== CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { processed: 0, skipped: 0, errors: [], draftsCreated: [] };

  try {
    await ensureTables();

    for (const source of RSS_SOURCES) {
      let items = [];
      try {
        items = await fetchRSSItems(source.url);
      } catch (err) {
        results.errors.push(`RSS fetch error (${source.name}): ${err.message}`);
        continue;
      }

      // Process only the 3 most recent items from each source per poll cycle
      const recentItems = items.slice(0, 3);

      for (const item of recentItems) {
        // Skip if already seen
        const seen = await query("SELECT id FROM rss_seen WHERE guid = ?", [item.guid]);
        if (seen && seen.length > 0) {
          results.skipped++;
          continue;
        }

        try {
          // 1. Fetch article content
          const rawContent = await fetchArticleContent(item.link);
          if (!rawContent || rawContent.length < 100) {
            results.skipped++;
            await query("INSERT INTO rss_seen (guid, source_url) VALUES (?, ?)", [item.guid, source.url]);
            continue;
          }

          // 2. Rewrite with Gemini
          const rewrittenHTML = await rewriteWithGemini(item.title, rawContent, source.name);

          // 3. Build image URL
          const imageUrl = buildImageUrl(item.title);

          // 4. Generate unique slug
          const baseSlug = slugify(item.title);
          let finalSlug = baseSlug;
          const existing = await query("SELECT id FROM posts WHERE slug = ?", [finalSlug]);
          if (existing && existing.length > 0) {
            finalSlug = `${baseSlug}-${Date.now()}`;
          }

          // 5. Save as DRAFT post
          const postId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
          const desc = rawContent.replace(/<[^>]+>/g, " ").substring(0, 200).trim() + "...";

          await query(
            "INSERT INTO posts (id, slug, title, `desc`, content, category, date, readTime, author, featuredImage, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              postId,
              finalSlug,
              item.title,
              desc,
              rewrittenHTML,
              source.category,
              dateStr,
              readTime(rewrittenHTML),
              source.author,
              imageUrl,
              0,
              "draft",
            ]
          );

          // 6. Mark guid as seen
          await query("INSERT INTO rss_seen (guid, source_url) VALUES (?, ?)", [item.guid, source.url]);

          results.processed++;
          results.draftsCreated.push({ title: item.title, slug: finalSlug, source: source.name });
        } catch (err) {
          results.errors.push(`Processing error (${item.title}): ${err.message}`);
          // Still mark as seen to avoid retry loops on bad articles
          try {
            await query("INSERT IGNORE INTO rss_seen (guid, source_url) VALUES (?, ?)", [item.guid, source.url]);
          } catch {}
        }
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("RSS Poll failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

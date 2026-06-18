import { query } from "@/utils/db";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

// ─── Config ───────────────────────────────────────────────────────────────
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
  // Match <item>, <entry>, or <url> blocks
  const itemRegex = /<(?:item|entry|url)>([\s\S]*?)<\/(?:item|entry|url)>/g;
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

    const guid = get("guid") || get("id") || get("loc") || getAttr("link", "href") || get("link");
    const link = get("link") || getAttr("link", "href") || get("loc") || guid;
    const title = get("title") || get("news:title") || get("image:title");
    const pubDate = get("pubDate") || get("published") || get("updated") || get("lastmod") || get("news:publication_date");

    if (guid && title && link) {
      items.push({ guid, link, title, pubDate });
    }
  }
  return items;
}

/** Fetch full article HTML and sanitize it to keep formatting and images */
async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOBot/1.0)",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();

    // Try to extract the main article body to avoid nav/footers
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const coreHtml = articleMatch ? articleMatch[1] : (mainMatch ? mainMatch[1] : html);

    // Sanitize and keep safe HTML tags including images and headings
    const cleanHtml = sanitizeHtml(coreHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption' ]),
      nonTextTags: [ 'style', 'script', 'textarea', 'noscript', 'header', 'footer', 'nav', 'aside', 'form', 'iframe', 'svg', 'button' ],
      exclusiveFilter: function(frame) {
        if (frame.tag === 'div' && frame.attribs.class) {
           const cls = frame.attribs.class.toLowerCase();
           if (cls.match(/(?:^|\s|-|_)(nav|menu|footer|sidebar|widget|header|social|share)(?:$|\s|-|_)/)) {
              return true;
           }
        }
        if (frame.tag === 'div' && frame.attribs.id) {
           const id = frame.attribs.id.toLowerCase();
           if (id.match(/(?:^|\s|-|_)(nav|menu|footer|sidebar|widget|header|social|share)(?:$|\s|-|_)/)) {
              return true;
           }
        }
        return false;
      },
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height'],
        'a': ['href', 'title', 'target']
      }
    });

    return cleanHtml.trim();
  } catch (err) {
    console.error("Fetch article error:", err);
    return "";
  }
}

/** Return a static dummy image (1280x675) instead of AI generation */
function buildImageUrl(title) {
  return `https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1280&q=80&auto=format&fit=crop`;
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
  // Security: block unauthorized external requests when CRON_SECRET is configured.
  // Vercel Cron, same-origin browser calls (admin panel), and no-secret local dev are always allowed.
  if (CRON_SECRET) {
    const authHeader   = request.headers.get("authorization");
    const cronHeader   = request.headers.get("x-cron-secret");
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    const origin       = request.headers.get("origin") || "";
    const referer      = request.headers.get("referer") || "";
    const host         = request.headers.get("host") || "";

    // Allow if: Vercel Cron, correct secret header, or same-origin request (admin panel)
    const isSameOrigin =
      origin.includes(host) ||
      referer.includes(host) ||
      origin === "" || // server-side / curl with no origin
      host.includes("localhost");

    const hasValidSecret =
      authHeader === `Bearer ${CRON_SECRET}` || cronHeader === CRON_SECRET;

    if (!isVercelCron && !hasValidSecret && !isSameOrigin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = { processed: 0, skipped: 0, errors: [], draftsCreated: [] };

  try {
    await ensureTables();

    // Fetch dynamic sources from the database
    const dbSources = await query("SELECT * FROM rss_sources");
    if (!dbSources || dbSources.length === 0) {
      return NextResponse.json({ success: true, message: "No RSS sources configured in database." });
    }

    for (const source of dbSources) {
      let items = [];
      try {
        items = await fetchRSSItems(source.url);
      } catch (err) {
        results.errors.push(`RSS fetch error (${source.name}): ${err.message}`);
        continue;
      }

      // Sort items by date descending to get the newest first
      items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      let processedCount = 0;
      for (const item of items) {
        if (processedCount >= 10) break;

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

          // 2. We bypass the AI entirely and use the exact sanitized HTML content
          const rewrittenHTML = rawContent;

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
          // Truncate desc cleanly by extracting text from HTML
          const textOnly = rawContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          let desc = textOnly.split(/\s+/).slice(0, 25).join(" ");
          if (textOnly.split(/\s+/).length > 25) desc += "...";

          await query(
            "INSERT INTO posts (id, slug, title, `desc`, content, category, date, readTime, author, featuredImage, featured, status, source_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              postId,
              finalSlug,
              item.title,
              desc,
              rewrittenHTML,
              source.category,
              dateStr,
              readTime(rewrittenHTML),
              "Martin",
              imageUrl,
              0,
              "draft",
              source.name,
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
        processedCount++;
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("RSS Poll failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { query } from "@/utils/db";
import { NextResponse } from "next/server";
import { hashPassword } from "@/utils/auth";

export async function GET() {
  try {
    // 0. Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        full_name VARCHAR(255),
        auth_provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        subscription_tier VARCHAR(50) DEFAULT 'free',
        allowed_quota INT DEFAULT 1,
        stripe_customer_id VARCHAR(255),
        agency_name VARCHAR(255),
        agency_logo_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 0.1 Create monitored_domains table
    await query(`
      CREATE TABLE IF NOT EXISTS monitored_domains (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        cms_platform VARCHAR(100),
        business_niche VARCHAR(100),
        target_audience VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 0.2 Create audit_history table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_history (
        id VARCHAR(50) PRIMARY KEY,
        domain VARCHAR(255) NOT NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        performance_score INT NOT NULL,
        seo_score INT NOT NULL,
        accessibility_score INT NOT NULL,
        best_practices_score INT NOT NULL,
        html_quality_score INT DEFAULT 0,
        avg_score INT DEFAULT 0,
        grade VARCHAR(10) DEFAULT 'Pending',
        full_report_json LONGTEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 1. Create posts table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(50) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        \`desc\` TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        readTime VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        featuredImage LONGTEXT,
        featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'published',
        source_name VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create leads table
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        website VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        seoScore INT NOT NULL DEFAULT 0,
        grade VARCHAR(10) NOT NULL DEFAULT 'Pending',
        status VARCHAR(50) NOT NULL DEFAULT 'New',
        packageRequest VARCHAR(100) NOT NULL DEFAULT 'Free Audit',
        amountPaid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        notes TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create uploads table
    await query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id VARCHAR(50) PRIMARY KEY,
        data LONGTEXT NOT NULL,
        mimeType VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Add status column to posts (safe migration — ignored if already exists)
    try {
      await query("ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'published'");
    } catch { /* column already exists */ }

    // 4b. Add report_data column to leads (stores full audit JSON snapshot — safe migration)
    try {
      await query("ALTER TABLE leads ADD COLUMN report_data LONGTEXT");
    } catch { /* column already exists */ }

    // 4c. Add source_name column to posts (safe migration)
    try {
      await query("ALTER TABLE posts ADD COLUMN source_name VARCHAR(255)");
    } catch { /* column already exists */ }

    // 5. Create rss_seen table for Auto-Draft deduplication
    await query(`
      CREATE TABLE IF NOT EXISTS rss_seen (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guid VARCHAR(512) NOT NULL UNIQUE,
        source_url VARCHAR(255),
        seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Pre-seed default blog posts if table is empty
    const postsCount = await query("SELECT COUNT(*) as count FROM posts");
    if (postsCount && postsCount[0] && postsCount[0].count === 0) {
      const defaultPosts = [
        {
          id: "post_1",
          slug: "google-core-update-2026",
          title: "Google Core Update 2026: Shift Towards Site Speed & Authority",
          desc: "Google's latest search core update emphasizes user experiences, highlighting page performance, layout shifts, and genuine domain authority. Learn how to protect your rankings.",
          content: "<h2>What Changed in the 2026 Core Update?</h2><p>Google's 2026 Core Update places a heavy emphasis on <strong>real user experience signals</strong>, including Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and genuine topical authority measured through backlink quality and content depth.</p><h3>Key Signals Affected</h3><ul><li>Page load speed below 2.5 seconds LCP</li><li>Mobile-first indexing compliance</li><li>E-E-A-T (Experience, Expertise, Authority, Trust)</li><li>Removal of thin or AI-spun content</li></ul><p>Sites that had previously ranked with lightweight content are seeing significant drops. Focus on creating comprehensive, expert-written guides that genuinely answer user intent.</p><h3>How to Recover</h3><p>Run a full technical audit using our free SEO Audit tool, identify slow-loading assets, and publish long-form content (1,500+ words) for your target keyword clusters.</p>",
          category: "Core Updates",
          date: "June 08, 2026",
          readTime: "5 min read",
          author: "Sarah Jenkins",
          featuredImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
          featured: 1
        },
        {
          id: "post_2",
          slug: "ai-search-overviews",
          title: "AI Search Overviews: How to Optimize for LLM Retrieval",
          desc: "Generative AI is changing search dynamics. Learn how search engines extract snippets and how to format your content to be cited in AI overviews.",
          content: "<h2>The Rise of AI Search Overviews</h2><p>Google's AI Overviews (formerly SGE) and Perplexity AI are now surfacing content directly in SERP answers.</p><h3>What Makes Content LLM-Friendly?</h3><ul><li>Direct, question-answer formatted headings</li><li>Structured schema markup (FAQ, HowTo, Article)</li><li>Short, factual sentences under 20 words</li><li>Citing credible external sources with hyperlinks</li></ul><h3>AEO Strategy Checklist</h3><p>Start by identifying your top 10 questions from Google Search Console. Rewrite the corresponding page sections as direct Q&amp;A pairs with concise, confident answers. Then deploy <strong>FAQ schema JSON-LD</strong> blocks to signal to AI crawlers.</p>",
          category: "AI Search",
          date: "June 05, 2026",
          readTime: "4 min read",
          author: "Martin",
          featuredImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
          featured: 0
        },
        {
          id: "post_3",
          slug: "multi-location-local-seo",
          title: "The Ultimate Local SEO Checklist for Multi-Location Businesses",
          desc: "Managing SEO across dozens of locations in the US, UK, and India? Here is the schema markup, directory listings, and landing page templates you need.",
          content: "<h2>Why Multi-Location SEO is Different</h2><p>Each city you target needs its own <strong>dedicated landing page</strong> with unique, locally-relevant content.</p><h3>Essential Checklist</h3><ul><li>Unique H1 including city + service keyword</li><li>LocalBusiness JSON-LD schema per location</li><li>Google Business Profile optimized per location</li><li>NAP (Name, Address, Phone) consistency across all directories</li><li>Local citation building on Yelp, Justdial, TrustPilot</li></ul>",
          category: "Local SEO",
          date: "May 28, 2026",
          readTime: "3 min read",
          author: "Martin",
          featuredImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
          featured: 0
        },
        {
          id: "post_4",
          slug: "static-site-core-web-vitals",
          title: "How Static Site Exports Boost Core Web Vitals to 99+",
          desc: "A technical walkthrough on using Next.js Static Export to eliminate server response delays and hit near-perfect Lighthouse scores automatically.",
          content: "<h2>Why Static HTML Wins on Speed</h2><p>Static HTML pages are <strong>pre-built and served from a CDN edge</strong>, reducing TTFB to under 50ms.</p><h3>Lighthouse Score Impact</h3><ul><li>TTFB drops from 600ms to 40ms</li><li>LCP improves from 3.2s to 0.8s</li><li>Overall Performance score: 55 to 97+</li></ul>",
          category: "Technical Guides",
          date: "May 20, 2026",
          readTime: "3 min read",
          author: "Vikram Mehta",
          featuredImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
          featured: 0
        },
        {
          id: "post_5",
          slug: "google-business-profile-proximity",
          title: "Optimizing Google Business Profile for Proximity Rankings",
          desc: "Proximity is a critical ranking factor for mobile map results. See how localized review campaigns and category stacking can improve map visibility.",
          content: "<h2>Understanding Proximity in Local Pack Rankings</h2><p>Google's local 3-pack rankings are determined by three core signals: <strong>Relevance</strong>, <strong>Distance</strong>, and <strong>Prominence</strong>.</p><h3>GBP Optimization Tactics</h3><ul><li>Select the most specific primary category</li><li>Add 3-5 secondary service categories</li><li>Upload 10+ high-quality photos with geo-tagged metadata</li><li>Post weekly Google Business updates</li><li>Generate consistent 4.8+ star reviews</li></ul>",
          category: "Local SEO",
          date: "May 15, 2026",
          readTime: "3 min read",
          author: "Martin",
          featuredImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80",
          featured: 0
        }
      ];

      for (const post of defaultPosts) {
        await query(
          "INSERT INTO posts (id, slug, title, `desc`, content, category, date, readTime, author, featuredImage, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [post.id, post.slug, post.title, post.desc, post.content, post.category, post.date, post.readTime, post.author, post.featuredImage, post.featured]
        );
      }
    }

    // 7. Seed test users
    const testUsers = [
      {
        id: "usr_free1234567890abcdef0123456",
        email: "free@test.com",
        name: "Free Test User",
        password: "Password123!",
        tier: "free",
        status: "inactive",
        agency_name: null
      },
      {
        id: "usr_weekly1234567890abcdef01234",
        email: "weekly@test.com",
        name: "Weekly Pro Test User",
        password: "Password123!",
        tier: "weekly",
        status: "active",
        agency_name: null
      },
      {
        id: "usr_agency1234567890abcdef01234",
        email: "agency@test.com",
        name: "Agency Owner Test User",
        password: "Password123!",
        tier: "agency",
        status: "active",
        agency_name: "Apex Marketing Group"
      }
    ];

    for (const u of testUsers) {
      const existing = await query("SELECT id FROM users WHERE email = ?", [u.email]);
      if (existing.length === 0) {
        const hash = await hashPassword(u.password);
        await query(
          `INSERT INTO users (id, email, password_hash, full_name, auth_provider, subscription_tier, subscription_status, agency_name) 
           VALUES (?, ?, ?, ?, 'local', ?, ?, ?)`,
          [u.id, u.email, hash, u.name, u.tier, u.status, u.agency_name]
        );
      }
    }

    return NextResponse.json({ success: true, message: "Hostinger SQL Tables initialized successfully, default posts and test users seeded." });
  } catch (error) {
    console.error("Database initialization failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

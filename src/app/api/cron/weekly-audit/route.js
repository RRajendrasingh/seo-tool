import { NextResponse } from "next/server";
import { query } from "@/utils/db";
import { sendEmail } from "@/utils/mailer";

// Force max duration (60s on Vercel Hobby, more on Pro)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    // BUG H-2 FIX: Accept secret ONLY via Authorization header — never via URL query param
    // (URL params get logged by Vercel, CDN, proxies, and browser history)
    const providedSecret = authHeader ? authHeader.split(" ")[1] : null;
    
    if (!providedSecret || providedSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized access to Cron Job." }, { status: 401 });
    }

    // 1. Fetch all currently monitored domains
    // We join with users to verify they STILL have an active Pro/Agency/Enterprise plan
    const monitoredDomains = await query(`
      SELECT l.id, l.email, l.website, l.seoScore as previousScore
      FROM leads l
      JOIN users u ON l.email = u.email
      WHERE l.is_monitored = 1 
      AND u.subscription_tier IN ('weekly', 'agency', 'multi')
    `);

    if (!monitoredDomains || monitoredDomains.length === 0) {
      return NextResponse.json({ message: "No active monitored domains found." });
    }

    console.log(`Starting CRON for ${monitoredDomains.length} domains...`);

    // 2. Process in batches to avoid overwhelming the Node event loop or hitting rate limits
    const BATCH_SIZE = 5; 
    let processedCount = 0;
    
    for (let i = 0; i < monitoredDomains.length; i += BATCH_SIZE) {
      const batch = monitoredDomains.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (domain) => {
        try {
          const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            domain.website.startsWith("http") ? domain.website : `https://${domain.website}`
          )}&category=seo&category=performance&category=accessibility&category=best-practices&strategy=mobile&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
          
          const response = await fetch(apiEndpoint);
          if (!response.ok) throw new Error("PageSpeed API Failed");
          
          const data = await response.json();
          const seoScore = Math.round((data.lighthouseResult?.categories?.seo?.score || 0) * 100);
          const performanceScore = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
          
          const overallScore = Math.round((seoScore + performanceScore) / 2); // basic metric
          
          // Insert a new record into leads as the new timeline entry
          const newId = "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
          await query(
            "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, is_monitored) VALUES (?, 'CRON', ?, 'CRON', ?, ?, ?, 'Completed', 'New', 'Weekly Cron', 0)",
            [newId, domain.email, domain.website, new Date().toISOString(), overallScore]
          );

          // Check if score dropped significantly (e.g. >= 5 points)
          if (domain.previousScore > 0 && (domain.previousScore - overallScore >= 5)) {
            // Send Alert Email
            const emailHtml = `
              <h2>🚨 SEO Score Alert: ${domain.website}</h2>
              <p>Your weekly background audit detected a significant drop in your SEO/Performance score.</p>
              <ul>
                <li><strong>Previous Score:</strong> <span style="color:green">${domain.previousScore}</span></li>
                <li><strong>New Score:</strong> <span style="color:red">${overallScore}</span></li>
              </ul>
              <p>Log in to your Dashboard to view the full report.</p>
            `;
            await sendEmail({
              to: domain.email,
              subject: `Alert: SEO Score Dropped for ${domain.website}`,
              html: emailHtml
            });
          }

          processedCount++;
        } catch (err) {
          console.error(`Failed auditing ${domain.website}:`, err);
        }
      });

      await Promise.all(promises);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cron job completed. Processed ${processedCount} out of ${monitoredDomains.length} domains.` 
    });

  } catch (error) {
    console.error("CRON Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

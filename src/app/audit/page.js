import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { query } from "@/utils/db";
import AuditClient from "./AuditClient";
import { Suspense } from "react";

export const metadata = {
  title: "Free AI SEO Audit Tool & Page Speed Checker | SEOIntellect",
  description: "Run a free instant website SEO audit with SEOIntellect. Analyze page speed, Core Web Vitals, HTML header structure, meta tags, and GEO/AEO alignment.",
  keywords: ["free seo audit", "website speed checker", "seo analyzer", "page speed audit", "Core Web Vitals test", "GEO audit"],
};

export default async function AuditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  let initialUser = null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const users = await query(
          "SELECT subscription_tier, subscription_status, agency_name, agency_logo_id FROM users WHERE id = ?",
          [decoded.id]
        );

        let dbDetails = {
          subscription_tier: "free",
          subscription_status: "inactive",
          agency_name: null,
          agency_logo_id: null
        };

        if (users && users.length > 0) {
          dbDetails = users[0];
        }

        const purchasedSubs = await query(
          "SELECT packageRequest, COUNT(*) as count FROM leads WHERE email = ? AND status = 'Closed Won' GROUP BY packageRequest",
          [decoded.email]
        );

        let allowedQuota = 0;
        if (purchasedSubs && purchasedSubs.length > 0) {
          for (const row of purchasedSubs) {
            if (row.packageRequest === "Premium weekly") {
              allowedQuota += row.count * 1;
            } else if (row.packageRequest === "Premium agency") {
              allowedQuota += row.count * 5;
            }
          }
        }

        if (allowedQuota === 0) {
          const tier = dbDetails.subscription_tier || "free";
          if (tier === "weekly") allowedQuota = 1;
          if (tier === "agency") allowedQuota = 5;
        }

        initialUser = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          provider: decoded.provider,
          picture: decoded.picture || null,
          subscription_tier: dbDetails.subscription_tier || "free",
          subscription_status: dbDetails.subscription_status || "inactive",
          agency_name: dbDetails.agency_name,
          agency_logo_id: dbDetails.agency_logo_id,
          allowed_quota: allowedQuota
        };
      } catch (err) {
        console.error("DB Error fetching user session:", err);
        // Fallback to basic details if DB fails
        initialUser = {
          ...decoded,
          subscription_tier: "free",
          allowed_quota: 0
        };
      }
    }
  }

  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <AuditClient initialUser={initialUser} />
    </Suspense>
  );
}

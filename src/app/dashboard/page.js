import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/utils/auth";
import DashboardClient from "./DashboardClient";
import { Suspense } from "react";

export const metadata = {
  title: "SEO & GEO Performance Dashboard | SEOIntellect AI",
  description: "Track your website's real-time SEO crawl metrics, monitor search rankings, download agency-branded PDF audits, and view weekly keyword trends.",
  keywords: ["seo dashboard", "seo performance tracker", "search monitoring tool", "white label seo dashboard"],
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    redirect("/login");
  }
  
  const user = verifyToken(token);
  if (!user) {
    redirect("/login");
  }
  
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen text-zinc-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-zinc-400 font-medium text-xs">Accessing Secure Vault...</div>
      </div>
    }>
      <DashboardClient user={user} />
    </Suspense>
  );
}

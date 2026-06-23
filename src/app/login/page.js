import LoginClient from "./LoginClient";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In to SEOIntellect AI | Access Your SEO Dashboard",
  description: "Log in to your SEOIntellect account to manage your site audits, track search score history, access PDF reports, and monitor weekly SEO metrics.",
  keywords: ["seo login", "seointellect portal", "seo monitoring account", "client seo portal"],
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen text-zinc-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-zinc-400 font-medium text-xs">Loading Security Portal...</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}

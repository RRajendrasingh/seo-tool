import AuditClient from "./AuditClient";
import { Suspense } from "react";

export const metadata = {
  title: "SEO Audit Tool - SEOIntellect",
  description: "Analyze your website SEO performance and speed.",
};

export default function AuditPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <AuditClient />
    </Suspense>
  );
}

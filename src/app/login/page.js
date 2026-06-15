import LoginClient from "./LoginClient";
import { Suspense } from "react";

export const metadata = {
  title: "Access Your Account - SEO Audit Engine",
  description: "Sign in or create a secure account to access localized search engine optimization audits and track your performance metrics.",
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

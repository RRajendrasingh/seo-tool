import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/utils/auth";
import AIChatClient from "./AIChatClient";
import { Suspense } from "react";

export const metadata = {
  title: "AI SEO Consultant Chat | SEOIntellect AI",
  description: "Chat with Sarah, our AI assistant, to run live browser crawls, audit page elements, and optimize metadata real-time.",
};

export default async function AIChatPage() {
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
        <div className="animate-pulse text-zinc-400 font-medium text-xs">Connecting to Agent Core...</div>
      </div>
    }>
      <AIChatClient user={user} />
    </Suspense>
  );
}

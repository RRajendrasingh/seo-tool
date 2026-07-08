import { Suspense } from "react";
import AuditV2Client from "./AuditV2Client";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export const metadata = {
  title: "SEO Audit V2 — Next-Gen Interface | Intellent SEO",
  description: "Experience the next generation audit interface — real-time SEO analysis with a beautiful command-center UI.",
};

export default async function AuditV2Page() {
  let initialUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) initialUser = decoded;
    }
  } catch (e) {}

  return (
    <Suspense fallback={
      <div className="bg-[#050507] min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <AuditV2Client initialUser={initialUser} />
    </Suspense>
  );
}

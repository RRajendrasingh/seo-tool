"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const urlParam = searchParams.get("url") || "";

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setTimeout(() => {
        setError("No checkout session ID found. Cannot verify transaction.");
        setVerifying(false);
      }, 0);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
        if (!res.ok) {
          throw new Error("Unable to reach verification server.");
        }
        
        const data = await res.json();
        
        if (data.success) {
          // Save successful authorization token in localStorage
          const targetUrl = data.url || urlParam;
          const token = {
            paid: true,
            transactionId: sessionId,
            date: new Date().toISOString(),
            url: targetUrl,
            email: data.metadata?.email || "",
            metadata: data.metadata
          };
          
          localStorage.setItem(`premium_token_${targetUrl}`, JSON.stringify(token));
          
          // Clear verifying spinner and trigger redirect
          setVerifying(false);
          
          const plan = data.metadata?.plan || "";
          setTimeout(() => {
            if (plan === "weekly" || plan === "agency" || targetUrl === "domain-pending" || !targetUrl) {
              router.push("/dashboard");
            } else {
              router.push(`/audit/report?url=${encodeURIComponent(targetUrl)}`);
            }
          }, 1500);
        } else {
          setError("Stripe indicates this transaction checkout is unpaid or failed.");
          setVerifying(false);
        }
      } catch (err) {
        setError(err.message || "An error occurred during payment verification.");
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, urlParam, router]);

  return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4 text-white relative isolate">
      {/* Background glow */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full rounded-2xl border border-zinc-850 bg-zinc-900/40 p-8 backdrop-blur-md text-center space-y-6">
        {verifying ? (
          <>
            <div className="relative mx-auto h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">Verifying Payment</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Contacting Stripe servers to secure your checkout session. This takes a moment...
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-xl text-rose-400">
              ✗
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Verification Failed</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => router.push("/audit")}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-semibold text-white transition-all"
            >
              Return to Audit Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-xl text-emerald-400 animate-scale-up">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white font-sans">Payment Confirmed!</h2>
              <p className="text-xs text-zinc-400">
                Premium SEO Audit report is unlocked. Redirecting you to report details...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

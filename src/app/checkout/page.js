"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const url = searchParams.get("url") || "";
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";

  // Payment method tab: 'card' | 'wallet'
  const [method, setMethod] = useState("card");

  // Input states (prefilled from lead parameters)
  const [billingName, setBillingName] = useState(name || "");
  const [billingEmail, setBillingEmail] = useState(email || "");

  // Checkout states: 'input' | 'processing' | 'success'
  const [checkoutState, setCheckoutState] = useState("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // UPI countdown timer
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const loadingSteps = [
    "Contacting secure servers...",
    "Securing transaction gateway...",
    "Authorizing payment amount $29.00...",
    "Generating premium audit credentials..."
  ];

  // If no URL is provided, redirect back to audit page
  useEffect(() => {
    if (!url) {
      router.push("/audit");
    }
  }, [url, router]);

  // Wallet countdown effect
  useEffect(() => {
    if (method !== "wallet" || timeLeft <= 0 || checkoutState !== "input") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [method, timeLeft, checkoutState]);

  // Format countdown
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Run payment processing simulation (Local Demo Bypass)
  const startPaymentSimulation = () => {
    setPaymentError(null);
    setCheckoutState("processing");
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          // Payment complete success
          setTimeout(() => {
            completeLocalCheckout();
          }, 800);
          return prev;
        }
      });
    }, 900);
  };

  // Real Stripe Checkout Trigger
  const handleStripePay = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setIsRedirecting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url, 
          name: billingName, 
          email: billingEmail, 
          phone 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout.");
      }

      if (data.url) {
        // Redirect browser to Stripe Checkout page
        window.location.href = data.url;
      } else {
        throw new Error("No redirection URL returned from Stripe.");
      }
    } catch (err) {
      console.error("Stripe Checkout failed:", err);
      setPaymentError(
        err.message.includes("STRIPE_SECRET_KEY")
          ? "Stripe API keys are not configured in your .env.local file yet. You can bypass this and run the Local Demo Simulation instead."
          : (err.message || "Failed to contact payment server. Check your connection.")
      );
      setIsRedirecting(false);
    }
  };

  const handleWalletPay = () => {
    startPaymentSimulation();
  };

  // Local bypass saving
  const completeLocalCheckout = () => {
    const token = {
      paid: true,
      transactionId: "MOCK_TXN_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      date: new Date().toISOString(),
      url: url,
      name: billingName || name,
      email: billingEmail || email,
      phone: phone
    };

    try {
      localStorage.setItem(`premium_token_${url}`, JSON.stringify(token));
    } catch (e) {
      console.error(e);
    }

    setCheckoutState("success");

    // Redirect to report
    setTimeout(() => {
      router.push(`/audit/report?url=${encodeURIComponent(url)}`);
    }, 2000);
  };

  return (
    <div className="bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative isolate flex items-center justify-center text-zinc-100">
      {/* Background radial glow */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* CHECKOUT INTERFACE CARD - Left/Main side (7 cols) */}
        <div className="md:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          
          {checkoutState === "input" && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-zinc-800 gap-4">
                <h2 className="text-lg font-bold text-white">Payment Method</h2>
                <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-850 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      method === "card"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Credit Card (Stripe)
                  </button>
                  <button
                    onClick={() => setMethod("wallet")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      method === "wallet"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Google Pay / Apple Pay (Test)
                  </button>
                </div>
              </div>

              {/* STRIPE CREDIT CARD FLOW */}
              {method === "card" && (
                <form onSubmit={handleStripePay} className="space-y-4">
                  {/* Visual Card Graphic */}
                  <div className="w-full h-40 rounded-xl bg-gradient-to-br from-violet-850 via-purple-900 to-fuchsia-850 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden border border-violet-500/25">
                    <div className="absolute -inset-y-12 -inset-x-24 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 bg-amber-400/20 rounded-md border border-amber-400/40 relative flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-400/30 rounded-xs" />
                      </div>
                      <span className="text-xxs font-extrabold tracking-widest text-white/70">
                        STRIPE SECURE
                      </span>
                    </div>

                    <div className="text-base font-mono tracking-widest text-white drop-shadow-md">
                      •••• •••• •••• ••••
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Customer</span>
                        <span className="text-xxs font-semibold uppercase tracking-wide truncate max-w-[180px] block">
                          {billingName || "Your Full Name"}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Pricing</span>
                        <span className="text-xxs font-mono font-semibold block">$29.00 USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Details (Pre-fill Stripe checkout) */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. john@business.com"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {/* Stripe key error notification */}
                  {paymentError && (
                    <div className="border border-yellow-600/30 bg-yellow-600/5 rounded-xl p-4 space-y-3 text-left">
                      <span className="text-xs font-bold text-yellow-400 block">⚠️ Stripe Gateway Offline</span>
                      <p className="text-xxs text-zinc-400 leading-relaxed">
                        {paymentError}
                      </p>
                      {paymentError.includes("keys are not configured") && (
                        <button
                          type="button"
                          onClick={startPaymentSimulation}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 rounded-lg text-xxs font-bold transition-all shadow-md"
                        >
                          Run Local Demo Simulation
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRedirecting}
                    className="w-full mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isRedirecting ? "Connecting to Stripe checkout..." : "Proceed to Secure Stripe Checkout"}
                  </button>
                </form>
              )}

              {/* WALLET FLOW */}
              {method === "wallet" && (
                <div className="space-y-6 flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center border-2 border-violet-500/20 relative">
                    {/* Countdown indicator overlay */}
                    {timeLeft <= 0 && (
                      <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4">
                        <span className="text-xl">⚠️</span>
                        <span className="text-xxs font-bold text-zinc-800 mt-1">Session Expired</span>
                        <button
                          onClick={() => setTimeLeft(300)}
                          className="mt-2 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition-all"
                        >
                          Generate New
                        </button>
                      </div>
                    )}
                    
                    {/* Simulated QR Code SVG */}
                    <svg width="150" height="150" viewBox="0 0 100 100" className="text-zinc-900">
                      <rect width="100" height="100" fill="white" />
                      
                      {/* Corner Position Detection Anchors */}
                      <rect x="5" y="5" width="25" height="25" fill="black" />
                      <rect x="8" y="8" width="19" height="19" fill="white" />
                      <rect x="12" y="12" width="11" height="11" fill="black" />

                      <rect x="70" y="5" width="25" height="25" fill="black" />
                      <rect x="73" y="8" width="19" height="19" fill="white" />
                      <rect x="77" y="12" width="11" height="11" fill="black" />

                      <rect x="5" y="70" width="25" height="25" fill="black" />
                      <rect x="8" y="73" width="19" height="19" fill="white" />
                      <rect x="12" y="77" width="11" height="11" fill="black" />

                      {/* Small anchor */}
                      <rect x="75" y="75" width="10" height="10" fill="black" />
                      <rect x="77" y="77" width="6" height="6" fill="white" />
                      <rect x="79" y="79" width="2" height="2" fill="black" />

                      {/* Dummy QR Noise Pattern */}
                      <rect x="35" y="5" width="5" height="10" fill="black" />
                      <rect x="45" y="15" width="10" height="5" fill="black" />
                      <rect x="60" y="10" width="5" height="15" fill="black" />
                      <rect x="35" y="25" width="15" height="5" fill="black" />
                      
                      <rect x="5" y="35" width="10" height="5" fill="black" />
                      <rect x="20" y="35" width="5" height="15" fill="black" />
                      <rect x="40" y="35" width="20" height="5" fill="black" />
                      <rect x="65" y="30" width="5" height="20" fill="black" />
                      <rect x="80" y="35" width="15" height="5" fill="black" />

                      <rect x="30" y="45" width="5" height="20" fill="black" />
                      <rect x="45" y="45" width="15" height="15" fill="black" />
                      <rect x="70" y="45" width="10" height="5" fill="black" />
                      <rect x="85" y="45" width="5" height="15" fill="black" />

                      <rect x="10" y="60" width="15" height="5" fill="black" />
                      <rect x="35" y="65" width="20" height="5" fill="black" />
                      <rect x="65" y="60" width="15" height="10" fill="black" />

                      <rect x="35" y="75" width="10" height="5" fill="black" />
                      <rect x="50" y="80" width="5" height="15" fill="black" />
                      <rect x="60" y="85" width="10" height="5" fill="black" />
                      <rect x="40" y="90" width="5" height="5" fill="black" />
                      
                      <rect x="80" y="90" width="15" height="5" fill="black" />
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xxs uppercase tracking-wider text-zinc-500 font-bold">
                      Scan or Tap to Pay (Local Demo)
                    </p>
                    <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed font-sans">
                      This mobile wallet code is for offline local simulation checks. Click the button below to authorize payment and unlock your report.
                    </p>
                  </div>

                  {/* Timer display */}
                  <div className="inline-flex items-center gap-2 bg-zinc-950 px-4 py-1.5 rounded-full border border-zinc-850">
                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-300">
                      Session Expires: {formatTime(timeLeft)}
                    </span>
                  </div>

                  <button
                    onClick={handleWalletPay}
                    disabled={timeLeft <= 0}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Simulate Wallet Verification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHECKOUT STATE: PROCESSING ANIMATION */}
          {checkoutState === "processing" && (
            <div className="py-16 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-b-fuchsia-500 animate-reverse-spin" />
              </div>

              <div className="space-y-3 text-center">
                <h3 className="text-sm font-bold text-white tracking-wide">Processing Local Payment</h3>
                <div className="space-y-1">
                  {loadingSteps.map((step, idx) => {
                    const isPassed = loadingStep > idx;
                    const isActive = loadingStep === idx;
                    return (
                      <div
                        key={step}
                        className={`flex items-center justify-center gap-2 text-xxs font-mono transition-opacity duration-300 ${
                          isPassed
                            ? "text-emerald-400"
                            : isActive
                            ? "text-violet-400 font-bold"
                            : "text-zinc-650 opacity-40"
                        }`}
                      >
                        <span>{isPassed ? "✓" : isActive ? "→" : "•"}</span>
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CHECKOUT STATE: SUCCESS SCREEN */}
          {checkoutState === "success" && (
            <div className="py-16 flex flex-col items-center justify-center space-y-6 min-h-[400px] animate-scale-up">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/35 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400 animate-pulse">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-white">Payment Authorized Successfully!</h3>
                <p className="text-xxs text-zinc-400 font-sans">
                  Demo Transaction completed. Token generated and saved in local storage.
                </p>
                <p className="text-xxs text-violet-400 font-mono animate-pulse pt-2">
                  Unlocking your Premium PDF Report...
                </p>
              </div>
            </div>
          )}

          {/* Secure padlock footer */}
          <div className="flex justify-center items-center gap-1.5 text-zinc-600 text-[10px] pt-6 border-t border-zinc-800/40 mt-6">
            <span>🛡️</span>
            <span>Secured encryption by Stripe & SSL standard guidelines</span>
            <span>•</span>
            <span>256-bit SSL</span>
          </div>

        </div>

        {/* ORDER SUMMARY SIDEBAR - Right side (5 cols) */}
        <div className="md:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between backdrop-blur-sm">
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500 pl-0.5">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="border border-zinc-800/80 bg-zinc-950/50 p-4 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-violet-400 block">
                    Product Item
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    Premium Multi-Engine SEO Audit
                  </h4>
                  <p className="text-xxs text-zinc-400 font-mono truncate">
                    Domain: {url}
                  </p>
                </div>

                <div className="h-[1px] bg-zinc-850" />

                <div className="space-y-1 text-left text-xxs text-zinc-500 leading-relaxed list-none">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> Full Core Web Vitals Charts
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> In-depth tag sequence analysis
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> LLM/AEO optimization checks
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> Hostinger hosting server suggestions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✓</span> Printable/Saveable PDF layout
                  </li>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2.5 px-1">
                <div className="flex justify-between text-xxs">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-zinc-300">$29.00 USD</span>
                </div>
                <div className="flex justify-between text-xxs">
                  <span className="text-zinc-500">Tax / Processing fee</span>
                  <span className="text-zinc-300">$0.00 USD</span>
                </div>
                
                <div className="h-[1px] bg-zinc-800" />

                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <span className="text-white">Total Amount</span>
                  <span className="text-violet-400 text-sm font-extrabold">$29.00 USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/40 mt-6 space-y-3 text-left">
            <span className="text-xxs uppercase tracking-wider font-bold text-zinc-500 block">
              Lead Owner Details
            </span>
            <div className="bg-zinc-950/30 border border-zinc-850/60 p-3 rounded-lg space-y-1.5 font-mono text-[10px] text-zinc-400">
              <p><span className="text-zinc-650">Name:</span> {name || "N/A"}</p>
              <p className="truncate"><span className="text-zinc-650">Email:</span> {email || "N/A"}</p>
              <p><span className="text-zinc-650">Phone:</span> {phone || "N/A"}</p>
            </div>
            
            <button
              onClick={() => router.push(`/audit?url=${encodeURIComponent(url)}`)}
              className="text-[10px] text-zinc-400 hover:text-white transition-all underline flex items-center gap-1 pt-2 cursor-pointer"
            >
              ← Cancel & return to audit dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

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
  const planParam = searchParams.get("plan") || "pack";

  // Initial plan matching parameters
  const initialPlan = planParam === "weekly" ? "weekly" : planParam === "agency" ? "agency" : planParam === "multi" ? "multi" : "single";
  
  // States
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [cmsPlatform, setCmsPlatform] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const [method, setMethod] = useState("card");
  const [billingName, setBillingName] = useState(name || "");
  const [billingEmail, setBillingEmail] = useState(email || "");

  const [checkoutState, setCheckoutState] = useState("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const getPlanPrice = () => {
    if (selectedPlan === "single") return 29;
    if (selectedPlan === "multi") return 59;
    if (selectedPlan === "weekly") return 49;
    if (selectedPlan === "agency") return 99;
    return 29;
  };

  const getPlanName = () => {
    if (selectedPlan === "single") return "Single Page PDF Unlock";
    if (selectedPlan === "multi") return "3-Page Multi-page Pack";
    if (selectedPlan === "weekly") return "Weekly Monitoring Plan";
    if (selectedPlan === "agency") return "White-Label Agency License";
    return "Premium Report";
  };

  const loadingSteps = [
    "Contacting secure servers...",
    "Securing transaction gateway...",
    `Authorizing payment amount $${getPlanPrice()}.00...`,
    "Generating premium audit credentials..."
  ];

  // Fetch session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.session) {
          setUser(data.session);
          setBillingName((prev) => prev || data.session.name || "");
          setBillingEmail((prev) => prev || data.session.email || "");
        }
      } catch (e) {
        console.error("Error fetching session:", e);
      } finally {
        setLoadingSession(false);
      }
    }
    checkSession();
  }, []);

  // Require login to purchase. Redirect to login if not authenticated.
  useEffect(() => {
    if (loadingSession) return;
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (!url) {
      router.push("/audit");
    }
  }, [url, user, loadingSession, router]);

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

  // Run payment processing simulation
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
    if (!user && (!cmsPlatform || !businessNiche || !targetAudience)) {
      setPaymentError("Please fill in the Step 1 Website Profile details first.");
      return;
    }
    setPaymentError(null);
    setIsRedirecting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: url || "domain-pending", 
          name: billingName, 
          email: billingEmail, 
          phone,
          plan: selectedPlan,
          cmsPlatform: cmsPlatform || "Not Provided",
          businessNiche: businessNiche || "Not Provided",
          targetAudience: targetAudience || "Not Provided"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout.");
      }

      if (data.url) {
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
    if (!user && (!cmsPlatform || !businessNiche || !targetAudience)) {
      setPaymentError("Please fill in the Step 1 Website Profile details first.");
      return;
    }
    startPaymentSimulation();
  };

  // Local bypass saving
  const completeLocalCheckout = async () => {
    const finalUrl = url || "domain-pending";
    const token = {
      paid: true,
      transactionId: "MOCK_TXN_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      date: new Date().toISOString(),
      url: finalUrl,
      name: billingName || name,
      email: billingEmail || email,
      phone: phone,
      plan: selectedPlan,
      cmsPlatform: cmsPlatform || "Not Provided",
      businessNiche: businessNiche || "Not Provided",
      targetAudience: targetAudience || "Not Provided"
    };

    try {
      localStorage.setItem(`premium_token_${finalUrl}`, JSON.stringify(token));
      
      // Write mock database updates
      await fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          email: billingEmail || email,
          name: billingName || name,
          plan: selectedPlan,
          cmsPlatform: cmsPlatform || "Not Provided",
          businessNiche: businessNiche || "Not Provided",
          targetAudience: targetAudience || "Not Provided"
        })
      });
    } catch (e) {
      console.error("Mock DB session synchronization failed:", e);
    }

    setCheckoutState("success");

    setTimeout(() => {
      if (selectedPlan === "weekly" || selectedPlan === "agency" || finalUrl === "domain-pending" || !finalUrl) {
        router.push("/dashboard");
      } else {
        router.push(`/audit/report?url=${encodeURIComponent(finalUrl)}`);
      }
    }, 2000);
  };

  if (loadingSession) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-100">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

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
              
              {user ? (
                /* Consolidated Account Information Card */
                <div className="space-y-4 bg-zinc-950/40 p-5 rounded-xl border border-zinc-800 text-left">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-violet-400">
                    Account Information
                  </h3>
                  <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-850 overflow-hidden">
                    <div className="h-10 w-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400 flex-shrink-0">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block font-sans truncate">
                        {user.name || "Logged In User"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate" title={user.email}>
                        {user.email}
                      </span>
                    </div>
                    <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20 flex-shrink-0">
                      Active Account
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    You are currently logged in. Your purchase will be automatically linked to this account, and subscription settings will activate immediately upon payment verification.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: Website Onboarding Profile */}
                  <div className="space-y-4 bg-zinc-950/40 p-5 rounded-xl border border-zinc-800 text-left">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-violet-400">
                      Step 1: Tell us about your website
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-semibold block">CMS Platform</label>
                        <select
                          required
                          value={cmsPlatform}
                          onChange={(e) => setCmsPlatform(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Platform</option>
                          <option value="wordpress">WordPress</option>
                          <option value="shopify">Shopify</option>
                          <option value="webflow">Webflow</option>
                          <option value="wix">Wix / Squarespace</option>
                          <option value="nextjs">Next.js / React</option>
                          <option value="custom">Custom HTML/CSS</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-semibold block">Business Niche</label>
                        <select
                          required
                          value={businessNiche}
                          onChange={(e) => setBusinessNiche(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Niche</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="local">Local Business</option>
                          <option value="saas">B2B / SaaS</option>
                          <option value="agency">Agency</option>
                          <option value="blog">Blog / Publisher</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-semibold block">Target Audience</label>
                        <select
                          required
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                        >
                          <option value="">Select Target</option>
                          <option value="local">Local City</option>
                          <option value="national">National Market</option>
                          <option value="global">International</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Choose Your Plan */}
                  <div className="space-y-3 bg-zinc-950/40 p-5 rounded-xl border border-zinc-800 text-left">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-violet-400">
                      Step 2: Choose Your Plan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === "single" ? "border-violet-500 bg-violet-600/5" : "border-zinc-850 bg-zinc-950/20"
                      }`}>
                        <input
                          type="radio"
                          name="plan"
                          value="single"
                          checked={selectedPlan === "single"}
                          onChange={() => setSelectedPlan("single")}
                          className="mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">Single Page PDF</span>
                          <span className="text-[10px] text-zinc-400 block">Unlock 1 full report PDF download.</span>
                          <span className="text-[11px] font-bold text-violet-400 block">$29 USD (one-time)</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === "multi" ? "border-violet-500 bg-violet-600/5" : "border-zinc-850 bg-zinc-950/20"
                      }`}>
                        <input
                          type="radio"
                          name="plan"
                          value="multi"
                          checked={selectedPlan === "multi"}
                          onChange={() => setSelectedPlan("multi")}
                          className="mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">3-Page Audit Pack</span>
                          <span className="text-[10px] text-zinc-400 block">Scan up to 3 core pages + PDF downloads.</span>
                          <span className="text-[11px] font-bold text-violet-400 block">$59 USD (one-time)</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === "weekly" ? "border-violet-500 bg-violet-600/5" : "border-zinc-850 bg-zinc-950/20"
                      }`}>
                        <input
                          type="radio"
                          name="plan"
                          value="weekly"
                          checked={selectedPlan === "weekly"}
                          onChange={() => setSelectedPlan("weekly")}
                          className="mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">Weekly Monitoring</span>
                          <span className="text-[10px] text-zinc-400 block">Monday morning audits & alerts.</span>
                          <span className="text-[11px] font-bold text-violet-400 block">$49 / month</span>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === "agency" ? "border-violet-500 bg-violet-600/5" : "border-zinc-850 bg-zinc-950/20"
                      }`}>
                        <input
                          type="radio"
                          name="plan"
                          value="agency"
                          checked={selectedPlan === "agency"}
                          onChange={() => setSelectedPlan("agency")}
                          className="mt-1"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">White-Label Agency</span>
                          <span className="text-[10px] text-zinc-400 block">Up to 5 domains + Custom branding (Name/Logo).</span>
                          <span className="text-[11px] font-bold text-violet-400 block">$99 / month</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Payment Method Tabs */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-zinc-800 gap-4">
                <h2 className="text-xs uppercase tracking-wider font-bold text-violet-400">
                  {user ? "Payment Method" : "Step 3: Payment Method"}
                </h2>
                <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-850 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setMethod("card")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                      method === "card"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Credit Card (Stripe)
                  </button>
                  <button
                    onClick={() => setMethod("wallet")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${
                      method === "wallet"
                        ? "bg-violet-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Wallet (Local Test)
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
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Expires</span>
                        <span className="text-xxs font-semibold tracking-wide block">MM / YY</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold block">Billing Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Cardholder full name"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold block">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xxs font-semibold text-red-400 text-left">
                      ⚠️ {paymentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRedirecting}
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isRedirecting ? (
                      <>
                        <div className="h-4.5 w-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                        <span>Redirecting to Stripe...</span>
                      </>
                    ) : (
                      <span>Redirect to Secure Stripe Checkout</span>
                    )}
                  </button>
                </form>
              )}

              {/* MOCK WALLET FLOW */}
              {method === "wallet" && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md border border-zinc-800/20 relative flex items-center justify-center">
                    {/* Simulated payment graphic */}
                    <svg width="140" height="140" viewBox="0 0 100 100">
                      <rect x="10" y="10" width="80" height="80" fill="#f8fafc" rx="8" />
                      <rect x="20" y="20" width="60" height="60" fill="none" stroke="black" strokeWidth="2" />
                      <rect x="30" y="30" width="15" height="15" fill="black" />
                      <rect x="55" y="30" width="15" height="15" fill="black" />
                      <rect x="30" y="55" width="15" height="15" fill="black" />
                      <rect x="50" y="50" width="5" height="5" fill="black" />
                      <rect x="50" y="60" width="10" height="10" fill="black" />
                      <rect x="60" y="50" width="10" height="10" fill="black" />
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

                  {paymentError && (
                    <div className="w-full p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xxs font-semibold text-red-400 text-left">
                      ⚠️ {paymentError}
                    </div>
                  )}

                  <button
                    onClick={handleWalletPay}
                    disabled={timeLeft <= 0}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-xs font-bold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
                  Demo Transaction completed. Subscription data written to mysql DB.
                </p>
                <p className="text-xxs text-violet-400 font-mono animate-pulse pt-2">
                  Unlocking your portal settings...
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
              <div className="border border-zinc-800/80 bg-zinc-950/40 p-4 rounded-xl space-y-3 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-violet-400 block">
                    Product Item
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    {getPlanName()}
                  </h4>
                  <p className="text-xxs text-zinc-400 font-mono truncate">
                    Domain: {url || "domain-pending"}
                  </p>
                </div>

                <div className="h-[1px] bg-zinc-850" />

                <div className="space-y-1 text-xxs text-zinc-500 leading-relaxed list-none">
                  {selectedPlan === "single" && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> 1-Page Detailed SEO Crawl</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Unlock PDF Generation</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Saves report to account dashboard</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Consulting call upsell CTA</li>
                    </>
                  )}
                  {selectedPlan === "multi" && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Up to 3 Core Pages audited</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Multi-page PDF Report download</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Structured entity schema checks</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Saves history under user account</li>
                    </>
                  )}
                  {selectedPlan === "weekly" && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Weekly background scan (Every Monday)</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Performance alerts sent to email</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Historical score progress charts</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Includes PDF report downloads</li>
                    </>
                  )}
                  {selectedPlan === "agency" && (
                    <>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Scan up to 5 custom domains</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Upload Agency Logo & Agency Name</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Branded PDFs without watermarks</li>
                      <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-[1px]">✓</span> Client-ready report delivery</li>
                    </>
                  )}
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2.5 px-1 text-left">
                <div className="flex justify-between text-xxs">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-zinc-300">${getPlanPrice()}.00 USD</span>
                </div>
                <div className="flex justify-between text-xxs">
                  <span className="text-zinc-500">Tax / Processing fee</span>
                  <span className="text-zinc-300">$0.00 USD</span>
                </div>
                
                <div className="h-[1px] bg-zinc-800" />

                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <span className="text-white">Total Amount</span>
                  <span className="text-violet-400 text-sm font-extrabold">${getPlanPrice()}.00 USD</span>
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
              onClick={() => {
                router.push(`/audit?url=${encodeURIComponent(url)}&canceled=true`);
              }}
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

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation feedback
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Google SSO consent popup states (Mock mode)
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleVerifying, setGoogleVerifying] = useState(false);

  // Real Google OAuth states
  const [googleClientReady, setGoogleClientReady] = useState(false);
  const googleBtnRef = useRef(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Derive password strength from password input dynamically
  const passwordStrength = (() => {
    if (!password) {
      return {
        length: false,
        lowercase: false,
        uppercase: false,
        digit: false,
        special: false,
        score: 0,
      };
    }

    const length = password.length >= 10;
    const lowercase = /[a-z]/.test(password);
    const uppercase = /[A-Z]/.test(password);
    const digit = /[0-9]/.test(password);
    const special = /[^a-zA-Z0-9]/.test(password);
    const score = [length, lowercase, uppercase, digit, special].filter(Boolean).length;

    return { length, lowercase, uppercase, digit, special, score };
  })();

  // 1. Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.session) {
          router.push(redirectUrl);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    checkSession();
  }, [router, redirectUrl]);

  // 2. Callback response for real Google Auth
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to authenticate with Google.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Authenticated via Google! Redirecting...");
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMessage("Secure connection to authentication servers failed.");
      setLoading(false);
    }
  }, [router, redirectUrl]);

  // 3. Load Google SSO library dynamically if CLIENT_ID is present
  useEffect(() => {
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleClientReady(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script
      const scriptNode = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptNode) {
        scriptNode.remove();
      }
    };
  }, [clientId]);

  // 4. Render real Google button if script is loaded
  useEffect(() => {
    if (!googleClientReady || !clientId || !googleBtnRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    } catch (err) {
      console.error("Failed to render Google login button:", err);
    }
  }, [googleClientReady, clientId, isRegisterMode, handleGoogleCredentialResponse]);


  // 5. Submit Registration Form
  const handleManualRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (passwordStrength.score < 5) {
      setErrorMessage("Password does not meet all security complexity requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMessage("A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  // 6. Submit Login Form
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Log in successful! Redirecting...");
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMessage("A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  // 7. Simulated mock Google consent select
  const handleGoogleAccountSelect = async (account) => {
    setGoogleVerifying(true);
    setErrorMessage("");

    try {
      const mockIdToken = `MOCK_GOOGLE_TOKEN_${account.providerId}`;
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: mockIdToken, email: account.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to authenticate via Google.");
        setGoogleVerifying(false);
        setShowGooglePopup(false);
        return;
      }

      setSuccessMessage("Authenticated via Google! Redirecting...");
      setTimeout(() => {
        setShowGooglePopup(false);
        router.push(redirectUrl);
        router.refresh();
      }, 1200);

    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to establish secure session.");
      setGoogleVerifying(false);
      setShowGooglePopup(false);
    }
  };

  const mockGoogleAccounts = [
    { name: "Alex Mercer", email: "alex.dev@gmail.com", avatar: "👨‍💻", providerId: "9988771122" },
    { name: "Jane Doe", email: "jane.doe@gmail.com", avatar: "👩‍💼", providerId: "8877665544" }
  ];

  const renderCheckItem = (isChecked, label) => (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold transition-colors ${isChecked ? "text-emerald-500" : "text-slate-400"}`}>
      {isChecked ? "✓" : "○"} {label}
    </span>
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300 flex items-center justify-center p-4 relative isolate transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse" />

      {/* Main card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300">
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xxs font-bold text-violet-400">
              Identity Portal
            </span>
            <h2 className="text-xl font-extrabold text-slate-200">
              {isRegisterMode ? "Create Your Account" : "Access Your Account"}
            </h2>
            <p className="text-xxs text-slate-400">
              Secure authentication compliant with modern security standards.
            </p>
          </div>

          {/* Google SSO Button CONTAINER */}
          {clientId ? (
            <div ref={googleBtnRef} className="w-full min-h-[46px] flex justify-center items-center" />
          ) : (
            <button
              onClick={() => setShowGooglePopup(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 py-3 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:bg-slate-900 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="h-[1px] bg-slate-800 flex-1" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">or manually</span>
            <div className="h-[1px] bg-slate-800 flex-1" />
          </div>

          {/* Alert messages */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xxs p-3 rounded-xl text-center leading-relaxed font-medium">
              ⚠️ {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xxs p-3 rounded-xl text-center leading-relaxed font-medium animate-pulse">
              ✓ {successMessage}
            </div>
          )}

          {isRegisterMode ? (
            // REGISTRATION FORM
            <form onSubmit={handleManualRegister} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1 flex justify-between">
                  <span>Password</span>
                  <span className={`text-[9px] font-bold ${
                    passwordStrength.score === 5 ? "text-emerald-500" :
                    passwordStrength.score >= 3 ? "text-amber-500" : "text-rose-500"
                  }`}>
                    {passwordStrength.score === 5 ? "Secured" : "Weak"}
                  </span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={72}
                  placeholder="At least 10 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
                
                {/* Real-time complexity check */}
                {password && (
                  <div className="mt-2.5 p-3 rounded-xl card-inner border space-y-1">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {renderCheckItem(passwordStrength.length, "10+ characters")}
                      {renderCheckItem(passwordStrength.lowercase, "Lowercase letter")}
                      {renderCheckItem(passwordStrength.uppercase, "Uppercase letter")}
                      {renderCheckItem(passwordStrength.digit, "Number (0-9)")}
                      {renderCheckItem(passwordStrength.special, "Special key (!@#)")}
                    </div>
                    {/* Visual bar meter */}
                    <div className="h-1 bg-slate-800 rounded-full mt-2 overflow-hidden flex gap-0.5">
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.score === 5 ? "bg-emerald-500 w-full" :
                        passwordStrength.score >= 3 ? "bg-amber-500 w-2/3" : "bg-rose-500 w-1/3"
                      }`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength.score < 5}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Registering account..." : "Sign Up"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xxs text-slate-400 hover:opacity-75 transition-opacity underline cursor-pointer"
                >
                  Already have an account? Log In
                </button>
              </div>
            </form>
          ) : (
            // LOGIN FORM
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your security passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all active:scale-[0.99] disabled:opacity-55 cursor-pointer"
              >
                {loading ? "Authenticating security..." : "Log In"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xxs text-slate-400 hover:opacity-75 transition-opacity underline cursor-pointer"
                >
                  Don&apos;t have an account? Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Simulated Google OAuth consent Pop-up dialog */}
      {showGooglePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl text-center space-y-5 relative">
            
            <div className="space-y-1.5">
              <div className="flex justify-center mb-1">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Sign in with Google</h3>
              <p className="text-[10px] text-slate-400">
                to continue to <span className="font-semibold text-violet-400">SEO Audit Engine</span>
              </p>
            </div>

            {googleVerifying ? (
              <div className="py-8 space-y-4">
                <div className="relative mx-auto h-10 w-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
                </div>
                <p className="text-[10px] text-slate-400 animate-pulse">
                  Verifying tokens with secure OAuth services...
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mockGoogleAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleGoogleAccountSelect(account)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:bg-slate-950 hover:border-slate-700 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                        {account.avatar}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {account.name}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-mono">{account.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-100">➜</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                disabled={googleVerifying}
                onClick={() => setShowGooglePopup(false)}
                className="text-[10px] text-slate-400 hover:opacity-75 transition-opacity underline disabled:opacity-30 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

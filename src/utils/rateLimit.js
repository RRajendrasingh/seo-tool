/**
 * Simple in-memory IP-based rate limiter.
 * No external dependency needed — works on any Node.js server.
 * Resets automatically after the window expires.
 *
 * Usage:
 *   import { rateLimit } from "@/utils/rateLimit";
 *   const limited = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
 *   if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

// Store: Map<ip, { count, resetAt }>
const store = new Map();

/**
 * Check if the request IP has exceeded the rate limit.
 * @param {Request} request - Incoming Next.js request
 * @param {{ limit?: number, windowMs?: number }} options
 * @returns {boolean} true if rate limit exceeded
 */
export function rateLimit(request, { limit = 10, windowMs = 15 * 60 * 1000 } = {}) {
  // Extract IP from headers (Vercel, Cloudflare, direct)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const now = Date.now();
  const key = `${ip}`;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start fresh
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false; // Not limited
  }

  entry.count += 1;

  if (entry.count > limit) {
    return true; // Rate limit exceeded
  }

  return false;
}

// Periodically clean up expired entries to prevent memory leaks (every 10 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 10 * 60 * 1000);
}

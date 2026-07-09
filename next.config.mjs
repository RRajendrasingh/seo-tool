/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comment out output: 'export' to enable server-side dynamic API routes for Stripe Checkout
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // SECURITY FIX M-1: Global security headers — applied to every page and API route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — disallow embedding this site in an iframe
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME type sniffing attacks
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limit referrer info sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Enforce HTTPS for 1 year (production only — ignored on HTTP dev servers)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Restrict browser APIs that shouldn't be used by this app
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

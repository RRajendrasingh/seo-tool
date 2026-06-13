/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comment out output: 'export' to enable server-side dynamic API routes for Stripe Checkout
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

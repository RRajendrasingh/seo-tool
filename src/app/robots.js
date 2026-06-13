export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seointellect-ai.vercel.app";
  const siteUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/checkout/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/checkout/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/checkout/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/checkout/"],
      },
    ],
    sitemap: `${siteUrl}sitemap.xml`,
  };
}

export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://seointellect-ai.vercel.app";
  const siteUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/privacy/`,
    `${siteUrl}/terms/`,
    `${siteUrl}/services/`,
    `${siteUrl}/audit/`,
    `${siteUrl}/audit/report/`,
    `${siteUrl}/seo-services/`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${url === `${siteUrl}/` ? "daily" : "weekly"}</changefreq>
    <priority>${url === `${siteUrl}/` ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

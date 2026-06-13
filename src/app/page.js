import HomeClient from "./HomeClient";

export const metadata = {
  title: "SEOIntellect AI | AI-Powered SEO Audits & Local SEO Services",
  description: "Analyze your website's ranking signals instantly. Get detailed AI action checklists, optimize for ChatGPT and Gemini citation grids, and capture local customers globally.",
  keywords: [
    "AI SEO audit",
    "Generative Engine Optimization",
    "GEO",
    "AEO",
    "local SEO agency",
    "website speed audit",
    "website audit tool"
  ],
  openGraph: {
    title: "SEOIntellect AI | AI-Powered SEO Audits & Local SEO Services",
    description: "Analyze your website's ranking signals instantly. Get detailed AI action checklists, optimize for ChatGPT and Gemini citation grids, and capture local customers globally.",
    type: "website",
    url: "https://seointellect-ai.vercel.app/",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
        width: 1200,
        height: 720,
        alt: "SEOIntellect AI Search Intelligence & Auditing Platform",
      },
    ],
  },
};

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SEOIntellect AI",
      "url": "https://seointellect-ai.vercel.app/",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "SEOIntellect AI Website Auditor",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SEOIntellect AI",
      "url": "https://seointellect-ai.vercel.app/",
      "logo": "https://seointellect-ai.vercel.app/logo.png",
      "sameAs": [
        "https://twitter.com/seointellect",
        "https://github.com/seointellect"
      ],
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}

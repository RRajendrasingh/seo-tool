export const CASE_STUDIES = [
  {
    id: "cs-01",
    slug: "fintech-core-web-vitals",
    client: "FinArch Solutions",
    industry: "Financial Technology",
    title: "180% Increase in Organic Leads via Core Web Vitals Optimization",
    shortDesc: "How fixing LCP and CLS issues on a Next.js application led to a massive increase in organic visibility for competitive finance keywords.",
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    date: "2026-02-15",
    metrics: [
      { label: "Traffic Growth", value: "+180%" },
      { label: "LCP Improvement", value: "-2.4s" },
      { label: "Conversion Rate", value: "+45%" }
    ],
    challenge: "FinArch's main marketing site was built on a heavy single-page application framework. Google's crawler struggled to index their JavaScript-rendered content, and their Largest Contentful Paint (LCP) was over 4 seconds, causing them to fail Core Web Vitals assessments. This resulted in poor rankings for high-intent keywords like 'enterprise payroll API'.",
    solution: "We migrated their architecture to Next.js using strict Server Components (`output: export`). We eliminated render-blocking CSS, implemented `next/font/google` for zero-layout-shift font loading, and restructured their Semantic HTML. Finally, we deployed JSON-LD schema markup for their financial products.",
    results: "Within 60 days of deploying the optimized static build, FinArch passed all Core Web Vitals metrics. Organic traffic increased by 180%, and the improved page speed resulted in a 45% uplift in lead form conversions."
  },
  {
    id: "cs-02",
    slug: "local-seo-dental-network",
    client: "SmileWorks Dental",
    industry: "Healthcare",
    title: "Dominating Local SEO Across 50+ City Markets",
    shortDesc: "Deploying an automated location-page architecture that secured top 3 map pack rankings in highly competitive dental markets.",
    featuredImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80",
    date: "2026-04-10",
    metrics: [
      { label: "New Patients", value: "+320/mo" },
      { label: "Map Pack Rankings", value: "Top 3" },
      { label: "Index Speed", value: "< 48 hrs" }
    ],
    challenge: "SmileWorks had expanded to over 50 locations nationwide, but their website only had a single 'Locations' page. They were virtually invisible for 'dentist near me' or city-specific searches, losing massive market share to local competitors.",
    solution: "We developed a scalable Local SEO architecture generating 50+ dedicated, statically exported city landing pages. We implemented `LocalBusiness` Schema for each clinic, embedding specific latitude/longitude coordinates, operating hours, and localized reviews to align with Google Business Profile proximity signals.",
    results: "The dedicated location pages indexed within 48 hours due to their lightning-fast static nature. SmileWorks secured Top 3 Map Pack rankings in 42 of their 50 markets within four months, driving an average of 320 net new patient bookings monthly directly from organic search."
  },
  {
    id: "cs-03",
    slug: "ai-search-generative-optimization",
    client: "CloudFlow DevOps",
    industry: "SaaS / Cloud Infrastructure",
    title: "Securing ChatGPT Citations via Generative Engine Optimization (GEO)",
    shortDesc: "Structuring content matrices and entity graphs to become the primary cited source in AI Overviews and ChatGPT search.",
    featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    date: "2026-05-22",
    metrics: [
      { label: "AI Citations", value: "#1 Rank" },
      { label: "Brand Mentions", value: "+400%" },
      { label: "Organic Clicks", value: "+85%" }
    ],
    challenge: "As users shifted from traditional search to conversational AI tools like ChatGPT, CloudFlow saw a decline in traditional top-of-funnel blog traffic. They needed to adapt their content to be scraped, understood, and cited by Large Language Models (LLMs).",
    solution: "We performed a complete Generative Engine Optimization (GEO) audit. We restructured their documentation into strict Q&A formats, optimized `Organization` and `SoftwareApplication` JSON-LD schemas, and removed `robots.txt` blocks for AI crawlers like `CCBot` and `GPTBot`. We also built direct statistical citation tables.",
    results: "CloudFlow became the primary cited source for queries like 'best automated CI/CD tools' on ChatGPT Search and Google AI Overviews. This resulted in a 400% increase in brand mentions within LLM answers, recovering and exceeding their previous top-of-funnel organic traffic by 85%."
  }
];

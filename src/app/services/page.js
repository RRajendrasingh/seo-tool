import ServicesClient from "./ServicesClient";

export const metadata = {
  title: "SEO, Web Development, & AI Search Services | SEOIntellect AI",
  description: "Explore our specialized services: hyper-targeted local SEO city hubs, generative engine optimization (GEO/AEO), high-speed Next.js web development, and custom SaaS tools.",
  keywords: [
    "SEO services",
    "AEO",
    "GEO",
    "Generative Engine Optimization",
    "local SEO targeting",
    "web development services",
    "SaaS development"
  ],
  openGraph: {
    title: "SEO, Web Development, & AI Search Services | SEOIntellect AI",
    description: "Explore our specialized services: hyper-targeted local SEO city hubs, generative engine optimization (GEO/AEO), high-speed Next.js web development, and custom SaaS tools.",
    type: "website",
    url: "https://seointellect-ai.vercel.app/services/",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80",
        width: 1200,
        height: 720,
        alt: "SEOIntellect AI Services Blueprints",
      },
    ],
  },
};

import LatestBlogs from "@/components/home/LatestBlogs";

export default function ServicesPage() {
  return (
    <>
      <ServicesClient />
      <LatestBlogs />
    </>
  );
}

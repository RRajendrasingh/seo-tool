import { citiesDb } from "@/data/cities";
import LocationsDirectory from "./LocationsDirectory";

export const metadata = {
  title: "Targeted SEO Locations Directory | SEOIntellect AI",
  description: "Browse 240+ locations across the USA to see local target keywords, market statistics, and localized SEO blueprints.",
  keywords: ["local SEO directory", "seo cities", "SEO services locations", "US local seo", "USA local seo", "United States local seo"],
};

export default function SeoServicesPage() {
  return <LocationsDirectory citiesDb={citiesDb} />;
}

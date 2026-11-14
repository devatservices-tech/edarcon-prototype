import { PRODUCTS } from "@/data/catalog";

const baseUrl = "https://edarcon.com";
const locales = ["en", "ar"] as const;

export default function sitemap() {
  const catalogEntries = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/catalog`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productEntries = locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({
      url: `${baseUrl}/${locale}/catalog/${p.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...catalogEntries, ...productEntries];
}

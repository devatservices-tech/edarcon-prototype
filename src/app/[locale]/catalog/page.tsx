import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { EmptyState } from "@/components/catalog/EmptyState";
import { PRODUCTS, CATEGORIES, type CatalogProduct } from "@/data/catalog";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

function enrichProduct(
  product: CatalogProduct,
  t: { [key: string]: string }
): EnrichedProduct {
  const name = t[`products.${product.id}.name`] || product.id;
  const shortDescription = t[`products.${product.id}.shortDescription`] || "";
  return { ...product, name, shortDescription };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { search } = await searchParams;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const title = search ? `"${search}" | ${t("title")}` : t("title");
  return {
    title: `${title} | Edarcon`,
    description: t("intro"),
    alternates: {
      canonical: `/${locale}/catalog`,
    },
  };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const isRtl = locale === "ar";

  const categoryLabels: Record<string, string> = {};
  CATEGORIES.forEach((cat) => {
    categoryLabels[cat.id] = (t as unknown as { [key: string]: string })[
      `categories.${cat.id}`
    ] || cat.id;
  });

  const availabilityLabels: Record<string, string> = {
    rent: (t as unknown as { [key: string]: string }).rent,
    supply: (t as unknown as { [key: string]: string }).supply,
    both: (t as unknown as { [key: string]: string }).both,
  };

  const currentCategory = (rawSearchParams.category as string) || "all";
  const currentAvailability = (rawSearchParams.availability as string) || "all";
  const currentOperator = rawSearchParams.operator === "true";
  const currentSearch = (rawSearchParams.search as string) || "";
  const currentSort = (rawSearchParams.sort as string) || "featured";

  const enrichedProducts = PRODUCTS.map((p) =>
    enrichProduct(p, t as unknown as { [key: string]: string })
  );

  const filtered = enrichedProducts.filter((p) => {
    if (currentCategory !== "all" && p.category !== currentCategory) return false;
    if (currentAvailability !== "all" && p.availability !== currentAvailability) return false;
    if (currentOperator && !p.operatorOption) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const haystack = [
        p.name,
        p.shortDescription,
        p.category,
        categoryLabels[p.category] || p.category,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (currentSort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort(
      (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name)
    );
  }

  return (
    <>
      <PageHero
        eyebrow={(t as unknown as { [key: string]: string }).eyebrow}
        title={(t as unknown as { [key: string]: string }).title}
        subtitle={(t as unknown as { [key: string]: string }).intro}
      />

      <section className="py-4 bg-[var(--brand-orange)]/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-medium border border-[var(--brand-orange)]/20">
            <span className="size-4" aria-hidden="true">!</span>
            {t("placeholderNotice") as string}
          </div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <CatalogFilters
            isRtl={isRtl}
            categoryLabels={categoryLabels}
          />

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <CatalogGrid
              products={filtered}
              availabilityLabels={availabilityLabels}
            />
          )}
        </div>
      </section>
    </>
  );
}

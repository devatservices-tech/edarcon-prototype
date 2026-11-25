import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Link } from "@/i18n/navigation";
import { Phone, ExternalLink } from "lucide-react";
import {
  PRODUCTS,
  CATEGORIES,
  getProductBySlug,
  type CatalogProduct,
} from "@/data/catalog";
import { AddToEnquiryButton } from "@/components/catalog/AddToEnquiryButton";
import { CatalogPdfDownload } from "@/components/catalog/CatalogPdfDownload";

type TFunc = (key: string) => unknown;
import { cn } from "@/lib/utils";

interface EnrichedProduct {
  id: string;
  slug: string;
  category: string;
  image: string;
  gallery: string[];
  featured: boolean;
  availability: "rent" | "supply" | "both";
  operatorOption: boolean;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  applications: string[];
  specs: { label: string; value: string }[];
  categoryLabel: string;
}

function tStr(
  t: (key: string) => unknown,
  path: string,
  fallback: string
): string {
  const val = t(path);
  return typeof val === "string" ? val : fallback;
}

function enrichProduct(
  product: CatalogProduct,
  t: (key: string) => unknown,
  categoryLabels: Record<string, string>
): EnrichedProduct {
  const base = `products.${product.id}`;

  const specs: { label: string; value: string }[] = product.specs.map((s) => ({
    label: tStr(t, `${base}.specs.${s.key}`, s.key),
    value: s.value,
  }));

  return {
    id: product.id,
    slug: product.slug,
    category: product.category,
    image: product.image,
    gallery: product.gallery,
    featured: product.featured,
    availability: product.availability,
    operatorOption: product.operatorOption,
    name: tStr(t, `${base}.name`, product.id),
    shortDescription: tStr(t, `${base}.shortDescription`, ""),
    description: tStr(t, `${base}.description`, ""),
    features: product.features,
    applications: product.applications,
    specs,
    categoryLabel: categoryLabels[product.category] || product.category,
  };
}

export async function generateStaticParams() {
  const locales = ["en", "ar"] as const;
  return locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not Found | Edarcon" };

  const t = await getTranslations({ locale, namespace: "catalog" });
  const isAr = locale === "ar";
  const baseUrl = "https://edarcon.com";

  const productName = tStr(t as TFunc, `products.${product.id}.name`, product.id);
  const productShortDesc = tStr(t as TFunc, `products.${product.id}.shortDescription`, "");

  return {
    title: `${productName} | Edarcon`,
    description: productShortDesc,
    alternates: {
      canonical: `/${locale}/catalog/${slug}`,
      languages: {
        en: `/en/catalog/${slug}`,
        ar: `/ar/catalog/${slug}`,
      },
    },
    openGraph: {
      title: productName,
      description: productShortDesc,
      type: "website",
      url: `${baseUrl}/${locale}/catalog/${slug}`,
      locale: isAr ? "ar_SA" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_SA",
      siteName: "Edarcon Contracting Company",
      images: [
        {
          url: product.image,
          width: 900,
          height: 600,
          alt: productName,
        },
      ],
    },
  };
}

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const isRtl = locale === "ar";

  const categoryLabels: Record<string, string> = {};
  CATEGORIES.forEach((cat) => {
    categoryLabels[cat.id] = tStr(
      t as TFunc,
      `categories.${cat.id}`,
      cat.id
    );
  });

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const enriched = enrichProduct(product, t as TFunc, categoryLabels);

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const availabilityLabel = (() => {
    switch (product.availability) {
      case "rent":
        return tStr(t as TFunc, "rent", "Rent");
      case "supply":
        return tStr(t as TFunc, "supply", "Supply");
      case "both":
        return tStr(t as TFunc, "both", "Both");
    }
  })();

  const waMessage = encodeURIComponent(
    `Enquiry — Edarcon\n${enriched.name}\n${product.image}\n${enriched.description}`
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: enriched.name,
    description: enriched.description,
    image: product.image,
    brand: { "@type": "Brand", name: "Edarcon" },
    category: enriched.categoryLabel,
    additionalProperty: enriched.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <PageHero
        eyebrow={enriched.categoryLabel}
        title={enriched.name}
        subtitle={enriched.shortDescription}
      />

      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link
              href="/"
              className="hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)] transition-colors"
            >
              {tStr(t as TFunc, "breadcrumbs.home", "Home")}
            </Link>
            <span aria-hidden="true">{isRtl ? "‹" : "›"}</span>
            <Link
              href="/catalog"
              className="hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)] transition-colors"
            >
              {tStr(t as TFunc, "breadcrumbs.catalog", "Catalog")}
            </Link>
            <span aria-hidden="true">{isRtl ? "‹" : "›"}</span>
            <span className="text-foreground">{enriched.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                <div
                  className="h-[400px] w-full bg-blueprint opacity-20 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--brand-orange)]/20 text-[var(--brand-blue)] flex items-center justify-center text-[20px]">
                    🏗️
                  </div>
                </div>
                <button
                  className="absolute top-3 start-3 rtl:start-auto rtl:end-3 z-10 p-2 rounded-lg bg-white/90 backdrop-blur text-foreground hover:bg-white transition-colors"
                  aria-label="Open lightbox"
                >
                  <ExternalLink size={16} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" aria-hidden="true" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2">
                {product.gallery.map((img, i) => (
                  <button
                    key={i}
                    className="flex-shrink-0 w-16 h-16 rounded-xl border border-border overflow-hidden hover:border-[var(--brand-blue)] dark:hover:border-[var(--brand-orange)] transition-colors flex items-center justify-center"
                    aria-label="Gallery thumbnail"
                  >
                    <div className="w-8 h-8 rounded bg-[var(--brand-blue)]/10 flex items-center justify-center text-[8px]">
                      🏗️
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                    product.availability === "rent"
                      ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--brand-orange)]"
                      : "bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]"
                  )}
                >
                  {availabilityLabel}
                </span>
                {product.operatorOption && (
                  <span className="px-2.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                    {tStr(t as TFunc, "operatorLabel", "Operator")}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
                {enriched.name}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {enriched.description}
              </p>

              <SectionHeading
                eyebrow={tStr(t as TFunc, "features", "Features")}
                title={tStr(t as TFunc, "features", "Features")}
                align="start"
                className="mb-4"
              />
              <ul className="space-y-3 text-muted-foreground mb-6">
                {enriched.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1 text-[var(--brand-orange)]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <SectionHeading
                eyebrow={tStr(t as TFunc, "specifications", "Specifications")}
                title={tStr(t as TFunc, "specifications", "Specifications")}
                align="start"
                className="mb-4"
              />
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 font-medium text-muted-foreground w-1/3">Specification</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right w-2/3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.specs.map((spec) => (
                      <tr key={spec.label} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 text-foreground">{spec.label}</td>
                        <td className="px-4 py-3 text-muted-foreground text-right">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHeading
                eyebrow={tStr(t as TFunc, "applications", "Applications")}
                title={tStr(t as TFunc, "applications", "Applications")}
                align="start"
                className="mb-4"
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {enriched.applications.map((app) => (
                  <span key={app} className="px-3 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
                    {app}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <AddToEnquiryButton productId={enriched.id} />
                <div className="flex-1 sm:flex-none sm:w-auto">
                  <a
                    href="tel:+966559021988"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone size={16} aria-hidden="true" />
                    {tStr(t as TFunc, "call", "Call")}
                  </a>
                </div>
                <div className="flex-1 sm:flex-none sm:w-auto">
                  <a
                    href={`https://wa.me/966559021988?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-[#25D366]/10 transition-colors"
                  >
                    <Phone size={16} className="text-[#25D366]" aria-hidden="true" />
                    {tStr(t as TFunc, "whatsapp", "WhatsApp")}
                  </a>
                </div>
                <CatalogPdfDownload
                  name={enriched.name}
                  categoryLabel={enriched.categoryLabel}
                  availabilityLabel={availabilityLabel}
                  description={enriched.description}
                  features={enriched.features}
                  applications={enriched.applications}
                  specs={enriched.specs}
                />
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="py-16 bg-muted/40 border-y border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <SectionHeading
                  eyebrow={tStr(t as TFunc, "related", "Related Equipment")}
                  title={tStr(t as TFunc, "related", "Related Equipment")}
                  align="start"
                  className="mb-8"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {related.map((p) => {
                    const rp = enrichProduct(
                      p,
                      t as TFunc,
                      categoryLabels
                    );
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden p-4 transition-all hover:shadow-xl"
                      >
                        <div className="h-32 overflow-hidden mb-3 bg-blueprint opacity-20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded bg-[var(--brand-orange)]/20 text-[var(--brand-blue)] flex items-center justify-center text-[10px]">
                            🏗️
                          </div>
                        </div>
                        <Link
                          href={`/catalog/${p.slug}`}
                          className="text-sm font-bold text-foreground line-clamp-2 mb-2 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)]"
                        >
                          {rp.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {rp.shortDescription}
                        </p>
                        <Link
                          href={`/catalog/${p.slug}`}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          {tStr(t as TFunc, "viewDetails", "View details")}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

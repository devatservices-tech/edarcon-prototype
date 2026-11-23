"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageHero from "@/components/PageHero";
import { ServiceSection } from "@/components/home/ServiceSection";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAdminData, usePublished, useOrdered } from "@/lib/admin/data-provider";
import { ArrowRight, LayoutGrid } from "lucide-react";

const CATEGORY_ORDER = [
  "Industrial & Mechanical Services",
  "Industrial Equipment & Material Supply",
  "Manpower & Operational Support",
  "Contracting & Facility Management",
  "Infrastructure & Site Support",
] as const;

export default function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = useTranslations("services");
  const [locale, setLocale] = useState<string>("en");
  const [isRtl, setIsRtl] = useState<boolean>(false);

  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      setIsRtl(p.locale === "ar");
    });
  }, [params]);

  const { services, loading } = useAdminData();
  const published = usePublished(services ?? []);
  const ordered = useOrdered(published);
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORY_ORDER)[number]>(CATEGORY_ORDER[0]);

  const byCategory = CATEGORY_ORDER.reduce<Record<string, typeof ordered>>(
    (acc, cat) => {
      acc[cat] = ordered.filter((svc) => svc.category === cat);
      return acc;
    },
    {} as Record<string, typeof ordered>,
  );

  const categoryName = (cat: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      "Industrial & Mechanical Services": {
        en: "Industrial & Mechanical Services",
        ar: "الخدمات الميكانيكية والصناعية",
      },
      "Industrial Equipment & Material Supply": {
        en: "Industrial Equipment & Material Supply",
        ar: "توريد المعدات والمواد الصناعية",
      },
      "Manpower & Operational Support": {
        en: "Manpower & Operational Support",
        ar: "القوى العاملة والدعم التشغيلي",
      },
      "Contracting & Facility Management": {
        en: "Contracting & Facility Management",
        ar: "المقاولات وإدارة المرافق",
      },
      "Infrastructure & Site Support": {
        en: "Infrastructure & Site Support",
        ar: "البنية التحتية ودعم الموقع",
      },
    };
    const l = labels[cat] ?? { en: cat, ar: cat };
    return isRtl ? (l.ar || l.en) : (l.en || l.ar);
  };

  const availableCategories = CATEGORY_ORDER.filter(
    (cat) => byCategory[cat].length > 0,
  );
  const activeItems = byCategory[activeCategory] ?? [];

  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.includes(activeCategory)
    ) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories, activeCategory]);

  return (
    <>
      <PageHero
        eyebrow={t("pageEyebrow")}
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <LayoutGrid size={15} className="text-[var(--brand-orange)]" />
                  {isRtl ? "فئات الخدمات" : "Service Categories"}
                </div>
                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0" aria-label="Service categories">
                  {availableCategories.map((cat) => {
                    const isActive = cat === activeCategory;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "min-w-max lg:min-w-0 lg:w-full text-start rounded-xl px-4 py-3 text-sm font-semibold transition-all border",
                          isActive
                            ? "bg-[var(--brand-blue)] border-[var(--brand-blue)] text-white shadow-md"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {categoryName(cat)}
                        <span className={cn("block lg:inline lg:ms-2 text-xs mt-1 lg:mt-0", isActive ? "text-white/70" : "text-muted-foreground")}>
                          {byCategory[cat].length}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <section className="min-w-0">
              <RevealOnScroll className="mb-6">
                <div className="flex items-end gap-3 mb-8">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 flex items-center justify-center">
                    <ArrowRight size={20} className={cn("text-[var(--brand-orange)]", isRtl && "rotate-180")} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {categoryName(activeCategory)}
                  </h2>
                  <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full border border-border/50 bg-muted/50 text-xs font-medium text-muted-foreground">
                    {activeItems.length} {isRtl ? "خدمات" : "Services"}
                  </span>
                </div>
              </RevealOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activeItems.map((svc, i) => (
                  <ServiceSection
                    key={svc.id}
                    svc={svc}
                    locale={locale}
                    isRtl={isRtl}
                    index={i}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <section className="bg-[var(--navy)] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to start your project?</h2>
            <p className="text-white/60 mb-8 leading-relaxed">Contact us today for a free consultation.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg"
            >
              Get a Quote
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

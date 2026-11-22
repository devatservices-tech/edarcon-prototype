"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";
import { ServiceSection } from "@/components/home/ServiceSection";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAdminData, usePublished, useOrdered } from "@/lib/admin/data-provider";
import { ArrowRight } from "lucide-react";

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

  return (
    <>
      <PageHero
        eyebrow={loading ? "Services" : ""}
        title={loading ? "Our Services" : ""}
        subtitle=""
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const items = byCategory[cat];
            if (items.length === 0) return null;
            return (
              <section
                key={cat}
                id={cat.replace(/[^a-z0-9]/gi, "-").toLowerCase()}
                className="scroll-mt-24 mb-20"
              >
                <RevealOnScroll className="mb-6">
                  <div className="flex items-end gap-4 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 flex items-center justify-center">
                      <ArrowRight size={20} className="text-[var(--brand-orange)]" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {categoryName(cat)}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border/50 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {items.length} Services
                    </span>
                  </div>
                </RevealOnScroll>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((svc, i) => (
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
            );
          })
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

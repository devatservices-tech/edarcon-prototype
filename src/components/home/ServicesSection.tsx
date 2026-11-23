"use client";

import { useTranslations } from "next-intl";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminData, usePublished, useOrdered } from "@/lib/admin/data-provider";
import { ServiceSection } from "@/components/home/ServiceSection";

const SERVICE_KEYS = [
  "projectSupport", "sitePrep", "dewatering", "civilWorks",
  "scaffolding", "equipmentRental", "manpower", "facilityMgmt",
] as const;

export default function ServicesSection({ locale }: { locale: string }) {
  const t     = useTranslations("services");
  const tc    = useTranslations("common");
  const isRtl = locale === "ar";
  const { services, loading } = useAdminData();

  const published = usePublished(services ?? []);
  const ordered = useOrdered(published);

  const sideItems = ordered.map((svc) => ({
    id: svc.slug,
    label: svc.name.en,
  }));

  return (
    <section id="services" className="py-24 bg-background" aria-label="Services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <RevealOnScroll className="mb-14">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            SERVICE_KEYS.map((key, i) => (
              <div key={key} className="animate-pulse bg-muted rounded-2xl h-64" />
            ))
          ) : (
            ordered.slice(0, 8).map((svc, i) => (
              <ServiceSection
                key={svc.id}
                svc={svc}
                locale={locale}
                isRtl={isRtl}
                index={i}
              />
            ))
          )}
        </div>

        <RevealOnScroll delay={0.2} className="mt-12 flex justify-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--brand-blue)]/40 text-[var(--brand-blue)] dark:text-[var(--brand-orange)] font-semibold text-sm hover:bg-[var(--brand-blue)]/8 transition-colors"
          >
            {t("viewAll")}
            <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}

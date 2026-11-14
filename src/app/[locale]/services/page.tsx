import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  HardHat, Shovel, Droplets, Building2,
  Construction, Truck, Users, Settings,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import PageHero from "@/components/PageHero";
import ServicesSideIndex from "@/components/services/ServicesSideIndex";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: `${t("title")} | Edarcon`,
    description: t("subtitle"),
  };
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  projectSupport: HardHat,
  sitePrep: Shovel,
  dewatering: Droplets,
  civilWorks: Building2,
  scaffolding: Construction,
  equipmentRental: Truck,
  manpower: Users,
  facilityMgmt: Settings,
};

const SERVICE_KEYS = [
  "projectSupport", "sitePrep", "dewatering", "civilWorks",
  "scaffolding", "equipmentRental", "manpower", "facilityMgmt",
] as const;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t  = await getTranslations({ locale, namespace: "services" });
  const tc = await getTranslations({ locale, namespace: "cta" });
  const isRtl = locale === "ar";

  const sideItems = SERVICE_KEYS.map((key) => ({
    id: key,
    label: t(`items.${key}.title`),
  }));

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex gap-10 lg:gap-14 items-start">

          {/* ── Sticky side index ── */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">
              {locale === "ar" ? "الخدمات" : "Services"}
            </p>
            <ServicesSideIndex items={sideItems} />
          </aside>

          {/* ── Service sections ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0">
            {SERVICE_KEYS.map((key, i) => {
              const Icon = SERVICE_ICONS[key];
              const bullets = (t.raw(`bullets.${key}`) as unknown as string[]);
              const isEven = i % 2 === 0;

              return (
                <section
                  key={key}
                  id={key}
                  className={cn(
                    "scroll-mt-24 py-14 border-b border-border last:border-0",
                    !isEven && "bg-muted/30 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-2xl"
                  )}
                  aria-label={t(`items.${key}.title`)}
                >
                  <RevealOnScroll direction="up" amount={0.1}>
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                      {/* Icon */}
                      <div className="shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 flex items-center justify-center">
                          <Icon size={28} strokeWidth={1.5} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-bold text-[var(--brand-orange)] uppercase tracking-widest">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="h-px flex-1 bg-border" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                          {t(`items.${key}.title`)}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {t(`items.${key}.desc`)}
                        </p>

                        {/* Bullet points */}
                        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                          {bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                              <CheckCircle2
                                size={15}
                                className="mt-0.5 shrink-0 text-[var(--brand-orange)]"
                              />
                              {b}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-orange)] hover:gap-3 transition-all"
                        >
                          {tc("quote")}
                          <ArrowRight size={14} className={cn(isRtl && "rotate-180")} />
                        </Link>
                      </div>
                    </div>
                  </RevealOnScroll>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-[var(--navy)] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{tc("title")}</h2>
            <p className="text-white/60 mb-8 leading-relaxed">{tc("sub")}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg"
            >
              {tc("quote")}
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

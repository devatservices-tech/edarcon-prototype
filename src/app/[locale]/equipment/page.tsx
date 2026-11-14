import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import EquipmentGrid from "@/components/equipment/EquipmentGrid";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "equipment" });
  return { title: `${t("title")} | Edarcon`, description: t("subtitle") };
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t  = await getTranslations({ locale, namespace: "equipment" });
  const tc = await getTranslations({ locale, namespace: "cta" });
  const isRtl = locale === "ar";

  const catLabels: Record<string, string> = {
    cranes:     locale === "ar" ? "الرافعات"    : "Cranes",
    excavators: locale === "ar" ? "الحفارات"    : "Excavators",
    generators: locale === "ar" ? "المولدات"    : "Generators",
    loaders:    locale === "ar" ? "اللوادر"     : "Loaders",
    vehicles:   locale === "ar" ? "المركبات"    : "Vehicles",
  };
  const allLabel = locale === "ar" ? "الكل" : "All";

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <EquipmentGrid labels={catLabels} allLabel={allLabel} />
          </RevealOnScroll>
        </div>
      </section>

      {/* Operator note */}
      <section className="py-12 bg-muted/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <p className="text-muted-foreground leading-relaxed">
              {locale === "ar"
                ? "جميع المعدات متاحة مع مشغلين معتمدين أو بدونهم. يمكن تقديم شهادات الفحص والتأمين عند الطلب."
                : "All equipment is available with or without certified operators. Inspection certificates and insurance documentation available on request."}
            </p>
          </RevealOnScroll>
        </div>
      </section>

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

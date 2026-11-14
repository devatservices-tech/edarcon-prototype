import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import VendorMarquee from "@/components/home/VendorMarquee";
import ServicesSection from "@/components/home/ServicesSection";
import AboutSection from "@/components/home/AboutSection";
import ProcessSection from "@/components/home/ProcessSection";
import SectorsSection from "@/components/home/SectorsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import { FeaturedEquipment } from "@/components/catalog/FeaturedEquipment";
import { PRODUCTS } from "@/data/catalog";

type TFunc = (key: string) => unknown;

function tStr(
  t: (key: string) => unknown,
  path: string,
  fallback: string
): string {
  const val = t(path);
  return typeof val === "string" ? val : fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title:
      locale === "ar"
        ? "شركة إيداركون كونتراكتينج | الرئيسية"
        : "Edarcon Contracting Company | Industrial & Civil Contractor, Eastern Province",
    description: t("sub"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === "ar";
  const t = await getTranslations({ locale, namespace: "catalog" });

  const enrichedProducts = PRODUCTS.map((p) => ({
    ...p,
    name: tStr(t as TFunc, `products.${p.id}.name`, p.id),
    shortDescription: tStr(t as TFunc, `products.${p.id}.shortDescription`, ""),
  }));

  return (
    <>
      <HeroSection locale={locale} />
      <StatsSection locale={locale} />
      <VendorMarquee locale={locale} />
      <ServicesSection locale={locale} />
      <AboutSection locale={locale} />
      <ProcessSection />
      <SectorsSection locale={locale} />
      <FAQSection locale={locale} />
      <CTASection locale={locale} />
      <FeaturedEquipment
        products={enrichedProducts}
        isRtl={isRtl}
        title={tStr(t as TFunc, "title", "Equipment Catalog")}
        subtitle={tStr(t as TFunc, "intro", "Browse our fleet of equipment.") || "Browse our fleet of equipment."}
        viewAllLabel={tStr(t as TFunc, "viewAll", "View Full Catalog")}
      />
    </>
  );
}

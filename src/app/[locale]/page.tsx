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
  const tc = await getTranslations({ locale, namespace: "catalog" });
  const isRtl = locale === "ar";
  const featuredProducts = PRODUCTS.map((product) => ({
    ...product,
    name: tc.raw(`products.${product.id}.name`) as string || product.id,
    shortDescription: tc.raw(`products.${product.id}.shortDescription`) as string || "",
  }));

  return (
    <>
      <HeroSection locale={locale} />
      <StatsSection locale={locale} />
      <VendorMarquee locale={locale} />
      <ServicesSection locale={locale} />
      <FeaturedEquipment
        products={featuredProducts}
        isRtl={isRtl}
        title={isRtl ? "فهرس المعدات" : "Equipment Catalogue"}
        subtitle={isRtl ? "استكشف معداتنا المتاحة للتأجير والتوريد" : "Explore our equipment available for hire and supply"}
        viewAllLabel={isRtl ? "عرض جميع المعدات" : "View All Equipment"}
      />
      <AboutSection locale={locale} />
      <ProcessSection />
      <SectorsSection locale={locale} />
      <FAQSection locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LocaleLayoutClient from "./locale-layout-client";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "شركة إيداركون كونتراكتينج"
      : "Edarcon Contracting Company",
    description: isAr
      ? "مقاول صناعي ومدني في المنطقة الشرقية، المملكة العربية السعودية."
      : "Industrial and civil contractor in the Eastern Province, Saudi Arabia.",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
    openGraph: {
      locale: isAr ? "ar_SA" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_SA",
      siteName: "Edarcon Contracting Company",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) notFound();

  const messages =
    locale === "ar"
      ? (await import("../../../messages/ar.json")).default
      : (await import("../../../messages/en.json")).default;

  return (
    <LocaleLayoutClient locale={locale} messages={messages}>
      {children}
    </LocaleLayoutClient>
  );
}

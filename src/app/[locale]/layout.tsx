import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider messages={messages}>
        <Navbar locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <WhatsAppButton />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

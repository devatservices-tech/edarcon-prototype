"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { EnquiryProvider } from "@/components/catalog/EnquiryContext";
// import { EnquiryButton } from "@/components/catalog/EnquiryButton"; // Temporarily hidden on all pages.
import { ChatProvider } from "@/context/ChatContext";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import { DataProvider } from "@/lib/admin/data-provider";

export default function LocaleLayoutClient({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <EnquiryProvider>
          <DataProvider>
            <Navbar locale={locale} />
            <main>{children}</main>
            <Footer locale={locale} />
            <WhatsAppButton />
            {/* <EnquiryButton products={enrichedProducts} isRtl={isRtl} /> */}
            <ChatProvider locale={locale}>
              <ChatWidget />
            </ChatProvider>
          </DataProvider>
        </EnquiryProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

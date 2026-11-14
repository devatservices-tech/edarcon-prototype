import { getTranslations } from "next-intl/server";
import SectionHeading from "@/components/SectionHeading";
import FAQAccordion from "@/components/FAQAccordion";
import RevealOnScroll from "@/components/RevealOnScroll";

export default async function FAQSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "faq" });

  const rawItems = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <section id="faq" className="py-24 bg-muted/40 relative overflow-hidden" aria-label="FAQ">
      <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <RevealOnScroll className="mb-12">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8">
            <FAQAccordion items={rawItems} />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

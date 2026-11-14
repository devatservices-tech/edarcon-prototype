import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PageHero from "@/components/PageHero";
import { EQUIPMENT, getEquipmentById, type EquipmentItem } from "@/data/equipment";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const LOCALES = ["en", "ar"] as const;

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    EQUIPMENT.map((item) => ({ locale, id: item.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getEquipmentById(id);
  if (!item) return { title: "Equipment | Edarcon" };
  return {
    title: `${item.name} | Edarcon`,
    description: item.description,
  };
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const item: EquipmentItem | undefined = getEquipmentById(id);
  const t = await getTranslations({ locale, namespace: "equipment" });
  if (!item) notFound();

  return (
    <>
      <PageHero
        eyebrow={item.badge ?? item.category}
        title={item.name}
        subtitle={item.description}
      />

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-1/2">
              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)] hover:underline mb-6"
              >
                {t("backToEquipment")}
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--brand-orange)]/20 bg-[var(--brand-orange)]/5 text-[var(--brand-orange)] text-xs font-bold mb-6 uppercase tracking-wider">
                {item.badge ?? item.category}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">{item.name}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">{item.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs font-medium text-foreground">{spec.label}</span>
                    <span className="text-xs text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 bg-[var(--navy)] rounded-2xl p-6 text-white flex flex-col gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg w-full justify-center"
              >
                {t("requestQuote")} <ArrowRight size={15} />
              </Link>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-orange)]">{t("keyFeatures")}</h3>
                <ul className="space-y-3 text-sm text-white/80">
                  {item.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-1 text-[var(--brand-orange)]">✓</span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h3 className="text-xl font-bold text-foreground mb-6">{t("specifications")}</h3>
          <div className="overflow-x-auto border border-border rounded-xl bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Specification</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {item.specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 text-foreground">{spec.label}</td>
                    <td className="px-4 py-3 text-muted-foreground text-right">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

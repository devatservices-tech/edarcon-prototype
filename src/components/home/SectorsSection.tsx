import { getTranslations } from "next-intl/server";
import { Flame, FlaskConical, Zap, Pickaxe, Building, TestTube } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";

const SECTOR_ICONS = [Flame, FlaskConical, Zap, Pickaxe, Building, TestTube];
const SECTOR_KEYS  = ["oil", "petro", "power", "mining", "infra", "chem"] as const;

export default async function SectorsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "about.sectors" });

  return (
    <section id="sectors" className="py-24 bg-background" aria-label="Sectors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <RevealOnScroll className="mb-14">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
          />
        </RevealOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SECTOR_KEYS.map((key, i) => {
            const Icon = SECTOR_ICONS[i];
            return (
              <RevealOnScroll key={key} delay={i * 0.07} direction="up">
                <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--brand-blue)]/8 dark:bg-[var(--brand-blue)]/15 flex items-center justify-center group-hover:bg-[var(--brand-blue)] transition-colors duration-300">
                    <Icon
                      size={22}
                      strokeWidth={1.75}
                      className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)] group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-snug">{t(key)}</span>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

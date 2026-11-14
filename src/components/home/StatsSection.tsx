import { getTranslations } from "next-intl/server";
import AnimatedCounter from "@/components/AnimatedCounter";
import RevealOnScroll from "@/components/RevealOnScroll";

export default async function StatsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "stats" });

  const stats = [
    { raw: t("vendors"),  suffix: "+", label: t("vendorsLabel")  },
    { raw: t("services"), suffix: "",  label: t("servicesLabel") },
    { raw: t("support"),  suffix: "",  label: t("supportLabel")  },
    { raw: t("years"),    suffix: "+", label: t("yearsLabel")    },
  ];

  return (
    <section className="relative bg-[var(--navy)] py-16 overflow-hidden" aria-label="Statistics">
      <div className="absolute inset-0 bg-blueprint opacity-25 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {stats.map(({ raw, suffix, label }, i) => (
            <RevealOnScroll key={label} delay={i * 0.1} direction="up" className="flex justify-center">
              <AnimatedCounter value={`${raw}${suffix}`} label={label} light />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

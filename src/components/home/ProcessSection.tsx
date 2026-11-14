"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, Truck, ClipboardCheck, CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";

const STEP_ICONS = [Search, Truck, ClipboardCheck, CheckCircle2];

export default function ProcessSection() {
  const t = useTranslations("about.process");

  const steps = [
    { key: "step1", title: t("step1"), desc: t("step1Desc") },
    { key: "step2", title: t("step2"), desc: t("step2Desc") },
    { key: "step3", title: t("step3"), desc: t("step3Desc") },
    { key: "step4", title: t("step4"), desc: t("step4Desc") },
  ];

  return (
    <section id="process" className="py-24 bg-[var(--navy)] relative overflow-hidden" aria-label="Process">
      <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <RevealOnScroll className="mb-16">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            light
          />
        </RevealOnScroll>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-10 start-[12.5%] end-[12.5%] h-px bg-white/10 z-0" />

          {steps.map(({ key, title, desc }, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative z-10 flex flex-col items-center text-center gap-4"
              >
                {/* Number + icon badge */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--navy-light)] border border-white/10 flex items-center justify-center shadow-lg">
                    <Icon size={28} strokeWidth={1.5} className="text-[var(--brand-orange)]" />
                  </div>
                  {/* Step number */}
                  <span className="absolute -top-2.5 -end-2.5 w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white text-xs font-extrabold flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>

                {/* Arrow connector — between steps on desktop */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -end-4 w-8 h-px bg-[var(--brand-orange)]/40 z-20" />
                )}

                <div>
                  <h3 className="font-bold text-white text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ShieldCheck, Users, Zap, Flag, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [ShieldCheck, Users, Zap, Flag];
const FEATURE_KEYS  = ["hse", "workforce", "rapid", "vision"] as const;

export default function AboutSection({ locale }: { locale: string }) {
  const t     = useTranslations("about");
  const isRtl = locale === "ar";

  return (
    <section id="about" className="py-24 bg-muted/40 relative overflow-hidden" aria-label="About">
      {/* Blueprint bg */}
      <div className="absolute inset-0 bg-blueprint opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — image + badge */}
          <RevealOnScroll direction="left">
            <div className="relative">
              {/* Main image card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/15 dark:shadow-black/40 aspect-[4/3]">
                <Image
                  src="/images/logo.jpeg"
                  alt="Edarcon Contracting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/60 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -end-5 bg-[var(--brand-orange)] text-white rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-3xl font-extrabold leading-none">10+</p>
                <p className="text-xs font-semibold mt-0.5 opacity-90">
                  {locale === "ar" ? "سنوات خبرة" : "Years Experience"}
                </p>
              </div>

              {/* Vision 2030 badge */}
              <div className="absolute -top-4 -start-4 bg-[var(--brand-blue)] text-white rounded-2xl px-4 py-3 shadow-xl text-xs font-bold">
                {locale === "ar" ? "رؤية 2030 ✓" : "Vision 2030 ✓"}
              </div>
            </div>
          </RevealOnScroll>

          {/* Right — text */}
          <RevealOnScroll direction="right" delay={0.1}>
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              subtitle={t("subtitle")}
              align="start"
              className="mb-6"
            />

            <p className="text-muted-foreground leading-relaxed mb-8">{t("body")}</p>

            {/* 4 feature points */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {FEATURE_KEYS.map((key, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-[var(--brand-blue)]/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--brand-blue)]/10 flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t(`features.${key}.title`)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(`features.${key}.desc`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-blue)] text-white font-semibold text-sm hover:bg-[var(--brand-blue-dark)] transition-colors shadow-md shadow-[var(--brand-blue)]/20"
            >
              {t("learnMore")}
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

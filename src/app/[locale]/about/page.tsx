import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ShieldCheck, Users, Zap, Flag,
  Search, Truck, ClipboardCheck, CheckCircle2,
  Flame, FlaskConical, Pickaxe, Building, TestTube, ArrowRight,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: `${t("title")} | Edarcon`, description: t("subtitle") };
}

const FEATURE_ICONS = [ShieldCheck, Users, Zap, Flag];
const FEATURE_KEYS  = ["hse", "workforce", "rapid", "vision"] as const;
const STEP_ICONS    = [Search, Truck, ClipboardCheck, CheckCircle2];
const SECTOR_ICONS  = [Flame, FlaskConical, Zap, Pickaxe, Building, TestTube];
const SECTOR_KEYS   = ["oil", "petro", "power", "mining", "infra", "chem"] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t  = await getTranslations({ locale, namespace: "about" });
  const tc = await getTranslations({ locale, namespace: "cta" });
  const isRtl = locale === "ar";

  const steps = [
    { key: "step1", title: t("process.step1"), desc: t("process.step1Desc") },
    { key: "step2", title: t("process.step2"), desc: t("process.step2Desc") },
    { key: "step3", title: t("process.step3"), desc: t("process.step3Desc") },
    { key: "step4", title: t("process.step4"), desc: t("process.step4Desc") },
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {/* ── Story ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <RevealOnScroll direction="left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src="/images/logo.jpeg"
                  alt="Edarcon Contracting"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/50 to-transparent" />
                <div className="absolute bottom-5 start-5 end-5">
                  <p className="text-white font-bold text-lg leading-snug">
                    {t("heroLocation")}
                  </p>
                  <p className="text-white/70 text-sm">
                    {t("heroSubtitle")}
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right" delay={0.1}>
              <SectionHeading
                eyebrow={t("eyebrow")}
                title={t("title")}
                subtitle={t("subtitle")}
                align="start"
                className="mb-6"
              />
              <p className="text-muted-foreground leading-relaxed mb-8">{t("body")}</p>

              {/* Approved vendors strip */}
              <div className="flex flex-wrap gap-2">
                {(t.raw("approvedVendors") as unknown as string[]).map((v) => (
                  <span
                    key={v}
                    className="px-3 py-1.5 rounded-full border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/6 text-[var(--brand-blue)] dark:text-[var(--brand-orange)] text-xs font-semibold"
                  >
                    ✓ {v}
                  </span>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── HSE & Values ── */}
      <section className="py-20 bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t("valuesEyebrow")}
              title={t("valuesTitle")}
            />
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_KEYS.map((key, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <RevealOnScroll key={key} delay={i * 0.08} direction="up">
                  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border hover:border-[var(--brand-blue)]/30 hover:shadow-md transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                      <Icon size={22} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1.5">{t(`features.${key}.title`)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.${key}.desc`)}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-20 bg-[var(--navy)] relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-14">
            <SectionHeading eyebrow={t("process.eyebrow")} title={t("process.title")} light />
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ key, title, desc }, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <RevealOnScroll key={key} delay={i * 0.1} direction="up">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl bg-[var(--navy-light)] border border-white/10 flex items-center justify-center">
                      <Icon size={28} strokeWidth={1.5} className="text-[var(--brand-orange)]" />
                      <span className="absolute -top-2.5 -end-2.5 w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white text-xs font-extrabold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1.5">{title}</h3>
                      <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sectors ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading eyebrow={t("sectors.eyebrow")} title={t("sectors.title")} />
          </RevealOnScroll>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SECTOR_KEYS.map((key, i) => {
              const Icon = SECTOR_ICONS[i];
              return (
                <RevealOnScroll key={key} delay={i * 0.07}>
                  <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/40 hover:shadow-md hover:-translate-y-1 transition-all text-center cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-blue)]/8 flex items-center justify-center group-hover:bg-[var(--brand-blue)] transition-colors">
                      <Icon size={22} strokeWidth={1.75} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-snug">{t(`sectors.${key}`)}</span>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Vision 2030 banner ── */}
      <section className="py-16 bg-[var(--brand-blue)] relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-15 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <span className="text-[var(--brand-orange)] text-xs font-bold uppercase tracking-widest">
              {locale === "ar" ? "رؤية المملكة" : "Kingdom Vision"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
              {locale === "ar" ? "متوافقون مع رؤية 2030" : "Aligned with Vision 2030"}
            </h2>
            <p className="text-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
              {locale === "ar"
                ? "إيداركون ملتزمة بأهداف السعودة والمحتوى المحلي في جميع عقودها، مما يدعم التحول الاقتصادي للمملكة العربية السعودية."
                : "Edarcon is committed to Saudization targets and local content across all contracts, supporting the Kingdom's economic transformation agenda."}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--brand-blue)] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
            >
              {tc("quote")}
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

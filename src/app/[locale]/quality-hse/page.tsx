import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, Download, ArrowRight,
  HardHat, AlertTriangle, Shield, Leaf, Users, Activity, Target,
} from "lucide-react";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages =
    locale === "ar"
      ? (await import("../../../../messages/ar.json")).default
      : (await import("../../../../messages/en.json")).default;
  const t = messages.qualityHse;
  return {
    title: `${t.title} | Edarcon`,
    description: t.subtitle,
    alternates: {
      languages: { en: "/en/quality-hse", ar: "/ar/quality-hse" },
    },
  };
}

const CERT_IMAGES: Record<string, string> = {
  iso9001: "/images/certificates/qualityiso.jpeg",
  iso14001: "/images/certificates/iso env.jpeg",
  iso45001: "/images/certificates/iso.jpeg",
};

const SAFETY_ICONS: Record<string, typeof ShieldCheck> = {
  ppe: HardHat,
  hazardAwareness: AlertTriangle,
  safeWorkPractices: Shield,
  siteCoordination: Activity,
  environmentalResponsibility: Leaf,
  workforceSafetyAwareness: Users,
};

const COMMITMENT_ICONS: Record<string, typeof ShieldCheck> = {
  qualityFocus: ShieldCheck,
  processDiscipline: Target,
  continuousImprovement: Activity,
};

// Certificate thumbnails are displayed from verified scans provided by EDARCON.
// Certificate numbers, validity dates and certification body remain pending
// document review; do not present the standards as proof of current certification
// until those details are checked.
const CERTS_VERIFIED = false;

export default async function QualityHsePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages =
    locale === "ar"
      ? (await import("../../../../messages/ar.json")).default
      : (await import("../../../../messages/en.json")).default;
  const t = messages.qualityHse;
  const isRtl = locale === "ar";

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-24 bg-[var(--navy)] overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-orange)] mb-4">
              <span className="w-6 h-px bg-current" />
              {t.hero.eyebrow}
              <span className="w-6 h-px bg-current" />
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="#certifications"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg"
              >
                {t.hero.ctaCertifications}
                <ArrowRight size={14} className={cn(isRtl && "rotate-180")} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                {t.hero.ctaContact}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Quality Commitment ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t.commitment.eyebrow}
              title={t.commitment.title}
            />
          </RevealOnScroll>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center mb-16">
            {t.commitment.description}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(t.commitment.cards as Record<string, { title: string; desc: string }>).map(
              ([key, card]) => {
                const Icon = COMMITMENT_ICONS[key];
                return (
                  <RevealOnScroll key={key} direction="up" className="col-span-1">
                    <div className="rounded-2xl border border-border bg-card p-6 hover:border-[var(--brand-blue)]/40 hover:shadow-md transition-colors h-full">
                      <div className="w-10 h-10 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center mb-4">
                        <Icon size={20} className="text-[var(--brand-blue)]" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                    </div>
                  </RevealOnScroll>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ── ISO Certifications ── */}
      <section id="certifications" className="py-20 bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t.certifications.eyebrow}
              title={t.certifications.title}
            />
          </RevealOnScroll>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center mb-4">
            {t.certifications.subtitle}
          </p>
          <div className="rounded-2xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-6 mb-10 text-sm text-muted-foreground leading-relaxed">
            {t.certifications.verificationNote}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(
              t.certifications.items as Record<string, { standard: string; name: string; desc: string; number: string; validity: string; body: string }>
            ).map(([key, item]) => {
              const imageSrc = CERT_IMAGES[key];
              return (
                <RevealOnScroll key={key} direction="up">
                  <article className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-colors h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[var(--brand-blue)] font-semibold text-xs uppercase tracking-tighter">
                        {item.standard}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {item.desc}
                    </p>
                    <div className="relative h-40 rounded-xl border border-border bg-muted overflow-hidden mb-4">
                      <Link
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full w-full"
                      >
                        <Image
                          src={imageSrc}
                          alt={`${item.standard} certificate`}
                          fill
                          sizes="(max-width: 768px) 300px, 220px"
                          className="object-cover"
                        />
                      </Link>
                    </div>
                    <dl className="grid grid-cols-2 gap-1.5 mb-4 text-xs">
                      <dt className="text-muted-foreground/70">Certificate number</dt>
                      <dd className="text-foreground/80">{item.number}</dd>
                      <dt className="text-muted-foreground/70">Validity</dt>
                      <dd className="text-foreground/80">{item.validity}</dd>
                    </dl>
                    <div className="mt-auto pt-4 flex sm:flex-row flex-col gap-2">
                      <Link
                        href={imageSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--brand-blue)] text-[var(--brand-blue)] text-sm font-semibold hover:bg-[var(--brand-blue)]/5 transition-colors"
                      >
                        {t.certifications.viewCertificate}
                      </Link>
                      <Link
                        href="#"
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors",
                          CERTS_VERIFIED
                            ? "bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-dark)]"
                            : "border-border text-muted-foreground/50 hover:border-border cursor-default"
                        )}
                      >
                        <Download size={13} />
                        {t.certifications.downloadPdf}
                      </Link>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Health & Safety Commitment ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t.safety.eyebrow}
              title={t.safety.title}
            />
          </RevealOnScroll>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center mb-12">
            {t.safety.description}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(t.safety.cards as Record<string, string>).map(
              ([key, label]) => {
                const Icon = SAFETY_ICONS[key];
                return (
                  <RevealOnScroll key={key} direction="up">
                    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/40 hover:shadow-md transition-colors h-full">
                      <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)]/10 flex items-center justify-center">
                        <Icon size={18} className="text-[var(--brand-orange)]" />
                      </div>
                      <h3 className="font-bold text-foreground">{label}</h3>
                    </div>
                  </RevealOnScroll>
                );
              }
            )}
          </div>
          <p className="mt-10 text-sm text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
            {t.safety.note}
          </p>
        </div>
      </section>

      {/* ── Documentation ── */}
      <section className="py-20 bg-[var(--navy)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t.documents.eyebrow}
              title={t.documents.title}
              light
            />
          </RevealOnScroll>
          <p className="text-white/70 leading-relaxed max-w-2xl mx-auto text-center mb-12">
            {t.documents.description}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(t.documents.items as Record<string, { title: string; desc: string }>).map(
              ([key, doc]) => (
                <RevealOnScroll key={key} direction="up">
                  <div className="rounded-2xl border border-white/10 bg-[var(--navy-light)]/50 p-6 hover:border-[var(--brand-orange)]/50 hover:shadow-md transition-colors h-full">
                    <h3 className="font-bold text-white mb-2">{doc.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-4 flex-1">
                      {doc.desc}
                    </p>
                    <Link
                      href="#"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-orange)] hover:gap-3 transition-colors"
                    >
                      {t.documents.download}
                      <Download size={12} />
                    </Link>
                    <p className="mt-3 text-[10px] text-white/40 italic">
                      {t.documents.unavailable}
                    </p>
                  </div>
                </RevealOnScroll>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="py-16 bg-[var(--brand-blue)] relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-15 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <span className="text-[var(--brand-orange)] text-xs font-bold uppercase tracking-widest">
              {t.contact.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
              {t.contact.title}
            </h2>
            <p className="text-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
              {t.contact.subtitle}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--brand-blue)] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
            >
              {t.contact.cta}
              <ArrowRight size={14} className={cn(isRtl && "rotate-180")} />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

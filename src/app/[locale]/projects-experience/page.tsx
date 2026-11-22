"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ArrowRight, Briefcase, Building2, HardHat, ShieldAlert,
  Users, Wrench, Truck, MapPin, Factory, Link as LinkIcon,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PORTFOLIO_CATEGORIES = [
  {
    key: "industrialMechanical",
    labelKey: "categories.industrialMechanical",
    image: "/images/services/01. Industrial & Mechanical Services/Flange Facing & Machining.jpeg",
  },
  {
    key: "pwht",
    labelKey: "categories.pwht",
    image: "/images/services/01. Industrial & Mechanical Services/Post Heat Treatment (PWHT).jpeg",
  },
  {
    key: "bolting",
    labelKey: "categories.bolting",
    image: "/images/services/01. Industrial & Mechanical Services/Bolt Torquing & Tensioning.jpeg",
  },
  {
    key: "heatExchanger",
    labelKey: "categories.heatExchanger",
    image: "/images/services/01. Industrial & Mechanical Services/Heat Exchanger Retubing.jpeg",
  },
  {
    key: "motorsPumps",
    labelKey: "categories.motorsPumps",
    image: "/images/services/01. Industrial & Mechanical Services/Motors & Pumps Services.jpeg",
  },
  {
    key: "manpower",
    labelKey: "categories.manpower",
    image: "/images/services/03. Manpower & Operational Support/Manpower & Operational Support.jpeg",
  },
  {
    key: "roadSigns",
    labelKey: "categories.roadSigns",
    image: "/images/services/05. Infrastructure & Site Support/Road Signs Provision & Replacement.jpeg",
  },
];

const GALLERY_IMAGES = [
  "/images/services/01. Industrial & Mechanical Services/Flange Facing & Machining.jpeg",
  "/images/services/01. Industrial & Mechanical Services/Post Heat Treatment (PWHT).jpeg",
  "/images/services/01. Industrial & Mechanical Services/Bolt Torquing & Tensioning.jpeg",
  "/images/services/01. Industrial & Mechanical Services/Heat Exchanger Retubing.jpeg",
  "/images/services/01. Industrial & Mechanical Services/Motors & Pumps Services.jpeg",
  "/images/services/01. Industrial & Mechanical Services/Oil Flushing & Filtration.jpeg",
  "/images/services/01. Industrial & Mechanical Services/Valve s & Instrumentation.jpeg".replace("Valve s", "Valves"),
  "/images/services/03. Manpower & Operational Support/Manpower & Operational Support.jpeg",
  "/images/services/05. Infrastructure & Site Support/Road Signs Provision & Replacement.jpeg",
];

const CASE_STUDIES = [
  {
    id: "industrial-maintenance",
    title: "Industrial Maintenance Support",
    location: "Dammam, Eastern Province",
    client: "Client-approved project reference",
    year: "2024",
    category: "Mechanical Services",
    overview: "Scheduled maintenance support for rotating equipment and static plant at an industrial facility in the Eastern Province, executed during a planned shutdown window.",
    scope: [
      "Inspection and overhaul of rotating equipment",
      "Flange facing and machining on critical joints",
      "Bolt torquing and tensioning on pressure-retaining assemblies",
      "Housekeeping and site support services",
    ],
    resources: "Certified technicians, flange facing machines, hydraulic bolt tensioners, PPE and lifting gear.",
    approach: "Work was planned around the client's shutdown schedule with a method statement, risk assessment and permit-to-work process agreed before mobilisation. Quality checkpoints were held after each activity.",
    outcome: "Shutdown completed within the agreed window with no lost-time incidents.",
    gallery: [
      "/images/services/01. Industrial & Mechanical Services/Flange Facing & Machining.jpeg",
      "/images/services/01. Industrial & Mechanical Services/Bolt Torquing & Tensioning.jpeg",
    ],
  },
  {
    id: "pwht-support",
    title: "Post Weld Heat Treatment Support",
    location: "Jubail Industrial City",
    client: "Client-approved project reference",
    year: "2023",
    category: "PWHT / Heat Treatment",
    overview: "Post weld heat treatment for new fabrication and repair piping at an industrial facility, supporting commissioning readiness.",
    scope: [
      "PWHT execution on welded piping assemblies",
      "Temperature recording and chart documentation",
      "Pre-heat and inter-pass temperature control",
    ],
    resources: "PWHT heating equipment, thermocouples, data loggers, certified operators.",
    approach: "Heat treatment cycles were carried out per approved welding procedure specifications, with temperature uniformity surveys and recorded soak times for each weld joint.",
    outcome: "All treated joints met the specified hardness and metallurgical requirements.",
    gallery: [
      "/images/services/01. Industrial & Mechanical Services/Post Heat Treatment (PWHT).jpeg",
    ],
  },
  {
    id: "manpower-supply",
    title: "Manpower & Operational Support",
    location: "Ras Al-Khair, Eastern Province",
    client: "Client-approved project reference",
    year: "2023",
    category: "Manpower Solutions",
    overview: "Supply of skilled and semi-skilled manpower for industrial support activities across mechanical and general site works.",
    scope: [
      "Mechanical fitters and assistants",
      "Riggers and lifting support crew",
      "General labour and housekeeping support",
    ],
    resources: "Mobilised crew with site induction, PPE and trade-specific tools.",
    approach: "Crew selection matched the client's competency matrix, with site orientation and daily toolbox talks before work commenced.",
    outcome: "Manpower deployed on time with attendance and performance reporting provided weekly.",
    gallery: [
      "/images/services/03. Manpower & Operational Support/Manpower & Operational Support.jpeg",
    ],
  },
];

const INDUSTRIES = [
  { key: "oilGas", labelKey: "industries.oilGas", icon: Factory },
  { key: "petrochemical", labelKey: "industries.petrochemical", icon: Building2 },
  { key: "refining", labelKey: "industries.refining", icon: ShieldAlert },
  { key: "manufacturing", labelKey: "industries.manufacturing", icon: HardHat },
  { key: "industrialFacilities", labelKey: "industries.industrialFacilities", icon: Building2 },
  { key: "infrastructure", labelKey: "industries.infrastructure", icon: MapPin },
];

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [isRtl, setIsRtl] = useState<boolean>(false);
  const [openCase, setOpenCase] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setIsRtl(p.locale === "ar"));
  }, [params]);

  const t = useTranslations("projects");

  return (
    <>
      {/* ── Section 1: Hero banner ── */}
      <section className="relative bg-[var(--navy)] overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-orange)] mb-4">
              <span className="w-6 h-px bg-current" />
              {t("heroEyebrow")}
              <span className="w-6 h-px bg-current" />
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              {t("heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="#portfolio"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg"
              >
                {t("ctaExplore")}
                <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                {t("ctaDiscuss")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Section 2: Introduction ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading eyebrow={t("introEyebrow")} title={t("introTitle")} />
          </RevealOnScroll>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <RevealOnScroll direction="left">
              <p className="text-muted-foreground leading-relaxed mb-6">{t("introBody1")}</p>
              <p className="text-muted-foreground leading-relaxed">{t("introBody2")}</p>
            </RevealOnScroll>
            <RevealOnScroll direction="right" delay={0.1}>
              <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-start gap-3">
                  <Briefcase className="text-[var(--brand-blue)] mt-0.5" size={20} />
                  <span className="text-sm text-muted-foreground leading-relaxed">{t("introNote")}</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Section 3: Project Portfolio ── */}
      <section id="portfolio" className="py-20 bg-muted/40 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading
              eyebrow={t("portfolioEyebrow")}
              title={t("portfolioTitle")}
              subtitle={t("portfolioDesc")}
            />
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const Icon = {
                industrialMechanical: HardHat,
                pwht: Wrench,
                bolting: Wrench,
                heatExchanger: Wrench,
                motorsPumps: Truck,
                manpower: Users,
                roadSigns: LinkIcon,
              }[cat.key] ?? HardHat;
              return (
                <RevealOnScroll key={cat.key} direction="up">
                    <a
                      href="#case-studies"
                      className="group relative rounded-2xl overflow-hidden border border-border h-48 hover:border-[var(--brand-blue)]/40 transition-all"
                    >
                    <Image
                      src={cat.image}
                      alt={t(cat.labelKey)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2">
                        <Icon size={18} strokeWidth={1.5} className="text-[var(--brand-orange)]" />
                        <h3 className="font-bold text-white text-sm leading-snug">{t(cat.labelKey)}</h3>
                      </div>
                    </div>
                  </a>
                </RevealOnScroll>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed">
            {t("portfolioDisclaimer")}
          </p>
        </div>
      </section>

      {/* ── Section 4: Project Case Studies ── */}
      <section id="case-studies" className="py-20 bg-background scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-14">
            <SectionHeading eyebrow={t("caseStudiesEyebrow")} title={t("caseStudiesTitle")} />
          </RevealOnScroll>
          <div className="space-y-4">
            {CASE_STUDIES.map((study) => {
              const isOpen = openCase === study.id;
              return (
                <RevealOnScroll key={study.id} direction="up">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all group hover:shadow-md">
                    <div
                      onClick={() => setOpenCase(isOpen ? null : study.id)}
                      className="flex items-center justify-between p-6 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                          <HardHat size={20} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{study.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {study.location} · {study.client} · {study.year}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        strokeWidth={2}
                        className={cn("text-foreground/40 transition-transform", isOpen && "rotate-90")}
                      />
                    </div>
                    {isOpen && (
                      <div className="border-t border-border bg-muted/30 p-6">
                        <div className="grid sm:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-tighter">{t("caseOverview")}</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">{study.overview}</p>
                            <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-tighter">{t("caseCategory")}</span>
                            <span className="text-sm text-foreground">{study.category}</span>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-tighter">{t("caseResources")}</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">{study.resources}</p>
                            <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-tighter">{t("caseOutcome")}</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">{study.outcome}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <span className="text-xs font-semibold text-[var(--brand-blue)] uppercase tracking-tighter">{t("caseScope")}</span>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 leading-relaxed">
                            {study.scope.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-border bg-white text-sm font-medium text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/5 hover:text-[var(--brand-blue)] transition-colors"
                          >
                            {t("caseDiscuss")}
                          </Link>
                          <span className="text-xs text-muted-foreground">{t("caseVerified")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
          <p className="mt-10 text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed">
            {t("caseStudiesDisclaimer")}
          </p>
        </div>
      </section>

      {/* ── Section 5: Site Photo Gallery ── */}
      <section className="py-20 bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading eyebrow={t("galleryEyebrow")} title={t("galleryTitle")} subtitle={t("galleryDesc")} />
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_IMAGES.map((src, i) => {
              const alt = src
                .split("/")
                .pop()!
                .replace(/\.[^/.]+$/, "")
                .replace(/[_\-]/g, " ");
              return (
                <RevealOnScroll key={i} direction="up" delay={i * 0.04}>
                  <div className="relative rounded-2xl overflow-hidden border border-border aspect-square">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute bottom-2 start-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-xs font-medium text-white">
                      Site Operations
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed">
            {t("galleryDisclaimer")}
          </p>
        </div>
      </section>

      {/* ── Section 6: Industries We Support ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12">
            <SectionHeading eyebrow={t("industriesEyebrow")} title={t("industriesTitle")} />
          </RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <RevealOnScroll key={ind.key} direction="up">
                  <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/40 hover:shadow-md hover:-translate-y-1 transition-all text-center cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-blue)]/8 flex items-center justify-center">
                      <Icon size={22} strokeWidth={1.75} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-snug">{t(ind.labelKey)}</span>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-muted-foreground/80 text-center max-w-2xl mx-auto leading-relaxed">
            {t("industriesDisclaimer")}
          </p>
        </div>
      </section>

      {/* ── Section 7: Final CTA ── */}
      <section className="py-20 bg-[var(--brand-blue)] relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-15 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <span className="text-[var(--brand-orange)] text-xs font-bold uppercase tracking-widest">
              {t("ctaEyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
              {t("ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--brand-blue)] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
              >
                {t("ctaRequestQuote")}
                <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                {t("ctaContactTeam")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

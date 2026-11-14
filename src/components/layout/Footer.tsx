"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";

const SERVICE_KEYS = [
  "projectSupport",
  "sitePrep",
  "dewatering",
  "civilWorks",
  "scaffolding",
  "equipmentRental",
  "manpower",
  "facilityMgmt",
] as const;

const COMPANY_LINKS = [
  { key: "about",     href: "/about"     },
  { key: "services",  href: "/services"  },
  { key: "equipment", href: "/equipment" },
  { key: "contact",   href: "/contact"   },
] as const;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer({ locale }: { locale: string }) {
  const t  = useTranslations("footer");
  const ts = useTranslations("services.items");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--navy)] text-white/75">
      {/* Orange accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--brand-blue)] via-[var(--brand-orange)] to-[var(--brand-blue)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-[var(--brand-orange)] transition-all">
                <Image src="/images/logo.jpeg" alt="Edarcon" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-white text-[15px]">
                  {locale === "ar" ? "إيداركون" : "Edarcon"}
                </span>
                <span className="text-[11px] text-[var(--brand-orange)] font-medium">
                  {locale === "ar" ? "كونتراكتينج" : "Contracting"}
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">{t("blurb")}</p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.linkedin.com/company/edarcon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-white/5 hover:bg-[var(--brand-blue)] text-white/50 hover:text-white transition-all"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://wa.me/966559021988"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2 rounded-lg bg-white/5 hover:bg-[#25D366] text-white/50 hover:text-white transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Services column ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">
              {t("servicesTitle")}
            </h3>
            <ul className="space-y-2.5">
              {SERVICE_KEYS.map((key) => (
                <li key={key}>
                  <Link
                    href={`/services#${key}`}
                    className="text-sm text-white/50 hover:text-[var(--brand-orange)] transition-colors leading-snug"
                  >
                    {ts(`${key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company column ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">
              {t("companyTitle")}
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-sm text-white/50 hover:text-[var(--brand-orange)] transition-colors"
                  >
                    {t(`links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact column ── */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">
              {t("contactTitle")}
            </h3>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="tel:+966559021988"
                  className="flex items-start gap-2.5 text-sm text-white/50 hover:text-white transition-colors group"
                >
                  <Phone size={14} className="mt-0.5 shrink-0 text-[var(--brand-orange)] group-hover:scale-110 transition-transform" />
                  +966 55 902 1988
                </a>
              </li>
              <li>
                <a
                  href="mailto:Edarcon@edarcon.com"
                  className="flex items-start gap-2.5 text-sm text-white/50 hover:text-white transition-colors group"
                >
                  <Mail size={14} className="mt-0.5 shrink-0 text-[var(--brand-orange)] group-hover:scale-110 transition-transform" />
                  Edarcon@edarcon.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/50">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--brand-orange)]" />
                <span className="leading-relaxed">
                  {t("address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35 text-center sm:text-start">
            {t("copyright", { year })}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-[var(--brand-orange)] transition-colors group"
          >
            <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
            {locale === "ar" ? "العودة للأعلى" : "Back to top"}
          </button>
        </div>
      </div>
    </footer>
  );
}

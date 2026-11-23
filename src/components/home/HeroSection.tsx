"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAdminData, useTranslatable } from "@/lib/admin/data-provider";

const HERO_IMAGES = [
  "https://media.istockphoto.com/id/582256640/photo/oil-refinery-chemical-petrochemical-plant.jpg?s=612x612&w=0&k=20&c=BEdsHVe2vUfzRTb9KcsCS_tCH6_R_nKLKkOQCht8AKo=",
  "https://media.istockphoto.com/id/2155877725/photo/male-and-female-engineers-in-neat-work-clothes-prepare-and-control-the-production-system-of.jpg?s=612x612&w=0&k=20&c=6E6nQfie8dZIROGrqe9vO4ADz68Sw67LIjC_neaDg6Q=",
  "https://static.vecteezy.com/system/resources/thumbnails/060/659/451/small/industrial-complex-at-dusk-with-smoke-and-illuminated-structures-free-photo.jpeg",
];

export default function HeroSection({ locale }: { locale: string }) {
  const t     = useTranslations("hero");
  const isRtl = locale === "ar";
  const { siteSettings, loading } = useAdminData();
  const [activeImage, setActiveImage] = useState(0);

  const tagline = useTranslatable(siteSettings?.tagline, locale);
  const siteName = useTranslatable(siteSettings?.siteName, locale);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_IMAGES.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[var(--navy)]"
      aria-label="Hero"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {HERO_IMAGES.map((src, index) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: index === activeImage ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-slate-950/65 dark:bg-slate-950/75 pointer-events-none" />
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--navy))" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm text-xs font-bold uppercase tracking-wider sm:tracking-widest mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] animate-pulse" />
              {loading ? t("tagline") : tagline}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold leading-[1.07] tracking-tight text-white mb-6"
          >
            {(() => {
              const raw = loading ? t("headline") : (siteName || t("headline"));
              const idx = raw.lastIndexOf(",");
              if (idx === -1) return raw;
              return (
                <>
                  {raw.slice(0, idx + 1)}
                  <span className="text-[var(--brand-orange)]">
                    {raw.slice(idx + 1)}
                  </span>
                </>
              );
            })()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-10"
          >
            {t("sub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--brand-blue)] text-white font-bold text-sm hover:bg-[var(--brand-blue-dark)] active:scale-95 transition-all shadow-lg shadow-[var(--brand-blue)]/25"
            >
              {t("ctaQuote")}
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/45 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 hover:border-white/70 active:scale-95 transition-all"
            >
              {t("ctaCapabilities")}
            </Link>

            <a
              href="tel:+966559021988"
              className="inline-flex items-center gap-2 px-4 py-3.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <Phone size={15} className="text-[var(--brand-orange)]" />
              +966 55 902 1988
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="text-[10px] uppercase tracking-widest">{t("scrollHint")}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import RevealOnScroll from "@/components/RevealOnScroll";
import { cn } from "@/lib/utils";

export default function CTASection({ locale }: { locale: string }) {
  const t     = useTranslations("cta");
  const isRtl = locale === "ar";

  return (
    <section className="relative py-24 bg-[var(--navy)] overflow-hidden" aria-label="Call to action">
      {/* Blueprint */}
      <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />

      {/* Orange glow blob */}
      <div
        className="absolute -top-32 end-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
        style={{ background: "radial-gradient(circle, var(--brand-orange), transparent 70%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <RevealOnScroll>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] animate-pulse" />
            {t("eyebrow")}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
            {t("title")}
          </h2>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
            {t("sub")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--brand-orange)] text-white font-bold text-sm hover:bg-[var(--brand-orange-dark)] active:scale-95 transition-all shadow-lg shadow-[var(--brand-orange)]/30"
            >
              {t("quote")}
              <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
            </Link>

            <a
              href="tel:+966559021988"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 active:scale-95 transition-all"
            >
              <Phone size={15} />
              {t("call")}
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

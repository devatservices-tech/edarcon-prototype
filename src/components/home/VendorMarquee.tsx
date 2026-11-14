import { useTranslations } from "next-intl";

const VENDORS = ["aramco", "sec", "sabic", "maaden"] as const;

export default function VendorMarquee({ locale }: { locale: string }) {
  const t     = useTranslations("vendors");
  const isRtl = locale === "ar";

  // Duplicate for seamless loop
  const items = [...VENDORS, ...VENDORS, ...VENDORS, ...VENDORS];

  return (
    <section className="py-10 border-y border-border bg-background overflow-hidden" aria-label="Approved vendors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-5">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {t("title")}
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade masks — logical directions work in both LTR and RTL */}
        <div className="absolute inset-y-0 start-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
        <div className="absolute inset-y-0 end-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />

        <div className={isRtl ? "animate-marquee-rtl flex" : "animate-marquee flex"}>
          {items.map((key, i) => (
            <div
              key={i}
              className="flex items-center shrink-0 mx-10 gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--brand-orange)] shrink-0" />
              <span className="text-base sm:text-lg font-bold text-foreground/70 whitespace-nowrap">
                {t(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

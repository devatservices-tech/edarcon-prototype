import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHero({ eyebrow, title, subtitle, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative py-20 bg-[var(--navy)] overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(31,90,153,0.35) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-orange)] mb-4">
          <span className="w-6 h-px bg-current" />
          {eyebrow}
          <span className="w-6 h-px bg-current" />
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

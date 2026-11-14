import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center" | "end";
  className?: string;
  light?: boolean; // for dark backgrounds
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  light = false,
}: SectionHeadingProps) {
  const alignClass = {
    start:  "items-start text-start",
    center: "items-center text-center",
    end:    "items-end text-end",
  }[align];

  return (
    <div className={cn("flex flex-col gap-3", alignClass, className)}>
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]",
            light ? "text-[var(--brand-orange)]" : "text-[var(--brand-blue)] dark:text-[var(--brand-orange)]"
          )}
        >
          <span className="w-6 h-px bg-current" />
          {eyebrow}
          <span className="w-6 h-px bg-current" />
        </span>
      )}

      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
          light ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>

      {/* Animated underline bar */}
      <div
        className={cn(
          "h-1 w-16 rounded-full bg-[var(--brand-orange)]",
          align === "center" && "self-center",
          align === "end"    && "self-end"
        )}
      />

      {subtitle && (
        <p
          className={cn(
            "text-base sm:text-lg max-w-2xl leading-relaxed",
            light ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

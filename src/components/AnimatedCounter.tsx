"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: string;
  label: string;
  className?: string;
  light?: boolean;
}

function parse(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

export default function AnimatedCounter({ value, label, className, light = false }: AnimatedCounterProps) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduce = useReducedMotion();
  const { num, suffix } = parse(value);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (shouldReduce || num === 0) {
      setDisplay(String(num));
      return;
    }
    const controls = animate(0, num, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, num, shouldReduce]);

  return (
    <div ref={ref} className={cn("flex flex-col items-center gap-1.5", className)}>
      <span
        className={cn(
          "text-5xl sm:text-6xl font-extrabold tabular-nums leading-none",
          light ? "text-white" : "text-[var(--brand-blue)] dark:text-[var(--brand-orange)]"
        )}
        aria-label={`${display}${suffix}`}
      >
        {display}
        <span className="text-[var(--brand-orange)]" aria-hidden="true">{suffix}</span>
      </span>
      <span className={cn(
        "text-sm font-medium text-center leading-snug max-w-[120px]",
        light ? "text-white/70" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}

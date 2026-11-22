"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslatable } from "@/lib/admin/data-provider";

interface HighlightItemProps {
  h: { en: string; ar: string };
  locale: string;
}

export function HighlightItem({ h, locale }: HighlightItemProps) {
  const text = useTranslatable(h, locale as "en" | "ar");
  return (
    <li className="flex items-start gap-2 text-sm text-foreground/80">
      <CheckCircle2
        size={15}
        className="mt-0.5 shrink-0 text-[var(--brand-orange)]"
      />
      {text}
    </li>
  );
}

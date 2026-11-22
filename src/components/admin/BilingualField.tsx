"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface BilingualFieldProps {
  value: { en: string; ar: string };
  onChange: (field: "en" | "ar", value: string) => void;
  label?: string;
  error?: string;
}

export function BilingualField({ value, onChange, label, error }: BilingualFieldProps) {
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="flex gap-1 text-xs">
        <button
          onClick={() => setActiveLang("en")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
            activeLang === "en"
              ? "bg-brand-blue text-white border-brand-blue"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/50",
          )}
        >
          EN
        </button>
        <button
          onClick={() => setActiveLang("ar")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
            activeLang === "ar"
              ? "bg-brand-orange text-white border-brand-orange"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/50",
          )}
        >
          AR
        </button>
      </div>
      <Input
        value={value[activeLang]}
        onChange={(e) => onChange(activeLang, e.target.value)}
        placeholder={activeLang === "en" ? "English…" : "العربية…"}
        dir={activeLang === "ar" ? "rtl" : "ltr"}
        className={cn(error ? "border-destructive" : "", "text-left")}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

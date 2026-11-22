"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  helper?: string;
}

export function FormField({ label, error, helper, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-destructive" /> {error}
        </p>
      )}
      {!error && helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

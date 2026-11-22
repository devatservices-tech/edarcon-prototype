"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface QuickReplyProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReply({ label, value, onSelect, disabled }: QuickReplyProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all",
        disabled
          ? "border-border/40 bg-muted/30 text-muted-foreground cursor-not-allowed"
          : "border-[var(--brand-orange)]/50 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] dark:text-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/20 active:scale-95"
      )}
    >
      {label}
      {disabled && <X className="w-3 h-3 opacity-50" />}
    </button>
  );
}

interface QuickRepliesProps {
  items: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ items, onSelect, disabled }: QuickRepliesProps) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 w-full">
      {items.map((item) => (
        <QuickReply
          key={item.value}
          label={item.label}
          value={item.value}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

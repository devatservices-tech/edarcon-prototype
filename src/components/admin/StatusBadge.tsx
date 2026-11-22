"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/30 dark:border-green-800/50",
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-800/50",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/30 dark:border-green-800/50",
    inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700",
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-800/50",
    quoted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200/30 dark:border-purple-800/50",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-800/50",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/30 dark:border-rose-800/50",
    completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variants[status] || "bg-muted text-muted-foreground border-border",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

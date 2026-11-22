import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "published"
    | "draft"
    | "new"
    | "quoted"
    | "won"
    | "lost"
    | "expired"
    | "active"
    | "disabled";
}

const badgeVariants: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-input bg-background",
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/30 dark:border-green-800/50",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/30 dark:border-amber-800/50",
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/30 dark:border-blue-800/50",
  quoted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200/30 dark:border-purple-800/50",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-800/50",
  lost: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/30 dark:border-rose-800/50",
  expired: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700/50",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/30 dark:border-green-800/50",
  disabled: "bg-muted text-muted-foreground border border-border",
} as const;

export const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & BadgeProps
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
        badgeVariants[variant ?? "default"],
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { badgeVariants };

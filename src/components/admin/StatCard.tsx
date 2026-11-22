"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: React.ElementType;
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-muted-foreground shrink-0" />}
          {change && (
            <span className={`text-xs font-medium ${change.positive ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
              {change.positive ? "▲" : "▼"} {change.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

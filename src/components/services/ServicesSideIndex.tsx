"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Item { id: string; label: string }

export default function ServicesSideIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  return (
    <nav aria-label="Services index" className="flex flex-col gap-1">
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            active === id
              ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--brand-orange)] font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
              active === id ? "bg-[var(--brand-orange)]" : "bg-border"
            )}
          />
          {label}
        </a>
      ))}
    </nav>
  );
}

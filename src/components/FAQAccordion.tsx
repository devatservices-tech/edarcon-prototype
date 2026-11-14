"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem { q: string; a: string }

export default function FAQAccordion({ items, className }: { items: FAQItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("flex flex-col divide-y divide-border", className)} role="list">
      {items.map((item, i) => {
        const isOpen    = openIndex === i;
        const triggerId = `faq-trigger-${i}`;
        const panelId   = `faq-panel-${i}`;

        return (
          <div key={i} className="py-1" role="listitem">
            <button
              id={triggerId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={cn(
                "w-full flex items-start justify-between gap-4 py-4 px-1",
                "text-start font-semibold text-sm sm:text-base leading-snug",
                "text-foreground hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)]",
                "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              )}
            >
              <span className="flex-1">{item.q}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200",
                  isOpen ? "bg-[var(--brand-orange)] text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {isOpen ? <Minus size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 px-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

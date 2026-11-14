"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Shovel, Zap, Car, ChevronsUpDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EQUIPMENT } from "@/data/equipment";

const ICONS: Record<string, React.ReactNode> = {
  cranes: <ChevronsUpDown size={18} />,
  excavators: <Shovel size={18} />,
  generators: <Zap size={18} />,
  loaders: <Truck size={18} />,
  vehicles: <Car size={18} />,
};

interface Props {
  labels: Record<string, string>;
  allLabel: string;
}

export default function EquipmentGrid({ labels, allLabel }: Props) {
  const t = useTranslations("equipment");
  const [active, setActive] = useState("all");

  const categories = ["all", "cranes", "excavators", "generators", "loaders", "vehicles"];
  const filtered = active === "all" ? EQUIPMENT : EQUIPMENT.filter((i) => i.category === active);

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter equipment">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150",
              active === cat
                ? "bg-[var(--brand-blue)] border-[var(--brand-blue)] text-white shadow-md"
                : "border-border text-muted-foreground hover:border-[var(--brand-blue)]/50 hover:text-foreground bg-card"
            )}
          >
            {cat !== "all" && ICONS[cat]}
            {cat === "all" ? allLabel : labels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/equipment/${item.id}`}
              className="block"
            >
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-[var(--brand-blue)]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Placeholder image */}
                <div className="relative h-44 bg-gradient-to-br from-[var(--brand-blue)]/10 to-[var(--brand-blue)]/5 dark:from-[var(--navy-light)] dark:to-[var(--navy)] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--brand-blue)]/15 flex items-center justify-center text-[var(--brand-blue)] dark:text-[var(--brand-orange)]">
                    {ICONS[item.category]}
                  </div>
                  <span className="absolute top-3 end-3 px-2 py-0.5 rounded-full bg-[var(--brand-orange)] text-white text-[10px] font-bold uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="font-bold text-sm text-foreground leading-snug">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.spec}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full text-[11px] px-3 py-2"
                  >
                    {t("viewDetails")} <ArrowRight size={12} />
                  </Button>
                </div>
              </motion.div>
            </Link>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

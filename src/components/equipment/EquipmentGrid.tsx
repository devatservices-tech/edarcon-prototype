"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Truck,
  Shovel,
  Zap,
  Car,
  ChevronsUpDown,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EQUIPMENT } from "@/data/equipment";
import { getEquipmentImage } from "@/data/equipmentImages";

const ICONS: Record<string, React.ReactNode> = {
  all: <LayoutGrid size={18} />,
  cranes: <ChevronsUpDown size={18} />,
  excavators: <Shovel size={18} />,
  generators: <Zap size={18} />,
  loaders: <Truck size={18} />,
  vehicles: <Car size={18} />,
};

interface Props {
  labels: Record<string, string>;
  allLabel: string;
  categoriesHeading: string;
  itemCountLabel: string;
}

export default function EquipmentGrid({
  labels,
  allLabel,
  categoriesHeading,
  itemCountLabel,
}: Props) {
  const t = useTranslations("equipment");
  const [active, setActive] = useState("all");

  const categories = ["all", "cranes", "excavators", "generators", "loaders", "vehicles"];
  const filtered = active === "all" ? EQUIPMENT : EQUIPMENT.filter((i) => i.category === active);
  const activeLabel = active === "all" ? allLabel : labels[active] ?? active;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 hidden min-w-0 items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase leading-snug tracking-wider text-muted-foreground lg:flex">
            <LayoutGrid size={15} className="shrink-0 text-[var(--brand-orange)]" />
            <span className="min-w-0 break-words">{categoriesHeading}</span>
          </div>
          <nav
            className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            aria-label={categoriesHeading}
          >
            {categories.map((cat) => {
              const isActive = active === cat;
              const count =
                cat === "all"
                  ? EQUIPMENT.length
                  : EQUIPMENT.filter((item) => item.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex min-w-max items-center gap-2 rounded-xl border px-4 py-3 text-start text-sm font-semibold transition-all lg:w-full",
                    isActive
                      ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-md"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {ICONS[cat]}
                  <span className="flex-1">{cat === "all" ? allLabel : labels[cat] ?? cat}</span>
                  <span
                    className={cn(
                      "text-xs",
                      isActive ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {activeLabel}
          </h2>
          <span className="shrink-0 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            {filtered.length} {itemCountLabel}
          </span>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const equipmentIndex = EQUIPMENT.indexOf(item);
              const image =
                item.image ?? getEquipmentImage(item.category, equipmentIndex);

              return (
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
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)]/40 hover:shadow-lg"
                  >
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 end-3 rounded-full bg-[var(--brand-orange)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 p-4">
                      <h3 className="font-bold text-sm leading-snug text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{item.spec}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-auto w-full px-3 py-2 text-[11px]"
                      >
                        {t("viewDetails")} <ArrowRight size={12} />
                      </Button>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}

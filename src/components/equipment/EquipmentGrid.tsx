"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Shovel, Zap, Car, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  spec: string;
}

const ICONS: Record<string, React.ReactNode> = {
  cranes:      <ChevronsUpDown size={18} />,
  excavators:  <Shovel size={18} />,
  generators:  <Zap size={18} />,
  loaders:     <Truck size={18} />,
  vehicles:    <Car size={18} />,
};

const ITEMS: EquipmentItem[] = [
  { id: "c1",  name: "Mobile Crane 25T",          category: "cranes",     spec: "25 tonne capacity, all-terrain" },
  { id: "c2",  name: "Mobile Crane 100T",         category: "cranes",     spec: "100 tonne capacity, lattice boom" },
  { id: "c3",  name: "Mobile Crane 250T",         category: "cranes",     spec: "250 tonne capacity, telescopic" },
  { id: "c4",  name: "Pick & Carry Crane 15T",    category: "cranes",     spec: "15 tonne, rough terrain" },
  { id: "e1",  name: "Excavator 20T",             category: "excavators", spec: "20 tonne, hydraulic, long reach" },
  { id: "e2",  name: "Excavator 30T",             category: "excavators", spec: "30 tonne, standard bucket" },
  { id: "e3",  name: "Backhoe Loader",            category: "excavators", spec: "4WD, extendable dipper" },
  { id: "e4",  name: "Mini Excavator 3T",         category: "excavators", spec: "3 tonne, zero tail swing" },
  { id: "g1",  name: "Generator 100 kVA",         category: "generators", spec: "100 kVA, diesel, soundproofed" },
  { id: "g2",  name: "Generator 250 kVA",         category: "generators", spec: "250 kVA, diesel, auto-start" },
  { id: "g3",  name: "Generator 500 kVA",         category: "generators", spec: "500 kVA, prime power" },
  { id: "g4",  name: "Generator 1000 kVA",        category: "generators", spec: "1000 kVA, standby / prime" },
  { id: "l1",  name: "Wheel Loader 3m³",          category: "loaders",    spec: "3 m³ bucket, 4WD" },
  { id: "l2",  name: "Skid Steer Loader",         category: "loaders",    spec: "Compact, attachments available" },
  { id: "l3",  name: "Telehandler 3T / 17m",      category: "loaders",    spec: "3 tonne, 17 m reach" },
  { id: "l4",  name: "Forklift 5T",               category: "loaders",    spec: "5 tonne, diesel, rough terrain" },
  { id: "v1",  name: "Crew Bus 30-Seat",          category: "vehicles",   spec: "30-seat, A/C, safety belts" },
  { id: "v2",  name: "Light Vehicle 4×4",         category: "vehicles",   spec: "Toyota Land Cruiser / equivalent" },
  { id: "v3",  name: "Flatbed Truck 20T",         category: "vehicles",   spec: "20 tonne payload, crane-offload" },
  { id: "v4",  name: "Water Bowser 10,000L",      category: "vehicles",   spec: "10,000 litre, dust suppression" },
];

interface Props {
  labels: Record<string, string>;
  allLabel: string;
}

export default function EquipmentGrid({ labels, allLabel }: Props) {
  const [active, setActive] = useState("all");

  const categories = ["all", "cranes", "excavators", "generators", "loaders", "vehicles"];
  const filtered   = active === "all" ? ITEMS : ITEMS.filter((i) => i.category === active);

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
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

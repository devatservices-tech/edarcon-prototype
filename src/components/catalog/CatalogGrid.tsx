"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CatalogCard } from "./CatalogCard";
import { type CatalogProduct } from "@/data/catalog";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

interface CatalogGridProps {
  products: EnrichedProduct[];
  availabilityLabels: Record<string, string>;
}

export function CatalogGrid({
  products,
  availabilityLabels,
}: CatalogGridProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        layout
      >
        {products.map((product) => (
          <CatalogCard
            key={product.id}
            product={product}
            availabilityLabels={availabilityLabels}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

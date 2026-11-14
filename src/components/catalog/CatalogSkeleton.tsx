"use client";

import { motion } from "framer-motion";

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="h-48 bg-muted/60 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-muted/60 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-1/2 mb-2 animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-3/4 mb-3 animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-6 bg-muted/60 rounded animate-pulse" />
              ))}
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2">
              <div className="h-9 bg-muted/60 rounded animate-pulse" />
              <div className="h-9 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

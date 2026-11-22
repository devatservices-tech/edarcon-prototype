"use client";

import { motion } from "framer-motion";

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2 }}
      className="flex items-center gap-1 px-4 py-2 text-xs text-muted-foreground"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
    </motion.div>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView, type Variants, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  /** Pass locale so x-axis directions flip correctly in RTL */
  rtl?: boolean;
}

export default function RevealOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.55,
  once = true,
  amount = 0.15,
  rtl = false,
}: RevealProps) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once, amount });
  const shouldReduce = useReducedMotion();

  // Flip x-axis offsets for RTL layouts
  function offset(): { x?: number; y?: number } {
    if (shouldReduce) return {};
    switch (direction) {
      case "up":    return { y:  28 };
      case "down":  return { y: -28 };
      case "left":  return { x: rtl ? -28 :  28 };
      case "right": return { x: rtl ?  28 : -28 };
      default:      return {};
    }
  }

  const variants: Variants = {
    hidden:  { opacity: shouldReduce ? 1 : 0, ...offset() },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: shouldReduce ? 0 : duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

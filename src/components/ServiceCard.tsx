"use client";

import { motion } from "framer-motion";
import {
  HardHat, Shovel, Droplets, Building2,
  Construction, Truck, Users, Settings,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  HardHat,
  Shovel,
  Droplets,
  Building2,
  Construction,
  Truck,
  Users,
  Settings,
} as const;

type IconName = keyof typeof ICON_MAP;

interface ServiceCardProps {
  icon: IconName;
  title: string;
  desc: string;
  href: string;
  learnMore: string;
  index?: number;
  className?: string;
}

export default function ServiceCard({
  icon: IconName,
  title,
  desc,
  href,
  learnMore,
  index = 0,
  className,
}: ServiceCardProps) {
  const Icon = ICON_MAP[IconName];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl p-6",
        "bg-card border border-border",
        "shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/30",
        "transition-shadow duration-300",
        className
      )}
    >
      {/* Icon badge */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/20 group-hover:bg-[var(--brand-blue)] transition-colors duration-300">
        <Icon
          size={22}
          strokeWidth={1.75}
          className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)] group-hover:text-white transition-colors duration-300"
        />
      </div>

      {/* Orange accent line — grows on hover */}
      <div className="h-0.5 w-8 rounded-full bg-[var(--brand-orange)] group-hover:w-full transition-all duration-500 ease-out" />

      <div className="flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-base text-foreground leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-orange)] hover:gap-2.5 transition-all duration-200 mt-auto"
        aria-label={`${learnMore}: ${title}`}
      >
        {learnMore}
        <ArrowRight size={14} className="rtl:rotate-180" />
      </Link>
    </motion.article>
  );
}

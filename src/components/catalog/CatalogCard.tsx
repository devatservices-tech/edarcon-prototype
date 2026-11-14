"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { HardHat, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEnquiry } from "./EnquiryContext";
import { type CatalogProduct } from "@/data/catalog";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

interface CatalogCardProps {
  product: EnrichedProduct;
  availabilityLabels: Record<string, string>;
}

const AVAILABILITY_BADGE: Record<string, { labelKey: string; color: string }> = {
  rent:    { labelKey: "rent",    color: "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" },
  supply:  { labelKey: "supply",  color: "bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] dark:text-[var(--brand-orange)]" },
  both:    { labelKey: "both",    color: "bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] dark:text-[var(--brand-orange)]" },
};

function ProductImage({ product }: { product: EnrichedProduct }) {
  const colors = [
    "bg-[var(--navy-light)]",
    "bg-blueprint",
    "bg-[var(--brand-blue)]/10",
    "bg-[var(--brand-orange)]/10",
  ];
  const color = colors[Math.abs(hashString(product.id)) % colors.length];
  return (
    <div
      className={cn("relative h-48 overflow-hidden border-b border-border", color)}
    >
      <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--navy-light)]/80 to-transparent" />
      <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-[var(--brand-orange)]" />
      <div className="absolute bottom-2 left-3 w-1 h-1 rounded-full bg-[var(--brand-blue)]/50" />
    </div>
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function CatalogCard({
  product,
  availabilityLabels,
}: CatalogCardProps) {
  const t = useTranslations("catalog");
  const { addItem } = useEnquiry();
  const [added, setAdded] = useState(false);

  const specItems = product.specs.slice(0, 3);

  const handleAdd = () => {
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const availabilityInfo = AVAILABILITY_BADGE[product.availability];
  const availabilityLabel = availabilityLabels[product.availability] || t(availabilityInfo.labelKey);

  return (
    <motion.div
      layout
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <ProductImage product={product} />
        {product.featured && (
          <div className="absolute top-3 start-3 rtl:start-auto rtl:end-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--brand-orange)] text-[var(--navy)] text-xs font-bold">
            <HardHat size={10} className="text-[var(--navy)]" aria-hidden="true" />
            {t("sortFeatured")}
          </div>
        )}
        <button
          onClick={handleAdd}
          className={cn(
            "absolute bottom-3 start-3 rtl:start-auto rtl:end-3 z-20 flex items-center gap-2 px-4 py-2 rounded-lg",
            added
              ? "bg-[var(--brand-orange)] text-[var(--navy)] font-bold shadow-lg"
              : "bg-background/90 backdrop-blur text-foreground/90 hover:bg-background border border-border"
          )}
          aria-label={added ? t("addedToEnquiry") : t("addToEnquiry")}
          aria-pressed={added}
        >
          {added ? (
            <CheckCircle2 size={14} aria-hidden="true" />
          ) : (
            <Plus size={14} aria-hidden="true" />
          )}
          <span className="text-sm font-medium">{added ? t("addedToEnquiry") : t("addToEnquiry")}</span>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
              availabilityInfo.color
            )}
          >
            {availabilityLabel}
          </span>
          {product.operatorOption && (
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              {t("operatorLabel")}
            </span>
          )}
        </div>

        <Link
          href={`/catalog/${product.slug}`}
          className="line-clamp-2 text-base font-bold text-foreground group-hover:text-[var(--brand-blue)] dark:group-hover:text-[var(--brand-orange)] transition-colors mb-1"
        >
          {product.name}
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {product.shortDescription}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {specItems.map((spec) => (
            <div
              key={spec.key}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-muted/50 text-[10px] font-medium"
            >
              <span className="text-muted-foreground/80">{spec.key}</span>
              <span className="text-foreground">{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/catalog/${product.slug}`}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

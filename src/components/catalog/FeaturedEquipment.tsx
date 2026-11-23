"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { type CatalogProduct } from "@/data/catalog";
import { getEquipmentImage } from "@/data/equipmentImages";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

interface FeaturedEquipmentProps {
  products: EnrichedProduct[];
  isRtl: boolean;
  title: string;
  subtitle: string;
  viewAllLabel: string;
}

export function FeaturedEquipment({
  products,
  isRtl,
  title,
  subtitle,
  viewAllLabel,
}: FeaturedEquipmentProps) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const t = useTranslations("catalog");

  return (
    <section className="py-20 bg-muted/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-blue)] dark:text-[var(--brand-orange)] hover:text-[var(--brand-orange)] dark:hover:text-[var(--brand-blue)] transition-colors"
          >
            {viewAllLabel}
            <ArrowRight size={16} className={cn(isRtl && "rotate-180")} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, index) => (
            <div
              key={product.id}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden p-4 transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              <div className="relative h-36 overflow-hidden mb-3 rounded-xl bg-muted">
                <Image
                  src={getEquipmentImage(product.category, index)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <Link
                href={`/catalog/${product.slug}`}
                className="text-sm font-bold text-foreground line-clamp-2 mb-2 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)]"
              >
                {product.name}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                {product.shortDescription}
              </p>
              <Link
                href={`/catalog/${product.slug}`}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {t("viewDetails")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

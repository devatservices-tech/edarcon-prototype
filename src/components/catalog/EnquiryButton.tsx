"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useEnquiry } from "./EnquiryContext";
import { EnquiryDrawer } from "./EnquiryDrawer";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CatalogProduct } from "@/data/catalog";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

interface EnquiryButtonProps {
  products: EnrichedProduct[];
  isRtl: boolean;
}

export function EnquiryButton({ products, isRtl }: EnquiryButtonProps) {
  const t = useTranslations("enquiry");
  const { count } = useEnquiry();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed z-[60] bottom-6 right-6 rtl:left-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--brand-blue)] text-white shadow-lg hover:bg-[var(--brand-blue-dark)] transition-colors"
        aria-label={t("button", { n: count })}
      >
        <Plus size={16} className="text-white" aria-hidden="true" />
        <span className="font-semibold">
          {t("button", { n: count })}
        </span>
      </Button>

      <EnquiryDrawer
        open={open}
        onOpenChange={setOpen}
        products={products}
        isRtl={isRtl}
      />
    </>
  );
}

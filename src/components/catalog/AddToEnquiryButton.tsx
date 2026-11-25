"use client";

import { useEnquiry } from "@/components/catalog/EnquiryContext";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToEnquiryButtonProps {
  productId: string;
}

export function AddToEnquiryButton({ productId }: AddToEnquiryButtonProps) {
  const t = useTranslations("catalog");
  const { addItem } = useEnquiry();

  return (
    <button
      onClick={() => addItem(productId)}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--brand-orange)] text-[var(--navy)] font-bold text-sm hover:bg-[var(--brand-orange-dark)] transition-colors shadow-lg"
      )}
    >
      <Plus size={14} className="shrink-0" />
      {t("addToEnquiry") || "Add to Enquiry"}
    </button>
  );
}

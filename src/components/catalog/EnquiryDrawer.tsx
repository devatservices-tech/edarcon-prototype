"use client";

import { useTranslations } from "next-intl";
import { useEnquiry } from "./EnquiryContext";
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Mail, Phone, Trash2, Clock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { type CatalogProduct } from "@/data/catalog";

interface EnrichedProduct extends CatalogProduct {
  name: string;
  shortDescription: string;
}

interface EnquiryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: EnrichedProduct[];
  isRtl: boolean;
}

export function EnquiryDrawer({
  open,
  onOpenChange,
  products,
  isRtl,
}: EnquiryDrawerProps) {
  const t = useTranslations("enquiry");
  const { items, removeItem, setQuantity, clear } = useEnquiry();
  const router = useRouter();

  const itemsWithProducts = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const side = isRtl ? "left" : "right";

  const contactUrl = () => {
    const params = new URLSearchParams();
    const itemList = itemsWithProducts
      .map((i) => `- ${i.product?.name || i.productId} x${i.quantity}`)
      .join("\n");
    params.set("message", `${t("whatsappIntro")}\n\n${totalCount} ${t("totalItems", { n: totalCount })}\n\n${itemList}`);
    return `/contact?${params.toString()}`;
  };

  const whatsappMessage = itemsWithProducts
    .map((i) => `- ${i.product?.name || i.productId} x${i.quantity}`)
    .join("\n");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="max-w-sm p-0">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>
            {totalCount} {t("totalItems", { n: totalCount })}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {itemsWithProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Clock size={24} aria-hidden="true" />
              </div>
              <p className="text-sm">{t("empty")}</p>
              <p className="text-xs text-muted-foreground mt-2">{t("emptyDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {itemsWithProducts.map((item) => {
                if (!item.product) return null;
                const p = item.product;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div
                      className="w-14 h-14 rounded-lg border border-border bg-muted/50 flex-shrink-0 overflow-hidden flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-[var(--brand-blue)]/20 text-[var(--brand-orange)] flex items-center justify-center text-[10px]">
                        🏗️
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/catalog/${p.slug}`}
                        className="text-sm font-medium text-foreground line-clamp-1 hover:text-[var(--brand-blue)] dark:hover:text-[var(--brand-orange)]"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {p.shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} aria-hidden="true" />
                      </Button>
                      <span className="w-8 text-sm font-medium text-center text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus size={12} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        aria-label={t("remove")}
                      >
                        <Trash2 size={12} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SheetFooter>
          {itemsWithProducts.length > 0 && (
            <div className="space-y-3">
              <Button
                onClick={() => router.push(contactUrl())}
                className="w-full py-3 bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-dark)]"
              >
                <Mail className="mr-2 size-4" aria-hidden="true" />
                {t("contactPrefill")}
              </Button>
              <Button
                onClick={() => {
                  const encoded = encodeURIComponent(
                    `${whatsappMessage}`
                  );
                  window.open(`https://wa.me/966559021988?text=${encoded}`, "_blank");
                }}
                className="w-full py-3 bg-[#25D366] text-white hover:bg-[#1DB954]"
              >
                <Phone className="mr-2 size-4" aria-hidden="true" />
                {t("requestQuoteOnWhatsApp")}
              </Button>
              <Button
                variant="outline"
                onClick={() => clear()}
                className="w-full py-3"
              >
                {t("empty")}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

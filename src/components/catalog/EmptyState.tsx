"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6">
        <Search className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{t("emptyTitle")}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">{t("emptyDesc")}</p>
      <Button
        onClick={() => router.push(pathname)}
      >
        <RefreshCw size={16} className="mr-2" aria-hidden="true" />
        {t("clearAll")}
      </Button>
    </div>
  );
}

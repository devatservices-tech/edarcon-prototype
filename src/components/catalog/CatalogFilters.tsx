"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { CATEGORIES, type Availability } from "@/data/catalog";

type FilterParam = "category" | "availability" | "operator" | "search" | "sort";

const AVAILABILITY_OPTIONS: { value: Availability | "all"; labelKey: string }[] = [
  { value: "all", labelKey: "allCategories" },
  { value: "rent", labelKey: "rent" },
  { value: "supply", labelKey: "supply" },
  { value: "both", labelKey: "both" },
];

const SORT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "featured", labelKey: "sortFeatured" },
  { value: "name", labelKey: "sortName" },
];

interface CatalogFiltersProps {
  isRtl: boolean;
  categoryLabels: Record<string, string>;
}

export function CatalogFilters({
  isRtl,
  categoryLabels,
}: CatalogFiltersProps) {
  const t = useTranslations("catalog");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "all";
  const currentAvailability = (searchParams.get("availability") as Availability | "all") || "all";
  const currentOperator = searchParams.get("operator") === "true";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "featured";

  const setParam = useCallback((key: FilterParam, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const toggleOperator = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentOperator) {
      params.delete("operator");
    } else {
      params.set("operator", "true");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname, currentOperator]);

  const activeFilterCount =
    (currentCategory !== "all" ? 1 : 0) +
    (currentAvailability !== "all" ? 1 : 0) +
    (currentOperator ? 1 : 0) +
    (currentSearch ? 1 : 0);

  return (
    <>
      <div className="lg:hidden">
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          className="w-full px-4 py-3 text-left"
          aria-label={t("filters")}
        >
          <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" />
          {t("filters")}
          {activeFilterCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-[var(--brand-orange)] text-[var(--navy)] text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <div className="hidden lg:block">
        <div
          className={cn(
            "sticky top-0 z-40 px-6 py-3 bg-background/90 backdrop-blur-md border-b border-border",
            isRtl ? "rtl" : "ltr"
          )}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground rtl:left-auto rtl:right-2.5" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder={t("search")}
                  value={currentSearch}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const val = e.target.value;
                    if (val === "") params.delete("search");
                    else params.set("search", val);
                    params.set("page", "1");
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  className="pl-10 pr-4 rtl:pl-4 rtl:pr-10"
                  aria-label={t("searchLabel")}
                />
              </div>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-1">
                <Button
                  onClick={() => setParam("category", "all")}
                  variant={currentCategory === "all" ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap px-3"
                >
                  {t("allCategories")}
                </Button>
                {CATEGORIES.map((cat) => {
                  const isActive = currentCategory === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      onClick={() => setParam("category", cat.id)}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap px-3"
                    >
                      {categoryLabels[cat.id] || cat.id}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center lg:gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-1">
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const isActive = currentAvailability === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        onClick={() => setParam("availability", opt.value as string)}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className="whitespace-nowrap px-3"
                      >
                        {t(opt.labelKey)}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={toggleOperator}
                    variant={currentOperator ? "default" : "outline"}
                    size="sm"
                    className="relative whitespace-nowrap px-3 py-2"
                    aria-pressed={currentOperator}
                  >
                    {currentOperator ? <X size={12} className="mr-1" aria-hidden="true" /> : null}
                    {t("withOperator")}
                    {currentOperator && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--brand-orange)]" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <div className="flex items-end gap-3 overflow-x-auto scrollbar-hidden pb-1">
                  <Select
                    value={currentSort}
                    onValueChange={(value) => setParam("sort", value as string)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t("sortFeatured")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      router.push(pathname, { scroll: false });
                    }}
                    variant="outline"
                    size="sm"
                    disabled={activeFilterCount === 0}
                    className="ml-2 hidden md:block"
                  >
                    <X size={14} className="mr-1" aria-hidden="true" />
                    {t("clearFilters")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsFilterOpen(false)}
              aria-hidden="true"
            />
            <div
              className={cn(
                "fixed inset-y-0 z-50 w-full max-w-md bg-card border border-border flex flex-col shadow-2xl",
                isRtl ? "left-0 border-r translate-x-0" : "right-0 border-l translate-x-0"
              )}
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t("filters")}</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    {t("search")}
                  </label>
                  <Input
                    type="search"
                    value={currentSearch}
                    onChange={(e) => {
                      const params = new URLSearchParams(searchParams.toString());
                      const val = e.target.value;
                      if (val === "") params.delete("search");
                      else params.set("search", val);
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                    className="w-full"
                    aria-label={t("searchLabel")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    {t("allCategories")}
                  </label>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => { setParam("category", "all"); setIsFilterOpen(false); }}
                      variant={currentCategory === "all" ? "default" : "outline"}
                      className="w-full text-left justify-between px-4 py-2"
                    >
                      {t("allCategories")}
                      {currentCategory === "all" && <ChevronDown size={14} />}
                    </Button>
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat.id}
                        onClick={() => { setParam("category", cat.id); setIsFilterOpen(false); }}
                        variant={currentCategory === cat.id ? "default" : "outline"}
                        className="w-full text-left justify-between px-4 py-2"
                      >
                        {categoryLabels[cat.id] || cat.id}
                        {currentCategory === cat.id && <ChevronDown size={14} />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    {t("availability")}
                  </label>
                  <div className="flex flex-col gap-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        onClick={() => { setParam("availability", opt.value as string); setIsFilterOpen(false); }}
                        variant={currentAvailability === opt.value ? "default" : "outline"}
                        className="w-full text-left justify-between px-4 py-2"
                      >
                        {t(opt.labelKey)}
                        {currentAvailability === opt.value && <ChevronDown size={14} />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Filter className="size-4 text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" aria-hidden="true" />
                    <span className="font-medium text-foreground">{t("withOperator")}</span>
                  </div>
                  <Button
                    onClick={toggleOperator}
                    variant={currentOperator ? "default" : "outline"}
                    size="sm"
                    aria-pressed={currentOperator}
                  >
                    {currentOperator ? t("addedToEnquiry") : t("withOperator")}
                  </Button>
                </div>
              </div>
              <div className="p-6 border-t border-border">
                <Button
                  onClick={() => {
                    router.push(pathname, { scroll: false });
                    setIsFilterOpen(false);
                  }}
                  variant="outline"
                  disabled={activeFilterCount === 0}
                  className="w-full"
                >
                  {t("clearFilters")}
                </Button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

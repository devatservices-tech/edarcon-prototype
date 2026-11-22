"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useCollection } from "@/hooks/useCollection";
import {
  servicesRepo,
  equipmentRepo,
  manpowerCategoriesRepo,
  projectsRepo,
  certificatesRepo,
  documentsRepo,
  contactDetailsRepo,
  siteSettingsRepo,
} from "@/lib/admin/store";
import type {
  Service,
  Equipment,
  EquipmentCategory,
  Project,
  Certificate,
  CompanyDocument,
  ContactDetails,
  SiteSettings,
} from "@/lib/admin/types";

interface DataContextType {
  services: Service[];
  equipment: Equipment[];
  equipmentCategories: EquipmentCategory[];
  projects: Project[];
  certificates: Certificate[];
  documents: CompanyDocument[];
  contactDetails: ContactDetails | null;
  siteSettings: SiteSettings | null;
  loading: boolean;
  refetch: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const {
    data: services,
    loading: sLoading,
    refresh: sRefresh,
  } = useCollection<Service>("services");
  const {
    data: equipment,
    loading: eLoading,
    refresh: eRefresh,
  } = useCollection<Equipment>("equipment");
  const {
    data: equipmentCategories,
    loading: ecLoading,
    refresh: ecRefresh,
  } = useCollection<EquipmentCategory>("equipment-categories");
  const {
    data: projects,
    loading: pLoading,
    refresh: pRefresh,
  } = useCollection<Project>("projects");
  const {
    data: certificates,
    loading: cLoading,
    refresh: cRefresh,
  } = useCollection<Certificate>("certificates");
  const {
    data: documents,
    loading: dLoading,
    refresh: dRefresh,
  } = useCollection<CompanyDocument>("documents");
  const {
    data: contacts,
    loading: coLoading,
    refresh: coRefresh,
  } = useCollection<ContactDetails>("contact-details");
  const {
    data: settings,
    loading: stLoading,
    refresh: stRefresh,
  } = useCollection<SiteSettings>("site-settings");

  const loading =
    sLoading || eLoading || ecLoading || pLoading || cLoading || dLoading || coLoading || stLoading;

  const refetch = useCallback(() => {
    sRefresh();
    eRefresh();
    ecRefresh();
    pRefresh();
    cRefresh();
    dRefresh();
    coRefresh();
    stRefresh();
  }, [sRefresh, eRefresh, ecRefresh, pRefresh, cRefresh, dRefresh, coRefresh, stRefresh]);

  const contactDetails = contacts?.[0] ?? null;
  const siteSettings = settings?.[0] ?? null;

  return (
    <DataContext.Provider
      value={{
        services: services ?? [],
        equipment: equipment ?? [],
        equipmentCategories: equipmentCategories ?? [],
        projects: projects ?? [],
        certificates: certificates ?? [],
        documents: documents ?? [],
        contactDetails,
        siteSettings,
        loading,
        refetch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAdminData must be used within a DataProvider");
  return ctx;
}

// Helper: get translatable text for current locale
export function useTranslatable(value: { en: string; ar: string } | null | undefined, locale: string) {
  const isAr = locale === "ar";
  if (!value) return "";
  return isAr ? value.ar || value.en : value.en || value.ar;
}

// Helper: filter active + published items
export function usePublished<T extends { active?: boolean; status?: "published" | "draft" }>(
  items: T[],
) {
  return items.filter((i) => i.active !== false && i.status === "published");
}

// Helper: sort by order
export function useOrdered<T extends { order?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

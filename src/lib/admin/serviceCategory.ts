import type { Translatable } from "./types";

const CATEGORY_ARABIC_LABELS: Record<string, string> = {
  "Industrial & Mechanical Services": "الخدمات الميكانيكية والصناعية",
  "Industrial Equipment & Material Supply": "توريد المعدات والمواد الصناعية",
  "Manpower & Operational Support": "القوى العاملة والدعم التشغيلي",
  "Contracting & Facility Management": "المقاولات وإدارة المرافق",
  "Infrastructure & Site Support": "البنية التحتية ودعم الموقع",
};

export function getServiceCategoryLabel(
  category: string,
  localized: Translatable | undefined,
  locale: string,
): string {
  if (locale === "ar") {
    return localized?.ar || CATEGORY_ARABIC_LABELS[category] || category;
  }
  return localized?.en || category;
}

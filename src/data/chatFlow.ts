export const CHAT_SERVICES = [
  { id: "projectSupport", slug: "project-support", pdf: "/pdf/FE12 Flange Facing Machine (1).pdf" },
  { id: "sitePrep", slug: "site-preparation", pdf: "/pdf/FI40 Flange Facing Machine 2023.pdf" },
  { id: "dewatering", slug: "de-watering", pdf: "/pdf/FE12 Flange Facing Machine (1).pdf" },
  { id: "civilWorks", slug: "civil-works", pdf: "/pdf/FI40 Flange Facing Machine 2023.pdf" },
  { id: "scaffolding", slug: "scaffolding", pdf: "/pdf/FE12 Flange Facing Machine (1).pdf" },
  { id: "equipmentRental", slug: "equipment-rental", pdf: "/pdf/FI40 Flange Facing Machine 2023.pdf" },
  { id: "manpower", slug: "manpower-support", pdf: "/pdf/FE12 Flange Facing Machine (1).pdf" },
  { id: "facilityMgmt", slug: "facility-management", pdf: "/pdf/FI40 Flange Facing Machine 2023.pdf" },
] as const;

export type ServiceId = (typeof CHAT_SERVICES)[number]["id"];

export interface ServiceConfig {
  id: ServiceId;
  slug: string;
  pdf: string;
  title: string;
  highlights: string[];
  keywordsEn: string[];
  keywordsAr: string[];
}

export type ChatStep =
  | "greeting"
  | "askName"
  | "askEmail"
  | "askPhone"
  | "askDetails"
  | "confirmation"
  | "ended";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  type: "text" | "serviceCard" | "options";
  service?: ServiceConfig;
  timestamp: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  serviceSlug?: string;
  details: string;
  topicsViewed: string[];
  locale: string;
  pageUrl: string;
  createdAt: string;
}

export const STORAGE_KEY = "edarcon_chat_state";
const LEADS_STORAGE_KEY = "edarcon_leads";
export const LEADS_API_ROUTE = "/api/lead";
export const TYPING_DELAY_MS = 800;
export const AUTO_OPEN_DELAY_MS = 4000;
export const WHATSAPP_NUMBER = "966559021988";
export const MAX_FAILS_BEFORE_SKIP = 3;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0617-\u061A\u064B-\u0652]/g, "")
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ");
}

export function matchService(
  text: string,
  services: ServiceConfig[],
  locale: string
): ServiceConfig | undefined {
  const normalized = normalizeText(text);
  return services.find((svc) => {
    const keywords = locale === "ar" ? svc.keywordsAr : svc.keywordsEn;
    return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
  });
}

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // ignore quota errors
  }
}

/**
 * Upsert a lead: if the same user (name+email+phone) already has a lead,
 * update it instead of creating a second contact entry.
 */
export function upsertLead(next: Lead): Lead[] {
  const existing = loadLeads();
  const idx = existing.findIndex(
    (l) =>
      l.name === next.name &&
      l.email === next.email &&
      l.phone === next.phone
  );
  if (idx >= 0) {
    const updated = { ...existing[idx], ...next };
    const nextLeads = [...existing];
    nextLeads[idx] = updated;
    saveLeads(nextLeads);
    return nextLeads;
  }
  const combined = [...existing, next];
  saveLeads(combined);
  return combined;
}

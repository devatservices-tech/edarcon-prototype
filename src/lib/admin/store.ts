import {
  Activity,
  Certificate,
  CollectionModel,
  CollectionName,
  CompanyDocument,
  ContactDetails,
  Equipment,
  EquipmentCategory,
  ManpowerCategory,
  Project,
  RFQ,
  Service,
  SiteSettings,
} from "./types";
import { seedData, DATA_VERSION } from "./seed";

const STORAGE_PREFIX = "edarcon_db_";
const ACTOR_DEFAULT = "admin";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function collectionKey(collection: CollectionName): string {
  return `${STORAGE_PREFIX}${collection}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nowISO(): string {
  return new Date().toISOString();
}

function readVersion(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}version`);
  } catch {
    return null;
  }
}

function writeVersion(version: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}version`, version);
  } catch {
    // ignore
  }
}

function clearEdarconStorage(): void {
  if (!isBrowser()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignored
  }
}

export interface Repo<T extends CollectionModel> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">, actor?: string): Promise<T>;
  update(
    id: string,
    data: Partial<Omit<T, "id" | "createdAt">>,
    actor?: string
  ): Promise<T | null>;
  remove(id: string, actor?: string): Promise<boolean>;
}

export class AdminStore {
  private cache = new Map<CollectionName, CollectionModel[] | null>([]);

  private async readCollection(collection: CollectionName): Promise<CollectionModel[]> {
    const cached = this.cache.get(collection);
    if (cached !== undefined && cached !== null) return cached;

    if (!isBrowser()) {
      const fallback = seedData[collection] ?? [];
      this.cache.set(collection, clone(fallback));
      return clone(fallback);
    }

    const storedVersion = readVersion();
    if (storedVersion !== DATA_VERSION) {
      clearEdarconStorage();
      writeVersion(DATA_VERSION);
      this.cache.clear();
    }

    try {
      const raw = localStorage.getItem(collectionKey(collection));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cache.set(collection, clone(parsed));
          return clone(parsed);
        }
      }
    } catch {
      // Corrupt localStorage entry: fall back to seed.
    }

    const fallback = seedData[collection] ?? [];
    try {
      localStorage.setItem(collectionKey(collection), JSON.stringify(clone(fallback)));
    } catch {
      // localStorage may be blocked; continue in-memory only.
    }
    this.cache.set(collection, clone(fallback));
    return clone(fallback);
  }

  private async writeCollection(collection: CollectionName, items: CollectionModel[]): Promise<void> {
    this.cache.set(collection, clone(items));
    if (isBrowser()) {
      try {
        localStorage.setItem(collectionKey(collection), JSON.stringify(clone(items)));
      } catch {
        // localStorage blocked; cache remains source of truth for this session.
      }
    }
  }

  private async appendActivity(activity: Omit<Activity, "id" | "createdAt" | "updatedAt">): Promise<void> {
    if (!isBrowser()) return;
    try {
      const raw = localStorage.getItem(collectionKey("activities"));
      const existing: Activity[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existing)) return;
      const entry: Activity = {
        ...activity,
        id: crypto.randomUUID(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      const next = [entry, ...existing].slice(0, 500);
      localStorage.setItem(collectionKey("activities"), JSON.stringify(next));
      this.cache.set("activities", clone(next));
    } catch {
      // ignore
    }
  }

  private logActivity(
    action: Activity["action"],
    collection: string,
    recordId: string,
    recordName: string,
    actor: string,
    details?: string
  ): void {
    this.appendActivity({
      action,
      collection,
      recordId,
      recordName,
      user: actor,
      details,
    });
  }

  repo<T extends CollectionModel>(collection: CollectionName): Repo<T> {
    return {
      list: async () => (await this.readCollection(collection)) as T[],
      get: async (id: string) => {
        const items = await this.readCollection(collection);
        return items.find((i) => i.id === id) as T | undefined;
      },
      create: async (data, actor = ACTOR_DEFAULT) => {
        const items = await this.readCollection(collection);
        const now = nowISO();
        const item = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T;
        items.push(item);
        await this.writeCollection(collection, items);
        const recordName =
          (item as unknown as { name?: string }).name ||
          (item as unknown as { referenceNo?: string }).referenceNo ||
          item.id;
        this.logActivity("create", collection, item.id, recordName, actor);
        return item;
      },
      update: async (id, data, actor = ACTOR_DEFAULT) => {
        const items = await this.readCollection(collection);
        const index = items.findIndex((i) => i.id === id);
        if (index === -1) return null;
        const updated = {
          ...items[index],
          ...data,
          updatedAt: nowISO(),
        } as T;
        items[index] = updated;
        await this.writeCollection(collection, items);
        const recordName =
          (updated as unknown as { name?: string }).name ||
          (updated as unknown as { referenceNo?: string }).referenceNo ||
          id;
        this.logActivity("update", collection, id, recordName, actor);
        return updated;
      },
      remove: async (id, actor = ACTOR_DEFAULT) => {
        const items = await this.readCollection(collection);
        const index = items.findIndex((i) => i.id === id);
        if (index === -1) return false;
        const removed = items[index];
        const recordName =
          (removed as unknown as { name?: string }).name ||
          (removed as unknown as { referenceNo?: string }).referenceNo ||
          id;
        items.splice(index, 1);
        await this.writeCollection(collection, items);
        this.logActivity("delete", collection, id, recordName, actor);
        return true;
      },
    };
  }

  async resetDemoData(): Promise<void> {
    if (isBrowser()) {
      try {
        localStorage.clear();
      } catch {
        // ignored
      }
    }
    this.cache.clear();
  }
}

export const adminStore = new AdminStore();

export const servicesRepo = adminStore.repo<Service>("services");
export const equipmentCategoriesRepo = adminStore.repo<EquipmentCategory>("equipment-categories");
export const equipmentRepo = adminStore.repo<Equipment>("equipment");
export const manpowerCategoriesRepo = adminStore.repo<ManpowerCategory>("manpower-categories");
export const projectsRepo = adminStore.repo<Project>("projects");
export const certificatesRepo = adminStore.repo<Certificate>("certificates");
export const documentsRepo = adminStore.repo<CompanyDocument>("documents");
export const contactDetailsRepo = adminStore.repo<ContactDetails>("contact-details");
export const siteSettingsRepo = adminStore.repo<SiteSettings>("site-settings");
export const rfqsRepo = adminStore.repo<RFQ>("rfqs");
export const activitiesRepo = adminStore.repo<Activity>("activities");

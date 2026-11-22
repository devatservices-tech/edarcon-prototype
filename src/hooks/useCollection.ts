"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  CollectionModel,
  CollectionName,
} from "@/lib/admin/types";
import { adminStore } from "@/lib/admin/store";

export function useCollection<T extends CollectionModel>(collection: CollectionName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // Cache the repo so it's not recreated on every render (prevents infinite loop)
  const repoRef = useRef(adminStore.repo<T>(collection));
  const repo = repoRef.current;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await repo.list();
      setData(items);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (input: Omit<T, "id" | "createdAt" | "updatedAt">, actor?: string) => {
      try {
        const created = await repo.create(input, actor);
        setData((prev) => [...prev, created]);
        toast.success("Created successfully");
        return created;
      } catch (err) {
        toast.error("Failed to create item");
        throw err;
      }
    },
    [repo],
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<Omit<T, "id" | "createdAt">>,
      actor?: string
    ) => {
      try {
        const updated = await repo.update(id, input, actor);
        if (!updated) {
          toast.error("Item not found");
          return null;
        }
        setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
        toast.success("Updated successfully");
        return updated;
      } catch (err) {
        toast.error("Failed to update item");
        throw err;
      }
    },
    [repo]
  );

  const remove = useCallback(
    async (id: string, actor?: string): Promise<boolean> => {
      try {
        const ok = await repo.remove(id, actor);
        if (!ok) {
          toast.error("Item not found");
          return false;
        }
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted successfully");
        return true;
      } catch (err) {
        toast.error("Failed to delete item");
        throw err;
      }
    },
    [repo]
  );

  return { data, loading, create, update, remove, refresh: load };
}

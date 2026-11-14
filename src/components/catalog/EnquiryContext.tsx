"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface EnquiryItem {
  productId: string;
  quantity: number;
}

interface EnquiryContextType {
  items: EnquiryItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: number;
  getItemQuantity: (productId: string) => number;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

const STORAGE_KEY = "edarcon_enquiry";

function loadItems(): EnquiryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EnquiryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: EnquiryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>([]);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const next = existing
        ? prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { productId, quantity: 1 }];
      saveItems(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveItems(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveItems(next);
      return next;
    });
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
    saveItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity ?? 0;
  }, [items]);

  return (
    <EnquiryContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, count, getItemQuantity }}>
      {children}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) {
    throw new Error("useEnquiry must be used within EnquiryProvider");
  }
  return ctx;
}

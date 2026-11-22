"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BilingualField } from "./BilingualField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RepeatableTranslatableItem {
  id: string;
  en: string;
  ar: string;
}

interface RepeatableListProps {
  value: RepeatableTranslatableItem[];
  onChange: (value: RepeatableTranslatableItem[]) => void;
  label?: string;
  placeholder?: string;
}

export function RepeatableList({
  value,
  onChange,
  label,
  placeholder = "Enter text…",
}: RepeatableListProps) {
  const [items, setItems] = useState(value);

  const addItem = () => {
    const next = [
      ...items,
      { id: crypto.randomUUID(), en: "", ar: "" },
    ];
    setItems(next);
    onChange(next);
  };

  const updateItem = (id: string, field: "en" | "ar", val: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, [field]: val } : item,
    );
    setItems(next);
    onChange(next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-blue-dark"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border border-border rounded-lg p-2 bg-muted/30"
          >
            <Trash2
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
            />
            <div className="flex-1 space-y-1">
              <BilingualField
                value={{ en: item.en, ar: item.ar }}
                onChange={(field, val) => updateItem(item.id, field, val)}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No items yet.</p>
        )}
      </div>
    </div>
  );
}

interface RepeatableStringItem {
  id: string;
  value: string;
}

interface RepeatableStringListProps {
  value: RepeatableStringItem[];
  onChange: (value: RepeatableStringItem[]) => void;
  label?: string;
  placeholder?: string;
}

export function RepeatableStringList({
  value,
  onChange,
  label,
  placeholder = "Enter text…",
}: RepeatableStringListProps) {
  const [items, setItems] = useState(value);

  const addItem = () => {
    const next = [...items, { id: crypto.randomUUID(), value: "" }];
    setItems(next);
    onChange(next);
  };

  const updateItem = (id: string, val: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, value: val } : item,
    );
    setItems(next);
    onChange(next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-blue-dark"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border border-border rounded-lg p-2 bg-muted/30"
          >
            <Trash2
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="w-4 h-4 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
            />
            <Input
              value={item.value}
              onChange={(e) => updateItem(item.id, e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm"
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No items yet.</p>
        )}
      </div>
    </div>
  );
}

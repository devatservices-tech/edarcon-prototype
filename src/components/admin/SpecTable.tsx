"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BilingualField } from "./BilingualField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SpecRow {
  id: string;
  label: { en: string; ar: string };
  value: string;
}

interface SpecTableProps {
  value: SpecRow[];
  onChange: (value: SpecRow[]) => void;
}

export function SpecTable({ value, onChange }: SpecTableProps) {
  const [rows, setRows] = useState(value);

  const addRow = () => {
    const next = [
      ...rows,
      { id: crypto.randomUUID(), label: { en: "", ar: "" }, value: "" },
    ];
    setRows(next);
    onChange(next);
  };

  const updateLabel = (id: string, field: "en" | "ar", val: string) => {
    const next = rows.map((row) =>
      row.id === id ? { ...row, label: { ...row.label, [field]: val } } : row,
    );
    setRows(next);
    onChange(next);
  };

  const updateValue = (id: string, val: string) => {
    const next = rows.map((row) =>
      row.id === id ? { ...row, value: val } : row,
    );
    setRows(next);
    onChange(next);
  };

  const removeRow = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    setRows(next);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">Specification table</label>
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-blue-dark"
        >
          <Plus className="w-3 h-3" /> Add row
        </button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground w-1/3">Label (EN)</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground w-1/3">Label (AR)</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground w-1/3">Value</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <Input
                    value={row.label.en}
                    onChange={(e) => updateLabel(row.id, "en", e.target.value)}
                    placeholder="Label"
                    className="h-8 text-sm p-1"
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={row.label.ar}
                    onChange={(e) => updateLabel(row.id, "ar", e.target.value)}
                    placeholder="التصنيف"
                    dir="rtl"
                    className="h-8 text-sm p-1"
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={row.value}
                    onChange={(e) => updateValue(row.id, e.target.value)}
                    placeholder="Value"
                    className="h-8 text-sm p-1"
                  />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRow(row.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-xs text-muted-foreground italic">
                  No specifications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

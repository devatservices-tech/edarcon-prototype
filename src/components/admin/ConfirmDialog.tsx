"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md mx-4 p-2">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 animate-in fade-in zoom-in duration-200">
          <h2 id="confirm-dialog-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="w-auto"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

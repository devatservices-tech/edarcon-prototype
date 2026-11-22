"use client";

import { Archive, Inbox, Package, Trash2 } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Package,
  Archive,
  Inbox,
  Trash2,
};

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  iconKey?: keyof typeof ICONS;
}

export function EmptyState({ title, description, action, iconKey }: EmptyStateProps) {
  const Icon = iconKey && ICONS[iconKey] ? ICONS[iconKey] : Archive;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

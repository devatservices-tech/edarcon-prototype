"use client";

import * as React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6 border-b border-border pb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && (
          <div className="flex items-center gap-2 lg:ml-auto shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

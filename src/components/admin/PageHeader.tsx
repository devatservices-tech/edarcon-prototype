"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export function PageHeader({ title, description, breadcrumb, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6 border-b border-border pb-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-brand-blue transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
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

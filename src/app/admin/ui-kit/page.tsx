"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { StatCard } from "@/components/admin/StatCard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  LayoutDashboard, Wrench, Settings, Building2, Award, FileText,
  File, Phone, UserRound, Plus, Edit, Trash2, Download, ChevronRight,
  Sun, Moon, Bell, ExternalLink, LogOut, Search, AlertTriangle, CheckCircle2,
  X, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/equipment", label: "Equipment", icon: Settings },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/rfq", label: "RFQ Management", icon: FileText, badge: 3 },
  { href: "/admin/documents", label: "Documents", icon: File },
  { href: "/admin/contact-details", label: "Contact Details", icon: Phone },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function UiKitPage() {
  const { setTheme, theme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <AdminLayout
      user={{ name: "Demo User", email: "demo@edarcon.com", role: "super_admin" }}
      sidebarItems={SIDEBAR_ITEMS}
    >
      <PageHeader
        title="UI Kit"
        description="Design system reference — all components shown in both themes."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "UI Kit" }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Switch theme
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex justify-end">
        <Button onClick={toggleTheme} size="sm" variant="outline">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Buttons */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Buttons</h3>
            <Badge variant="secondary">New</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button variant="default" size="sm">Default</Button>
            <Button variant="accent" size="sm">Accent</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
            <Button variant="destructive" size="sm">Destructive</Button>
            <Button variant="ghostDangerous" size="sm">Ghost Danger</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="icon-sm">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon-sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm" disabled>
              Disabled
            </Button>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            Variants: default, accent, outline, ghost, destructive, ghostDangerous<br />
            Sizes: sm, default, lg, icon, icon-sm
          </p>
        </section>

        {/* Badges */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="published">Published</Badge>
            <Badge variant="draft">Draft</Badge>
            <Badge variant="new">New</Badge>
            <Badge variant="quoted">Quoted</Badge>
            <Badge variant="won">Won</Badge>
            <Badge variant="lost">Lost</Badge>
            <Badge variant="expired">Expired</Badge>
            <Badge variant="active">Active</Badge>
            <Badge variant="disabled">Disabled</Badge>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Stat Cards</h3>
          <div className="space-y-3">
            <StatCard title="Total enquiries" value="124" change={{ value: "+12%", positive: true }} icon={FileText} />
            <StatCard title="New this week" value="18" change={{ value: "+5%", positive: true }} icon={LayoutDashboard} />
            <StatCard title="Quoted" value="8" change={{ value: "-2%", positive: false }} icon={Wrench} />
            <StatCard title="Won" value="4" change={{ value: "+1", positive: true }} icon={Award} />
          </div>
        </section>

        {/* Form Fields */}
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Form Fields</h3>
            <Badge variant="secondary">Interactive</Badge>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Email address</label>
              <Input placeholder="name@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">First name</label>
                <Input placeholder="Ahmed" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Last name</label>
                <Input placeholder="Al-Sayed" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Description</label>
              <Textarea rows={2} placeholder="Enter description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Status</label>
                <Select defaultValue="published">
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Category</label>
                <Input placeholder="Machining Services" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline">Cancel</Button>
              <Button variant="default">Save changes</Button>
              <Button variant="accent">Publish</Button>
            </div>
          </form>
        </section>

        {/* Sheet (Drawer) */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Sheet (Drawer)</h3>
          <p className="text-xs text-muted-foreground mb-3">Slide-out panel from the right.</p>
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" className="w-full sm:w-[420px]">
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetDescription>This is a slide-out drawer with backdrop blur.</SheetDescription>
              </SheetHeader>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Content goes here.</p>
                <Input placeholder="Text input" />
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                <Button variant="default">Save changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </section>

        {/* Confirm Dialog */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Confirm Dialog</h3>
          <p className="text-xs text-muted-foreground mb-3">Modal with destructive action.</p>
          <Button variant="destructive" size="sm" onClick={() => setDialogOpen(true)}>
            Delete item
          </Button>
          <div
            role="dialog"
            aria-modal="true"
            className={cn("fixed inset-0 z-50 flex items-center justify-center", dialogOpen ? "" : "hidden")}
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
            <div className="relative w-full max-w-md mx-4 p-2">
              <div className="bg-card border border-border rounded-xl shadow-lg p-6 animate-slide-in">
                <h3 className="text-lg font-bold text-foreground">Delete item?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This action cannot be undone. All associated data will be removed.
                </p>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                    Delete
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setDialogOpen(false)}
                className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Empty State</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-bold text-foreground">No records found</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              There are currently no items matching your filters.
            </p>
            <Button variant="accent" size="sm" className="mt-4">
              Add new item
            </Button>
          </div>
        </section>

        {/* Skeleton */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Skeleton Loaders</h3>
          <div className="space-y-3">
            <div className="skeleton-text" />
            <div className="skeleton-text-sm" />
            <div className="flex gap-3">
              <div className="skeleton-circle" />
              <div className="flex-1">
                <div className="skeleton-text" />
                <div className="skeleton-text-sm" />
              </div>
            </div>
            <div className="skeleton" style={{ height: 100, width: "100%" }} />
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Used in place of spinners during data loading.
          </p>
        </section>

        {/* Tooltips */}
        <section className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Tooltips</h3>
          <div className="flex flex-col gap-2">
            <div className="relative inline-block">
              <Button variant="outline" size="icon-sm" title="Edit this item">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative inline-block mt-2">
              <Button variant="outline" size="icon-sm" title="Delete this item">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Standard HTML title attributes for tooltips.
          </p>
        </section>

      </div>

      {/* Motion preview */}
      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Motion &amp; Transitions</h3>
          <Badge variant="secondary">150-200ms</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-all duration-150 cursor-pointer group">
            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-brand-blue transition-colors" />
            <span className="text-sm text-muted-foreground">Hover lift card</span>
            <span className="ml-auto text-[10px] text-muted-foreground">25ms lift</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-brand-blue/10 transition-all duration-150 cursor-pointer group border-brand-blue/50 group-hover:border-brand-blue group-hover:bg-brand-blue/5">
            <LayoutDashboard className="w-4 h-4 text-brand-blue group-hover:text-white transition-colors" />
            <span className="text-sm text-brand-blue group-hover:text-white transition-colors">Active sidebar item</span>
            <span className="ml-auto text-[10px] text-brand-blue group-hover:text-white transition-colors">Orange left bar</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-all duration-150 cursor-pointer group">
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-brand-orange transition-colors" />
            <span className="text-sm text-muted-foreground">Toast notification</span>
            <span className="ml-auto text-[10px] text-muted-foreground">Bottom-right</span>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-muted-foreground">
          All interactive elements use 150-200ms transitions. Cards lift on hover.
          Sidebar items show an orange start-edge bar when active.
        </p>
      </section>

    </AdminLayout>
  );
}

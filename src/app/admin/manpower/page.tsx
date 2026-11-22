"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { manpowerCategoriesRepo } from "@/lib/admin/store";
import type { ManpowerCategory } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { BilingualField } from "@/components/admin/BilingualField";
import { SlugInput } from "@/components/admin/SlugInput";
import { IconPicker } from "@/components/admin/IconPicker";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MinusCircle, PlusCircle, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  slug: z.string().min(1, "Slug is required"),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string().min(1, "Arabic description is required"),
  totalHeadcount: z.coerce.number().min(0),
  availableHeadcount: z.coerce.number().min(0),
  certifications: z.string(),
  experienceLevel: z.string().min(1, "Experience level is required"),
  active: z.boolean(),
  status: z.enum(["published", "draft"]),
});

type ManpowerFormData = z.infer<typeof categorySchema>;

function toFormData(c: ManpowerCategory | null): ManpowerFormData {
  if (!c) {
    return { nameEn: "", nameAr: "", slug: "", descEn: "", descAr: "", totalHeadcount: 0, availableHeadcount: 0, certifications: "", experienceLevel: "intermediate", active: true, status: "draft" };
  }
  return { nameEn: c.name.en, nameAr: c.name.ar, slug: c.slug, descEn: c.description.en, descAr: c.description.ar, totalHeadcount: c.totalHeadcount, availableHeadcount: c.availableHeadcount, certifications: c.certifications.join(", "), experienceLevel: c.experienceLevel, active: c.active, status: c.status };
}

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry" },
  { value: "intermediate", label: "Intermediate" },
  { value: "senior", label: "Senior" },
] as const;

export default function ManpowerPage() {
  const {
    data: categories,
    loading,
    create,
    update,
    remove,
    refresh,
  } = useCollection<ManpowerCategory>("manpower-categories");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManpowerCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ManpowerFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: toFormData(null),
  });

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) return null;

  const list = (categories ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isPublished = form.getValues().status === "published";
  const arMissing = !form.getValues().nameAr || !form.getValues().descAr;

  const handleSubmit = async (data: ManpowerFormData) => {
    try {
      const certs = data.certifications.split(",").map((c) => c.trim()).filter(Boolean);
      const payload: Partial<ManpowerCategory> & {
        name: { en: string; ar: string };
        description: { en: string; ar: string };
        certifications: string[];
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        slug: data.slug,
        description: { en: data.descEn, ar: data.descAr },
        totalHeadcount: data.totalHeadcount,
        availableHeadcount: Math.min(data.availableHeadcount, data.totalHeadcount),
        certifications: certs,
        experienceLevel: data.experienceLevel,
        active: data.active,
        status: data.status,
      };
      if (editing) {
        await update(editing.id, payload as Partial<Omit<ManpowerCategory, "id" | "createdAt">>, "admin");
      } else {
        await create(payload as Omit<ManpowerCategory, "id" | "createdAt" | "updatedAt">, "admin");
      }
      setOpen(false);
      setEditing(null);
      await refresh();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId, "admin");
    setDeleteId(null);
    await refresh();
  };

  const adjustAvailable = async (id: string, delta: number) => {
    const item = list.find((c) => c.id === id);
    if (!item) return;
    const newAvailable = Math.max(0, Math.min(item.totalHeadcount, (item.availableHeadcount || 0) + delta));
    await update(id, { availableHeadcount: newAvailable }, "admin");
    await refresh();
  };

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Manpower"
        description="Manage manpower categories, headcount, and availability."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Manpower" }]}
        action={
          <Button onClick={() => { setEditing(null); form.reset(toFormData(null)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length === 0 ? (
          <div className="col-span-3"><EmptyState title="No manpower categories yet" iconKey="Package" /></div>
        ) : (
          list.map((cat) => {
            const utilization = cat.totalHeadcount > 0 ? Math.round(((cat.totalHeadcount - (cat.availableHeadcount || 0)) / cat.totalHeadcount) * 100) : 0;
            return (
              <div key={cat.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{cat.name.en}</h3>
                    <p className="text-sm text-muted-foreground">{cat.name.ar}</p>
                  </div>
                  <button
                    onClick={() => { setEditing(cat); form.reset(toFormData(cat)); setOpen(true); }}
                    className="p-2 text-muted-foreground hover:text-brand-blue"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{cat.description.en}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total headcount</span>
                    <span className="font-medium text-foreground">{cat.totalHeadcount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className={cn("font-medium", (cat.availableHeadcount || 0) === 0 ? "text-destructive" : "text-foreground")}>
                      {cat.availableHeadcount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-medium text-foreground">{utilization}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    <button
                      onClick={() => adjustAvailable(cat.id, -1)}
                      className="w-6 h-6 rounded-lg border border-input bg-background text-xs font-medium flex items-center justify-center hover:bg-muted"
                      disabled={(cat.availableHeadcount || 0) === 0}
                    >
                      <MinusCircle className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => adjustAvailable(cat.id, 1)}
                      className="w-6 h-6 rounded-lg border border-input bg-background text-xs font-medium flex items-center justify-center hover:bg-muted"
                    >
                      <PlusCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-xs text-destructive hover:text-destructive/80"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 inline" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  {cat.certifications.map((cert) => (
                    <span key={cert} className="px-2 py-1 rounded bg-brand-blue/10 text-brand-blue text-[10px] font-medium border border-brand-blue/20">
                      {cert}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{cat.experienceLevel}</span>
                  <span>
                    {cat.active ? <span className="text-green-600">● Active</span> : <span className="text-slate-400">● Inactive</span>}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Category" : "Add Category"}</SheetTitle>
            <SheetDescription>Bilingual manpower category details.</SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (EN)</label><Input {...form.register("nameEn")} placeholder="Category name" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (AR)</label><Input {...form.register("nameAr")} placeholder="الفئة" dir="rtl" /></div>
              <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Slug</label><SlugInput value={form.getValues().slug} onChange={(v) => form.setValue("slug", v)} sourceName={form.getValues().nameEn} /></div>
              <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (EN)</label><Textarea {...form.register("descEn")} rows={2} placeholder="Description" /></div>
              <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (AR)</label><Textarea {...form.register("descAr")} rows={2} dir="rtl" placeholder="الوصف" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Total Headcount</label>
                <Input type="number" {...form.register("totalHeadcount")} className="h-8" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Available Headcount</label>
                <Input type="number" {...form.register("availableHeadcount")} className="h-8" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Experience Level</label>
                <Select value={form.getValues().experienceLevel} onValueChange={(v) => form.setValue("experienceLevel", v as string)}>
                  <SelectTrigger><SelectValue placeholder={form.getValues().experienceLevel} /></SelectTrigger>
                  <SelectContent>{EXPERIENCE_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Certifications (comma-separated)</label>
              <Input {...form.register("certifications")} placeholder="ASME IX, AWS D1.1" />
              <p className="text-xs text-muted-foreground">Comma-separated list of certifications held.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                <Select value={form.getValues().status} onValueChange={(v) => form.setValue("status", v as "published" | "draft")}>
                  <SelectTrigger><SelectValue placeholder={form.getValues().status} /></SelectTrigger>
                  <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                </Select>
                {isPublished && arMissing && <p className="text-xs text-destructive">Arabic required for published.</p>}
              </div>
              <div className="space-y-2 flex items-end">
                <label className="text-xs font-medium text-muted-foreground">Active</label>
                <button onClick={() => form.setValue("active", !form.getValues().active)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", form.getValues().active ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
                  <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", form.getValues().active ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPublished && arMissing} className="bg-brand-blue text-white">{editing ? "Update" : "Create"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete category" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

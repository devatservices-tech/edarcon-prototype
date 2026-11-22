"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import {
  equipmentCategoriesRepo,
  equipmentRepo,
} from "@/lib/admin/store";
import type {
  Equipment,
  EquipmentAvailability,
  EquipmentCondition,
  EquipmentCategory,
} from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { SlugInput } from "@/components/admin/SlugInput";
import { IconPicker } from "@/components/admin/IconPicker";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { SpecTable } from "@/components/admin/SpecTable";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MinusCircle, PlusCircle, Copy, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  slug: z.string().min(1, "Slug is required"),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string().min(1, "Arabic description is required"),
  icon: z.string().min(1, "Icon is required"),
  order: z.coerce.number().min(0),
  active: z.boolean(),
  status: z.enum(["published", "draft"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const equipmentSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  slug: z.string().min(1, "Slug is required"),
  modelCode: z.string().min(1, "Model code is required"),
  categoryId: z.string().min(1, "Category is required"),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string().min(1, "Arabic description is required"),
  availability: z.enum(["rent", "supply", "both"]),
  operator: z.boolean(),
  featured: z.boolean(),
  quantityTotal: z.coerce.number().min(0),
  quantityAvailable: z.coerce.number().min(0),
  condition: z.enum(["available", "rented", "maintenance"]),
  status: z.enum(["published", "draft"]),
  image: z.string().optional(),
  brochure: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function toCategoryFormData(c: EquipmentCategory | null): CategoryFormData {
  if (!c) {
    return { nameEn: "", nameAr: "", slug: "", descEn: "", descAr: "", icon: "Tool", order: 0, active: true, status: "draft" };
  }
  return { nameEn: c.name.en, nameAr: c.name.ar, slug: c.slug, descEn: c.description.en, descAr: c.description.ar, icon: c.icon, order: c.order, active: c.active, status: c.status };
}

function toEquipmentFormData(e: Equipment | null): EquipmentFormData {
  if (!e) {
    return { nameEn: "", nameAr: "", slug: "", modelCode: "", categoryId: "", descEn: "", descAr: "", availability: "rent", operator: false, featured: false, quantityTotal: 0, quantityAvailable: 0, condition: "available", status: "draft" };
  }
  return { nameEn: e.name.en, nameAr: e.name.ar, slug: e.slug, modelCode: e.modelCode, categoryId: e.categoryId, descEn: e.descriptions.en, descAr: e.descriptions.ar, availability: e.availability, operator: e.operator, featured: e.featured, quantityTotal: e.quantityTotal, quantityAvailable: e.quantityAvailable, condition: e.condition, status: e.status };
}

const AVAILABILITY_LABELS: Record<EquipmentAvailability, string> = { rent: "Rent", supply: "Supply", both: "Rent & Supply" };
const CONDITION_LABELS: Record<EquipmentCondition, string> = { available: "Available", rented: "Rented", maintenance: "Maintenance" };

export default function EquipmentPage() {
  const { data: categories, loading: catLoading, create: createCat, update: updateCat, remove: removeCat, refresh: refreshCats } = useCollection<EquipmentCategory>("equipment-categories");
  const { data: equipments, loading: eqLoading, create: createEq, update: updateEq, remove: removeEq, refresh: refreshEq } = useCollection<Equipment>("equipment");

  const [activeTab, setActiveTab] = useState<"categories" | "equipment">("categories");
  const [catOpen, setCatOpen] = useState(false);
  const [catEditing, setCatEditing] = useState<EquipmentCategory | null>(null);
  const [catDeleteId, setCatDeleteId] = useState<string | null>(null);
  const catForm = useForm<CategoryFormData>({ resolver: zodResolver(categorySchema) as any, defaultValues: toCategoryFormData(null) });

  const [eqOpen, setEqOpen] = useState(false);
  const [eqEditing, setEqEditing] = useState<Equipment | null>(null);
  const [eqDeleteId, setEqDeleteId] = useState<string | null>(null);
  const eqForm = useForm<EquipmentFormData>({ resolver: zodResolver(equipmentSchema) as any, defaultValues: toEquipmentFormData(null) });

  useEffect(() => { refreshCats(); refreshEq(); }, [refreshCats, refreshEq]);

  if (catLoading || eqLoading) return null;

  const catList = (categories ?? []).sort((a, b) => a.order - b.order);
  const eqList = (equipments ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const catIsPublished = catForm.getValues().status === "published";
  const catArMissing = !catForm.getValues().nameAr || !catForm.getValues().descAr;
  const eqIsPublished = eqForm.getValues().status === "published";
  const eqArMissing = !eqForm.getValues().nameAr || !eqForm.getValues().descAr;

  const handleCatSubmit = async (data: CategoryFormData) => {
    try {
      const payload = { name: { en: data.nameEn, ar: data.nameAr }, slug: data.slug, description: { en: data.descEn, ar: data.descAr }, icon: data.icon, order: data.order, active: data.active, status: data.status };
      if (catEditing) await updateCat(catEditing.id, payload as any, "admin");
      else await createCat(payload as any, "admin");
      setCatOpen(false); setCatEditing(null); await refreshCats();
    } catch {}
  };
  const handleCatDelete = async () => { if (!catDeleteId) return; await removeCat(catDeleteId, "admin"); setCatDeleteId(null); await refreshCats(); };

  const handleEqSubmit = async (data: EquipmentFormData) => {
    try {
      const payload = { name: { en: data.nameEn, ar: data.nameAr }, slug: data.slug, modelCode: data.modelCode, categoryId: data.categoryId, descriptions: { en: data.descEn, ar: data.descAr }, images: [], availability: data.availability, operator: data.operator, featured: data.featured, quantityTotal: data.quantityTotal, quantityAvailable: data.quantityAvailable, condition: data.condition, specs: {}, features: [], applications: [], brochure: data.brochure, status: data.status };
      if (eqEditing) await updateEq(eqEditing.id, payload as any, "admin");
      else await createEq(payload as any, "admin");
      setEqOpen(false); setEqEditing(null); await refreshEq();
    } catch {}
  };
  const handleEqDelete = async () => { if (!eqDeleteId) return; await removeEq(eqDeleteId, "admin"); setEqDeleteId(null); await refreshEq(); };

  const adjustQuantity = async (id: string, delta: number) => {
    const item = eqList.find((e) => e.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.quantityAvailable || 0) + delta);
    await updateEq(id, { quantityAvailable: newQty }, "admin");
    await refreshEq();
  };

  const duplicateEquipment = async (id: string) => {
    const item = eqList.find((e) => e.id === id);
    if (!item) return;
    await createEq({ ...item, name: { en: `${item.name.en} (Copy)`, ar: `${item.name.ar} (نسخة)` }, slug: `${item.slug}-copy`, images: [], quantityAvailable: item.quantityTotal } as any, "admin");
    await refreshEq();
  };

  const tabButton = (value: "categories" | "equipment", label: string) => (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors border-b-2",
        activeTab === value ? "border-brand-blue text-brand-blue bg-brand-blue/10" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Equipment"
        description="Manage equipment inventory, categories, and availability."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Equipment" }]}
      />

      <div className="flex gap-1 mb-6">
        {tabButton("categories", "Categories")}
        {tabButton("equipment", "Equipment")}
      </div>

      {activeTab === "categories" && (
        <>
          <div className="mb-4">
            <Button onClick={() => { setCatEditing(null); catForm.reset(toCategoryFormData(null)); setCatOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {catList.length === 0 ? (
              <EmptyState title="No equipment categories yet" iconKey="Package" />
            ) : (
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Name" },
                  { accessorKey: "status", header: "Status" },
                  { accessorKey: "active", header: "Active" },
                ] as any}
                data={catList as any}
                rowActions={(row: any) => (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setCatEditing(row); catForm.reset(toCategoryFormData(row)); setCatOpen(true); }} className="p-2 text-muted-foreground hover:text-brand-blue"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setCatDeleteId(row.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              />
            )}
          </div>

          <Sheet open={catOpen} onOpenChange={setCatOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{catEditing ? "Edit Category" : "Add Category"}</SheetTitle>
                <SheetDescription>Bilingual category details.</SheetDescription>
              </SheetHeader>
              <form onSubmit={catForm.handleSubmit(handleCatSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (EN)</label><Input {...catForm.register("nameEn")} placeholder="Category name" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (AR)</label><Input {...catForm.register("nameAr")} placeholder="اسم الفئة" dir="rtl" /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Slug</label><SlugInput value={catForm.getValues().slug} onChange={(v) => catForm.setValue("slug", v)} sourceName={catForm.getValues().nameEn} /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (EN)</label><Input {...catForm.register("descEn")} placeholder="Description" /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (AR)</label><Input {...catForm.register("descAr")} placeholder="الوصف" dir="rtl" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Icon</label><IconPicker value={catForm.getValues().icon} onChange={(v) => catForm.setValue("icon", v)} /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Order</label><Input type="number" {...catForm.register("order")} className="h-8" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                    <Select value={catForm.getValues().status} onValueChange={(v) => catForm.setValue("status", v as "published" | "draft")}>
                      <SelectTrigger><SelectValue placeholder={catForm.getValues().status} /></SelectTrigger>
                      <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                    </Select>
                    {catIsPublished && catArMissing && <p className="text-xs text-destructive">Arabic required for published.</p>}
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="text-xs font-medium text-muted-foreground">Active</label>
                    <button onClick={() => catForm.setValue("active", !catForm.getValues().active)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", catForm.getValues().active ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
                      <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", catForm.getValues().active ? "translate-x-6" : "translate-x-1")} />
                    </button>
                  </div>
                </div>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={catIsPublished && catArMissing} className="bg-brand-blue text-white">{catEditing ? "Update" : "Create"}</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
          <ConfirmDialog open={!!catDeleteId} onOpenChange={(v) => { if (!v) setCatDeleteId(null); }} title="Delete category" description="This action cannot be undone." onConfirm={handleCatDelete} confirmLabel="Delete" />
        </>
      )}

      {activeTab === "equipment" && (
        <>
          <div className="mb-4">
            <Button onClick={() => { setEqEditing(null); eqForm.reset(toEquipmentFormData(null)); setEqOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Equipment
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Select value="" onValueChange={() => {}}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{catList.map((c) => <SelectItem key={c.id} value={c.id}>{c.name.en}</SelectItem>)}</SelectContent>
                </Select>
                <Select value="" onValueChange={() => {}}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Availability" /></SelectTrigger>
                  <SelectContent><SelectItem value="rent">Rent</SelectItem><SelectItem value="supply">Supply</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {eqList.some((e) => (e.quantityAvailable || 0) === 0) && (
            <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-amber-800">Low stock: {eqList.filter((e) => (e.quantityAvailable || 0) === 0).length} item(s) have zero available quantity.</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {eqList.length === 0 ? (
              <EmptyState title="No equipment yet" iconKey="Package" />
            ) : (
              <table className="w-full text-sm divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground w-20">Image</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Name / Model</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Availability</th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground">Condition</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24">Qty Avail</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eqList.map((eq) => {
                    const lowStock = (eq.quantityAvailable || 0) === 0;
                    return (
                      <tr key={eq.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                        </td>
                        <td className="p-3"><div className="text-sm font-medium text-foreground">{eq.name.en}</div><div className="text-xs text-muted-foreground">{eq.modelCode}</div></td>
                        <td className="p-3 text-sm text-muted-foreground">{eq.categoryName || "—"}</td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{eq.availability}</td>
                        <td className="p-3 text-sm text-muted-foreground capitalize">{eq.condition}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => adjustQuantity(eq.id, -1)} className="p-1.5 text-xs text-muted-foreground hover:text-destructive" disabled={lowStock}><MinusCircle className="w-3 h-3" /></button>
                            <span className={cn("text-sm font-medium", lowStock ? "text-destructive" : "text-foreground")}>{eq.quantityAvailable}</span>
                            <button onClick={() => adjustQuantity(eq.id, 1)} className="p-1.5 text-xs text-muted-foreground hover:text-brand-blue"><PlusCircle className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEqEditing(eq); eqForm.reset(toEquipmentFormData(eq)); setEqOpen(true); }} className="p-2 text-muted-foreground hover:text-brand-blue" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => duplicateEquipment(eq.id)} className="p-2 text-muted-foreground hover:text-brand-blue" title="Duplicate"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => setEqDeleteId(eq.id)} className="p-2 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <Sheet open={eqOpen} onOpenChange={setEqOpen}>
            <SheetContent className="max-w-2xl">
              <SheetHeader>
                <SheetTitle>{eqEditing ? "Edit Equipment" : "Add Equipment"}</SheetTitle>
                <SheetDescription>Full equipment details with bilingual descriptions.</SheetDescription>
              </SheetHeader>
              <form onSubmit={eqForm.handleSubmit(handleEqSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (EN)</label><Input {...eqForm.register("nameEn")} placeholder="Equipment name" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Name (AR)</label><Input {...eqForm.register("nameAr")} placeholder="اسم المعدة" dir="rtl" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Slug</label><SlugInput value={eqForm.getValues().slug} onChange={(v) => eqForm.setValue("slug", v)} sourceName={eqForm.getValues().nameEn} /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Model Code</label><Input {...eqForm.register("modelCode")} placeholder="e.g. FI40" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Category</label><Select value={eqForm.getValues().categoryId} onValueChange={(v) => eqForm.setValue("categoryId", v as string)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{catList.map((c) => <SelectItem key={c.id} value={c.id}>{c.name.en}</SelectItem>)}</SelectContent>
                  </Select></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (EN)</label><Textarea {...eqForm.register("descEn")} rows={2} placeholder="Description" /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Description (AR)</label><Textarea {...eqForm.register("descAr")} rows={2} dir="rtl" placeholder="الوصف" /></div>
                </div>

                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Images (multiple, reorder, set cover)</label><ImageGallery value={[] as string[]} onChange={() => {}} /></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Availability</label><Select value={eqForm.getValues().availability} onValueChange={(v) => eqForm.setValue("availability", v as EquipmentAvailability)}>
                    <SelectTrigger><SelectValue placeholder={AVAILABILITY_LABELS[eqForm.getValues().availability]} /></SelectTrigger>
                    <SelectContent><SelectItem value="rent">Rent</SelectItem><SelectItem value="supply">Supply</SelectItem><SelectItem value="both">Rent & Supply</SelectItem></SelectContent>
                  </Select></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Condition</label><Select value={eqForm.getValues().condition} onValueChange={(v) => eqForm.setValue("condition", v as EquipmentCondition)}>
                    <SelectTrigger><SelectValue placeholder={CONDITION_LABELS[eqForm.getValues().condition]} /></SelectTrigger>
                    <SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="rented">Rented</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent>
                  </Select></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Total Quantity</label><Input type="number" {...eqForm.register("quantityTotal")} className="h-8" /></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Available Quantity</label><Input type="number" {...eqForm.register("quantityAvailable")} className="h-8" /></div>
                  <div className="space-y-2 flex items-end"><label className="text-xs font-medium text-muted-foreground">Requires Operator</label><button onClick={() => eqForm.setValue("operator", !eqForm.getValues().operator)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", eqForm.getValues().operator ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}><span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", eqForm.getValues().operator ? "translate-x-6" : "translate-x-1")} /></button></div>
                  <div className="space-y-2 flex items-end"><label className="text-xs font-medium text-muted-foreground">Featured</label><button onClick={() => eqForm.setValue("featured", !eqForm.getValues().featured)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", eqForm.getValues().featured ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}><span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", eqForm.getValues().featured ? "translate-x-6" : "translate-x-1")} /></button></div>
                </div>

                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Specifications</label><SpecTable value={[]} onChange={() => {}} /></div>
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Features (EN/AR)</label><RepeatableList value={[]} onChange={() => {}} placeholder="Feature…" /></div>
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Applications (EN/AR)</label><RepeatableList value={[]} onChange={() => {}} placeholder="Application…" /></div>
                <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Linked Brochure PDF</label><Input {...eqForm.register("brochure")} placeholder="Document ID or URL" /></div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                    <Select value={eqForm.getValues().status} onValueChange={(v) => eqForm.setValue("status", v as "published" | "draft")}>
                      <SelectTrigger><SelectValue placeholder={eqForm.getValues().status} /></SelectTrigger>
                      <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                    </Select>
                    {eqIsPublished && eqArMissing && <p className="text-xs text-destructive">Arabic required for published.</p>}
                  </div>
                  <div></div>
                </div>

                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setEqOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={eqIsPublished && eqArMissing} className="bg-brand-blue text-white">{eqEditing ? "Update" : "Create"}</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmDialog open={!!eqDeleteId} onOpenChange={(v) => { if (!v) setEqDeleteId(null); }} title="Delete equipment" description="This action cannot be undone." onConfirm={handleEqDelete} confirmLabel="Delete" />
        </>
      )}
    </AdminLayout>
  );
}

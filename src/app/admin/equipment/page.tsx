"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
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
import { BilingualField } from "@/components/admin/BilingualField";
import { generateUniqueSlug } from "@/lib/admin/slug";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { SpecTable } from "@/components/admin/SpecTable";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MinusCircle, PlusCircle, Copy, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEquipmentImage } from "@/data/equipmentImages";

const equipmentSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
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

function toEquipmentFormData(e: Equipment | null): EquipmentFormData {
  if (!e) {
    return { nameEn: "", nameAr: "", modelCode: "", categoryId: "", descEn: "", descAr: "", availability: "rent", operator: false, featured: false, quantityTotal: 0, quantityAvailable: 0, condition: "available", status: "draft" };
  }
  return { nameEn: e.name.en, nameAr: e.name.ar, modelCode: e.modelCode, categoryId: e.categoryId, descEn: e.descriptions.en, descAr: e.descriptions.ar, availability: e.availability, operator: e.operator, featured: e.featured, quantityTotal: e.quantityTotal, quantityAvailable: e.quantityAvailable, condition: e.condition, status: e.status };
}

const AVAILABILITY_LABELS: Record<EquipmentAvailability, string> = { rent: "Rent", supply: "Supply", both: "Rent & Supply" };
const CONDITION_LABELS: Record<EquipmentCondition, string> = { available: "Available", rented: "Rented", maintenance: "Maintenance" };

export default function EquipmentPage() {
  const { data: categories, loading: catLoading, refresh: refreshCats } = useCollection<EquipmentCategory>("equipment-categories");
  const { data: equipments, loading: eqLoading, create: createEq, update: updateEq, remove: removeEq, refresh: refreshEq } = useCollection<Equipment>("equipment");

  const [eqOpen, setEqOpen] = useState(false);
  const [eqEditing, setEqEditing] = useState<Equipment | null>(null);
  const [eqDeleteId, setEqDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const eqForm = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema) as Resolver<EquipmentFormData>,
    defaultValues: toEquipmentFormData(null),
  });
  const eqFormValues = eqForm.watch();

  useEffect(() => { refreshCats(); refreshEq(); }, [refreshCats, refreshEq]);

  if (catLoading || eqLoading) return null;

  const catList = [...(categories ?? [])].sort((a, b) => a.order - b.order);
  const eqList = [...(equipments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const eqIsPublished = eqFormValues.status === "published";
  const eqArMissing = !eqFormValues.nameAr || !eqFormValues.descAr;

  const handleEqSubmit = async (data: EquipmentFormData) => {
    try {
      const payload: Omit<Equipment, "id" | "createdAt" | "updatedAt"> = {
        name: { en: data.nameEn, ar: data.nameAr },
        slug: generateUniqueSlug(
          data.nameEn,
          eqList.map((item) => item.slug),
          eqEditing?.slug,
        ),
        modelCode: data.modelCode,
        categoryId: data.categoryId,
        descriptions: { en: data.descEn, ar: data.descAr },
        images: [],
        availability: data.availability,
        operator: data.operator,
        featured: data.featured,
        quantityTotal: data.quantityTotal,
        quantityAvailable: data.quantityAvailable,
        condition: data.condition,
        specs: {},
        features: [],
        applications: [],
        brochure: data.brochure,
        status: data.status,
      };
      if (eqEditing) await updateEq(eqEditing.id, payload, "admin");
      else await createEq(payload, "admin");
      setEqOpen(false);
      setEqEditing(null);
      await refreshEq();
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
    const copy: Omit<Equipment, "id" | "createdAt" | "updatedAt"> = {
      name: { en: `${item.name.en} (Copy)`, ar: `${item.name.ar} (نسخة)` },
      slug: `${item.slug}-copy`,
      modelCode: item.modelCode,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      descriptions: item.descriptions,
      images: [],
      coverImage: item.coverImage,
      availability: item.availability,
      operator: item.operator,
      featured: item.featured,
      quantityTotal: item.quantityTotal,
      quantityAvailable: item.quantityTotal,
      condition: item.condition,
      specs: item.specs,
      features: item.features,
      applications: item.applications,
      brochure: item.brochure,
      status: item.status,
    };
    await createEq(copy, "admin");
    await refreshEq();
  };

  const filteredEquipment = eqList.filter((item) => {
    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter;
    const matchesAvailability =
      availabilityFilter === "all" || item.availability === availabilityFilter;
    return matchesCategory && matchesAvailability;
  });

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Equipment"
        description="Manage equipment inventory and availability."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Equipment" }]}
        action={
          <Button
            onClick={() => {
              setEqEditing(null);
              eqForm.reset(toEquipmentFormData(null));
              setEqOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        }
      />

      <>
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              if (value !== null) setCategoryFilter(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {catList.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={availabilityFilter}
            onValueChange={(value) => {
              if (value !== null) setAvailabilityFilter(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="supply">Supply</SelectItem>
              <SelectItem value="both">Rent & Supply</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {eqList.some((item) => (item.quantityAvailable || 0) === 0) && (
          <div className="mb-6 rounded-xl border border-amber-200/50 bg-amber-50 p-4 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Low stock: {eqList.filter((item) => (item.quantityAvailable || 0) === 0).length} item(s) have zero available quantity.
            </p>
          </div>
        )}

        {eqList.length === 0 ? (
          <EmptyState title="No equipment yet" iconKey="Package" />
        ) : filteredEquipment.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="font-medium text-foreground">No equipment matches these filters.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setAvailabilityFilter("all");
              }}
              className="mt-2 text-sm font-medium text-brand-blue hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEquipment.map((eq, index) => {
              const category = catList.find((item) => item.id === eq.categoryId);
              const storedImage = eq.coverImage || eq.images[0];
              const image =
                storedImage?.startsWith("/") || storedImage?.startsWith("http")
                  ? storedImage
                  : getEquipmentImage(category?.slug ?? "", index);
              const lowStock = (eq.quantityAvailable || 0) === 0;

              return (
                <article
                  key={eq.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/7] bg-muted">
                    <Image
                      src={image}
                      alt={eq.name.en}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute start-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium capitalize text-foreground shadow-sm">
                      {category?.name.en || eq.categoryName || "Uncategorized"}
                    </span>
                    <div className="absolute end-3 top-3">
                      <StatusBadge status={eq.status} />
                    </div>
                  </div>
                  <div className="flex h-full flex-col p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 font-semibold text-foreground">
                          {eq.name.en}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {eq.modelCode}
                        </p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((current) => current === eq.id ? null : eq.id)
                          }
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Actions for ${eq.name.en}`}
                          aria-expanded={openMenuId === eq.id}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {openMenuId === eq.id && (
                          <div
                            role="menu"
                            className="absolute end-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setEqEditing(eq);
                                eqForm.reset(toEquipmentFormData(eq));
                                setEqOpen(true);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                void duplicateEquipment(eq.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setEqDeleteId(eq.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-0 text-sm leading-relaxed text-muted-foreground">
                      {eq.descriptions.en}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={eq.availability} />
                      <StatusBadge status={eq.condition} />
                      {lowStock && <StatusBadge status="Low stock" />}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Available units</p>
                        <p className={cn("font-semibold", lowStock ? "text-destructive" : "text-foreground")}>
                          {eq.quantityAvailable} <span className="font-normal text-muted-foreground">/ {eq.quantityTotal}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void adjustQuantity(eq.id, -1)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-40"
                          disabled={lowStock}
                          aria-label={`Decrease ${eq.name.en} quantity`}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void adjustQuantity(eq.id, 1)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-brand-blue"
                          aria-label={`Increase ${eq.name.en} quantity`}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

          <Sheet open={eqOpen} onOpenChange={setEqOpen}>
            <SheetContent className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[52rem] sm:!max-w-[calc(100vw-2rem)]">
              <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
                  Equipment catalog
                </p>
                <SheetTitle className="text-xl">
                  {eqEditing ? "Edit Equipment" : "Add Equipment"}
                </SheetTitle>
                <SheetDescription>
                  Manage equipment details, availability, and customer-facing content.
                </SheetDescription>
              </SheetHeader>
              <form
                onSubmit={eqForm.handleSubmit(handleEqSubmit)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                  <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">Equipment details</h3>
                      <p className="text-sm text-muted-foreground">
                        Add the name, category, model, and descriptions.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <BilingualField
                        label="Name"
                        value={{ en: eqFormValues.nameEn, ar: eqFormValues.nameAr }}
                        onChange={(field, value) =>
                          eqForm.setValue(field === "en" ? "nameEn" : "nameAr", value, {
                            shouldDirty: true,
                          })
                        }
                        error={eqForm.formState.errors.nameEn?.message}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Model Code</label>
                        <Input {...eqForm.register("modelCode")} placeholder="e.g. FI40" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Category</label>
                        <Select
                          value={eqForm.getValues().categoryId}
                          onValueChange={(value) => {
                            if (value !== null) eqForm.setValue("categoryId", value);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {catList.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <BilingualField
                          label="Description"
                          value={{ en: eqFormValues.descEn, ar: eqFormValues.descAr }}
                          onChange={(field, value) =>
                            eqForm.setValue(field === "en" ? "descEn" : "descAr", value, {
                              shouldDirty: true,
                            })
                          }
                          multiline
                          error={eqForm.formState.errors.descEn?.message}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">Images</h3>
                      <p className="text-sm text-muted-foreground">
                        Add images, arrange their order, and choose a cover image.
                      </p>
                    </div>
                    <ImageGallery value={[] as string[]} onChange={() => {}} />
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">Availability & inventory</h3>
                      <p className="text-sm text-muted-foreground">
                        Set rental options, condition, and stock quantities.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Availability</label>
                        <Select
                          value={eqForm.getValues().availability}
                          onValueChange={(value) => eqForm.setValue("availability", value as EquipmentAvailability)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={AVAILABILITY_LABELS[eqForm.getValues().availability]} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="supply">Supply</SelectItem>
                            <SelectItem value="both">Rent & Supply</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Condition</label>
                        <Select
                          value={eqForm.getValues().condition}
                          onValueChange={(value) => eqForm.setValue("condition", value as EquipmentCondition)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={CONDITION_LABELS[eqForm.getValues().condition]} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Total Quantity</label>
                        <Input type="number" {...eqForm.register("quantityTotal")} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Available Quantity</label>
                        <Input type="number" {...eqForm.register("quantityAvailable")} />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          {...eqForm.register("operator")}
                          className="h-4 w-4"
                        />
                        Requires operator
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          {...eqForm.register("featured")}
                          className="h-4 w-4"
                        />
                        Featured
                      </label>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">Technical details</h3>
                      <p className="text-sm text-muted-foreground">
                        Add specifications, features, applications, and a brochure.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specifications</label>
                      <SpecTable value={[]} onChange={() => {}} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Features (EN/AR)</label>
                      <RepeatableList value={[]} onChange={() => {}} placeholder="Feature…" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Applications (EN/AR)</label>
                      <RepeatableList value={[]} onChange={() => {}} placeholder="Application…" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Linked Brochure PDF</label>
                      <Input {...eqForm.register("brochure")} placeholder="Document ID or URL" />
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">Publishing</h3>
                      <p className="text-sm text-muted-foreground">
                        Set the website visibility for this equipment.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Status</label>
                      <Select
                        value={eqForm.getValues().status}
                        onValueChange={(value) => eqForm.setValue("status", value as "published" | "draft")}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      {eqIsPublished && eqArMissing && (
                        <p className="mt-1 text-xs text-destructive">Arabic required for published.</p>
                      )}
                    </div>
                  </section>
                </div>
                <SheetFooter className="mt-0 shrink-0 flex-row justify-end border-t border-border bg-background px-5 py-4 sm:px-7">
                  <Button type="button" variant="outline" onClick={() => setEqOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={eqIsPublished && eqArMissing}
                    className="bg-brand-blue text-white"
                  >
                    {eqEditing ? "Update" : "Create"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmDialog open={!!eqDeleteId} onOpenChange={(v) => { if (!v) setEqDeleteId(null); }} title="Delete equipment" description="This action cannot be undone." onConfirm={handleEqDelete} confirmLabel="Delete" />
        </>
    </AdminLayout>
  );
}

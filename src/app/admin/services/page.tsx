"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { servicesRepo } from "@/lib/admin/store";
import type { Service } from "@/lib/admin/types";
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
import { ImageUploader } from "@/components/admin/ImageUploader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortEn: z.string().min(1, "English short description is required"),
  shortAr: z.string().min(1, "Arabic short description is required"),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string().min(1, "Arabic description is required"),
  category: z.string().min(1, "Category is required"),
  icon: z.string().min(1, "Icon is required"),
  order: z.coerce.number().min(0),
  active: z.boolean(),
  status: z.enum(["published", "draft"]),
  image: z.string().optional(),
  linkedPdf: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

function toFormData(service: Service | null): ServiceFormData {
  if (!service) {
    return {
      nameEn: "", nameAr: "", slug: "", shortEn: "", shortAr: "",
      descEn: "", descAr: "", category: "", icon: "Tool", order: 0,
      active: true, status: "draft", image: undefined, linkedPdf: undefined,
    };
  }
  return {
    nameEn: service.name.en,
    nameAr: service.name.ar,
    slug: service.slug,
    shortEn: service.shortDescription.en,
    shortAr: service.shortDescription.ar,
    descEn: service.description.en,
    descAr: service.description.ar,
    category: service.category,
    icon: service.icon,
    order: service.order,
    active: service.active,
    status: service.status,
    image: service.image,
    linkedPdf: service.linkedPdf,
  };
}

export default function ServicesPage() {
  const {
    data: services,
    loading,
    create,
    update,
    remove,
    refresh,
  } = useCollection<Service>("services");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: toFormData(null),
  });

  const list = useMemo(
    () => (services ?? []).sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)),
    [services],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return null;

  const isPublished = form.getValues().status === "published";
  const arMissing =
    !form.getValues().nameAr ||
    !form.getValues().shortAr ||
    !form.getValues().descAr;

  const openCreate = () => {
    setEditing(null);
    form.reset(toFormData(null));
    setUnsaved(false);
    setOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    form.reset(toFormData(service));
    setUnsaved(false);
    setOpen(true);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      const payload: Partial<Service> & {
        name: { en: string; ar: string };
        shortDescription: { en: string; ar: string };
        description: { en: string; ar: string };
        highlights: { en: string; ar: string }[];
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        slug: data.slug,
        shortDescription: { en: data.shortEn, ar: data.shortAr },
        description: { en: data.descEn, ar: data.descAr },
        category: data.category,
        icon: data.icon,
        highlights: [],
        image: data.image,
        linkedPdf: data.linkedPdf,
        order: data.order,
        active: data.active,
        status: data.status,
      };

      if (editing) {
        await update(editing.id, payload as Partial<Omit<Service, "id" | "createdAt">>, "admin");
      } else {
        await create(payload as Omit<Service, "id" | "createdAt" | "updatedAt">, "admin");
      }
      setUnsaved(false);
      setOpen(false);
      setEditing(null);
      await refresh();
    } catch {
      // errors handled by useCollection toasts
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId, "admin");
    setDeleteId(null);
    await refresh();
  };

  const columns = [
    { accessorKey: "image", header: "Image", sortable: false, cell: renderImageCell },
    { accessorKey: "name", header: "Name", sortable: true },
    { accessorKey: "category", header: "Category", sortable: true },
    { accessorKey: "status", header: "Status", sortable: true },
    { accessorKey: "active", header: "Active", sortable: true },
  ];

  function renderImageCell(value: unknown, row: Service): ReactNode {
    const image = typeof value === "string" && value ? value : row.image;
    if (!image) return <span className="text-xs text-muted-foreground">—</span>;
    const isPublic = image.startsWith("/") || image.startsWith("http");
    return (
      <div className="flex items-center gap-2">
        {isPublic ? (
          <img
            src={image}
            alt={row.name.en}
            className="w-8 h-8 object-cover rounded border border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded border border-border flex items-center justify-center text-xs text-muted-foreground bg-muted">
            <ImageIcon className="w-4 h-4 mr-1" /> uploaded
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Services"
        description="Manage bilingual service listings shown on the website and chatbot."
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Services" },
        ]}
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <EmptyState title="No services yet" iconKey="Package" />
        ) : (
          <DataTable
            columns={columns as any}
            data={list as any}
            rowActions={(row: any) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(row)}
                  className="p-2 text-muted-foreground hover:text-brand-blue"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setDeleteId(row.id); }}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            emptyMessage="No services yet."
          />
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Service" : "Add Service"}</SheetTitle>
            <SheetDescription>
              Fill in bilingual details. Arabic is required for published services.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Name (EN)</label>
                <Input {...form.register("nameEn")} placeholder="Service name" />
                {form.formState.errors.nameEn && (
                  <p className="text-xs text-destructive">{form.formState.errors.nameEn.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Name (AR)</label>
                <Input {...form.register("nameAr")} placeholder="اسم الخدمة" dir="rtl" />
                {form.formState.errors.nameAr && (
                  <p className="text-xs text-destructive">{form.formState.errors.nameAr.message}</p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Slug</label>
                <div className="relative">
                  <SlugInput
                    value={form.getValues().slug}
                    onChange={(v) => form.setValue("slug", v)}
                    sourceName={form.getValues().nameEn}
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Category</label>
                <Input {...form.register("category")} placeholder="e.g. Machining Services" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Icon</label>
                <IconPicker value={form.getValues().icon} onChange={(v) => form.setValue("icon", v)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Display Order</label>
                <Input type="number" {...form.register("order")} className="h-8" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Linked PDF (from Documents)</label>
                <Input {...form.register("linkedPdf")} placeholder="Document ID or URL" />
                <p className="text-xs text-muted-foreground">Reference a document ID from the Documents module.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Short Description</label>
              <div className="grid grid-cols-2 gap-4">
                <BilingualField
                  value={{
                    en: form.getValues().shortEn,
                    ar: form.getValues().shortAr,
                  }}
                  onChange={(field, val) =>
                    form.setValue(field === "en" ? "shortEn" : "shortAr", val)
                  }
                  error={form.formState.errors.shortEn?.message || form.formState.errors.shortAr?.message}
                />
              </div>
              {form.formState.errors.shortEn && (
                <p className="text-xs text-destructive">{form.formState.errors.shortEn.message}</p>
              )}
              {form.formState.errors.shortAr && (
                <p className="text-xs text-destructive">{form.formState.errors.shortAr.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Full Description</label>
              <div className="grid grid-cols-2 gap-4">
                <BilingualField
                  value={{
                    en: form.getValues().descEn,
                    ar: form.getValues().descAr,
                  }}
                  onChange={(field, val) =>
                    form.setValue(field === "en" ? "descEn" : "descAr", val)
                  }
                  error={form.formState.errors.descEn?.message || form.formState.errors.descAr?.message}
                />
              </div>
              {form.formState.errors.descEn && (
                <p className="text-xs text-destructive">{form.formState.errors.descEn.message}</p>
              )}
              {form.formState.errors.descAr && (
                <p className="text-xs text-destructive">{form.formState.errors.descAr.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Highlights (EN/AR)</label>
              <RepeatableList
                value={[]}
                onChange={() => {}}
                placeholder="Highlight text…"
              />
              <p className="text-xs text-muted-foreground">Highlights can be added per language.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Image</label>
              <ImageUploader
                value={form.getValues().image}
                onChange={(v) => form.setValue("image", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                <Select
                  value={form.getValues().status}
                  onValueChange={(v) => form.setValue("status", v as "published" | "draft")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.getValues().status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                {isPublished && arMissing && (
                  <p className="text-xs text-destructive">
                    Arabic fields are required for published services.
                  </p>
                )}
              </div>
              <div className="space-y-2 flex items-end">
                <label className="text-xs font-medium text-muted-foreground">Active</label>
                <button
                  onClick={() => form.setValue("active", !form.getValues().active)}
                  className={cn(
                    "relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5",
                    form.getValues().active
                      ? "bg-brand-blue border-brand-blue"
                      : "bg-input border-border",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      form.getValues().active ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPublished && arMissing}
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                {editing ? "Update Service" : "Create Service"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Delete service"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel="Delete"
      />

      {unsaved && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg">
          <p className="text-sm text-amber-800">You have unsaved changes.</p>
        </div>
      )}
    </AdminLayout>
  );
}

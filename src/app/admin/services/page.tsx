"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import type { Service } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { BilingualField } from "@/components/admin/BilingualField";
import { IconPicker } from "@/components/admin/IconPicker";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ServiceDocumentUploader } from "@/components/admin/ServiceDocumentUploader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Edit,
  MoreVertical,
  Plus,
  Power,
  Trash2,
  Wrench,
} from "lucide-react";
import { getServiceCategoryLabel } from "@/lib/admin/serviceCategory";
import { generateUniqueSlug } from "@/lib/admin/slug";

const serviceSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string(),
  titleEn: z.string().min(1, "English title is required"),
  titleAr: z.string(),
  subtitleEn: z.string().min(1, "English subtitle is required"),
  subtitleAr: z.string(),
  shortEn: z.string().min(1, "English short description is required"),
  shortAr: z.string(),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string(),
  categoryEn: z.string().min(1, "English category is required"),
  categoryAr: z.string(),
  highlights: z.array(z.object({ id: z.string(), en: z.string(), ar: z.string() })),
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
      nameEn: "",
      nameAr: "",
      titleEn: "",
      titleAr: "",
      subtitleEn: "",
      subtitleAr: "",
      shortEn: "",
      shortAr: "",
      descEn: "",
      descAr: "",
      categoryEn: "",
      categoryAr: "",
      highlights: [],
      icon: "Tool",
      order: 0,
      active: true,
      status: "draft",
      image: undefined,
      linkedPdf: undefined,
    };
  }
  return {
    nameEn: service.name.en,
    nameAr: service.name.ar,
    titleEn: service.title?.en || service.name.en,
    titleAr: service.title?.ar || service.name.ar,
    subtitleEn: service.subtitle?.en || service.shortDescription.en,
    subtitleAr: service.subtitle?.ar || service.shortDescription.ar,
    shortEn: service.shortDescription.en,
    shortAr: service.shortDescription.ar,
    descEn: service.description.en,
    descAr: service.description.ar,
    categoryEn: getServiceCategoryLabel(
      service.category,
      service.categoryLocalized,
      "en",
    ),
    categoryAr: getServiceCategoryLabel(
      service.category,
      service.categoryLocalized,
      "ar",
    ),
    highlights: service.highlights.map((item, index) => ({
      id: `highlight-${index}`,
      en: item.en,
      ar: item.ar,
    })),
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as Resolver<ServiceFormData>,
    defaultValues: toFormData(null),
  });
  const list = useMemo(
    () => [...(services ?? [])].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt)),
    [services],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return null;

  const formValues = form.watch();
  const isPublished = formValues.status === "published";
  const arMissing =
    !formValues.nameAr.trim() ||
    !formValues.titleAr.trim() ||
    !formValues.subtitleAr.trim() ||
    !formValues.categoryAr.trim() ||
    !formValues.shortAr.trim() ||
    !formValues.descAr.trim() ||
    formValues.highlights.some((item) => !item.en.trim() || !item.ar.trim());
  const missingPublishedContent =
    arMissing ||
    !formValues.highlights.some((item) => item.en.trim() || item.ar.trim());

  const openCreate = () => {
    setEditing(null);
    form.reset(toFormData(null));
    setOpenMenuId(null);
    setOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    form.reset(toFormData(service));
    setOpenMenuId(null);
    setOpen(true);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      const payload: Omit<Service, "id" | "createdAt" | "updatedAt"> = {
        name: { en: data.nameEn, ar: data.nameAr },
        title: { en: data.titleEn, ar: data.titleAr },
        subtitle: { en: data.subtitleEn, ar: data.subtitleAr },
        slug: generateUniqueSlug(
          data.nameEn,
          list.map((service) => service.slug),
          editing?.slug,
        ),
        shortDescription: { en: data.shortEn, ar: data.shortAr },
        description: { en: data.descEn, ar: data.descAr },
        category: data.categoryEn,
        categoryLocalized: { en: data.categoryEn, ar: data.categoryAr },
        icon: data.icon,
        highlights: data.highlights
          .filter((item) => item.en.trim() || item.ar.trim())
          .map(({ en, ar }) => ({ en: en.trim(), ar: ar.trim() })),
        image: data.image,
        linkedPdf: data.linkedPdf || undefined,
        order: data.order,
        active: data.active,
        status: data.status,
      };

      if (editing) {
        await update(editing.id, payload, "admin");
      } else {
        await create(payload, "admin");
      }
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

  const toggleServiceActive = async (service: Service) => {
    try {
      await update(service.id, { active: !service.active }, "admin");
      setOpenMenuId(null);
      await refresh();
    } catch {
      // Errors are surfaced by useCollection.
    }
  };

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

      <div>
        {list.length === 0 ? (
          <EmptyState title="No services yet" iconKey="Package" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((service) => {
              const isPublicImage =
                service.image?.startsWith("/") ||
                service.image?.startsWith("http");

              return (
                <article
                  key={service.id}
                  className="relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      {isPublicImage && service.image ? (
                        <Image
                          src={service.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Wrench className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-semibold text-foreground">
                        {service.name.en}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {getServiceCategoryLabel(
                          service.category,
                          service.categoryLocalized,
                          "en",
                        )}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={service.status} />
                        <StatusBadge status={service.active ? "active" : "inactive"} />
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === service.id ? null : service.id,
                          )
                        }
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Actions for ${service.name.en}`}
                        aria-expanded={openMenuId === service.id}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openMenuId === service.id && (
                        <div
                          role="menu"
                          className="absolute end-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => openEdit(service)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => void toggleServiceActive(service)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                          >
                            <Power className="h-4 w-4" />
                            {service.active ? "Set inactive" : "Set active"}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setDeleteId(service.id);
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
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {service.shortDescription.en}
                  </p>
                  <p className="mt-3 truncate text-xs text-muted-foreground/80">
                    /services/{service.slug}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setOpenMenuId(null);
        }}
      >
        <SheetContent className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[52rem] sm:!max-w-[calc(100vw-2rem)]">
            <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
                Service catalog
              </p>
              <SheetTitle className="text-xl">
                {editing ? "Edit Service" : "Add Service"}
              </SheetTitle>
              <SheetDescription>
                Add the service details and translations shown on the customer website.
              </SheetDescription>
            </SheetHeader>
            <form
              id="service-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Service identity</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the name and category in both languages.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <BilingualField
                    label="Name"
                    value={{ en: formValues.nameEn, ar: formValues.nameAr }}
                    onChange={(field, value) =>
                      form.setValue(field === "en" ? "nameEn" : "nameAr", value, {
                        shouldDirty: true,
                      })
                    }
                    error={form.formState.errors.nameEn?.message}
                  />
                  <BilingualField
                    label="Category"
                    value={{ en: formValues.categoryEn, ar: formValues.categoryAr }}
                    onChange={(field, value) =>
                      form.setValue(
                        field === "en" ? "categoryEn" : "categoryAr",
                        value,
                        { shouldDirty: true },
                      )
                    }
                    error={form.formState.errors.categoryEn?.message}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Icon</label>
                    <IconPicker
                      value={formValues.icon}
                      onChange={(value) =>
                        form.setValue("icon", value, { shouldDirty: true })
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Customer-facing content</h3>
                  <p className="text-sm text-muted-foreground">
                    Content is displayed according to the visitor&apos;s language.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <BilingualField
                    label="Title"
                    value={{ en: formValues.titleEn, ar: formValues.titleAr }}
                    onChange={(field, value) =>
                      form.setValue(field === "en" ? "titleEn" : "titleAr", value, {
                        shouldDirty: true,
                      })
                    }
                    error={form.formState.errors.titleEn?.message}
                  />
                  <BilingualField
                    label="Sub Title"
                    value={{ en: formValues.subtitleEn, ar: formValues.subtitleAr }}
                    onChange={(field, value) =>
                      form.setValue(
                        field === "en" ? "subtitleEn" : "subtitleAr",
                        value,
                        { shouldDirty: true },
                      )
                    }
                    error={form.formState.errors.subtitleEn?.message}
                  />
                </div>
                <BilingualField
                  label="Short Description"
                  value={{ en: formValues.shortEn, ar: formValues.shortAr }}
                  onChange={(field, value) =>
                    form.setValue(field === "en" ? "shortEn" : "shortAr", value, {
                      shouldDirty: true,
                    })
                  }
                  multiline
                  error={form.formState.errors.shortEn?.message}
                />
                <BilingualField
                  label="Full Description"
                  value={{ en: formValues.descEn, ar: formValues.descAr }}
                  onChange={(field, value) =>
                    form.setValue(field === "en" ? "descEn" : "descAr", value, {
                      shouldDirty: true,
                    })
                  }
                  multiline
                  error={form.formState.errors.descEn?.message}
                />
                <RepeatableList
                  value={formValues.highlights}
                  onChange={(value) =>
                    form.setValue("highlights", value, { shouldDirty: true })
                  }
                  label="Service bullet points"
                  placeholder="Describe a service feature"
                />
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Files and image</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload an optional PDF and a service image.
                  </p>
                </div>
                <ServiceDocumentUploader
                  value={formValues.linkedPdf}
                  onChange={(value) =>
                    form.setValue("linkedPdf", value, { shouldDirty: true })
                  }
                />
                <div>
                  <label className="mb-2 block text-sm font-medium">Service Image</label>
                  <ImageUploader
                    value={formValues.image}
                    onChange={(value) =>
                      form.setValue("image", value, { shouldDirty: true })
                    }
                    maxSizeMB={5}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <h3 className="font-semibold text-foreground">Publishing settings</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Status</label>
                    <Select
                      value={formValues.status}
                      onValueChange={(value) =>
                        form.setValue("status", value as "published" | "draft", {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published" disabled={missingPublishedContent}>
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {missingPublishedContent && (
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Add at least one service point and complete all Arabic translations before publishing.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Display Order</label>
                    <Input
                      type="number"
                      {...form.register("order", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register("active")}
                    className="h-4 w-4"
                  />
                  Active
                </label>
              </section>
              </div>

                <SheetFooter className="mt-0 shrink-0 flex-row justify-end border-t border-border bg-background px-5 py-4 sm:px-7">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPublished && missingPublishedContent}
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

    </AdminLayout>
  );
}

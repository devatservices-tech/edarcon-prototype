"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import type { Project, ProjectImage } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { BilingualField } from "@/components/admin/BilingualField";
import { ProjectImageGallery } from "@/components/admin/ProjectImageGallery";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, MoreVertical, Trash2 } from "lucide-react";
import { generateUniqueSlug } from "@/lib/admin/slug";

const projectSchema = z.object({
  nameEn: z.string().min(1, "English title is required"),
  nameAr: z.string().min(1, "Arabic title is required"),
  client: z.string().min(1, "Client is required"),
  locationEn: z.string().min(1, "English location is required"),
  locationAr: z.string().min(1, "Arabic location is required"),
  sector: z.string().min(1, "Sector is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(2100, "Invalid year"),
  duration: z.string().min(1, "Duration is required"),
  descEn: z.string().min(1, "English description is required"),
  descAr: z.string().min(1, "Arabic description is required"),
  featured: z.boolean(),
  status: z.enum(["published", "draft"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

function toFormData(p: Project | null): ProjectFormData {
  if (!p) {
    return {
      nameEn: "", nameAr: "", client: "",
      locationEn: "", locationAr: "", sector: "", year: new Date().getFullYear(),
      duration: "", descEn: "", descAr: "", featured: false, status: "draft",
    };
  }
  return {
    nameEn: p.name.en, nameAr: p.name.ar, client: p.client,
    locationEn: p.location.en, locationAr: p.location.ar, sector: p.sector,
    year: p.year, duration: p.duration,
    descEn: p.description.en, descAr: p.description.ar,
    featured: p.featured, status: p.status,
  };
}

const SECTORS = ["Oil & Gas", "Petrochemical", "Civil", "Power", "Infrastructure", "Marine"];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const PROJECT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
];

export default function ProjectsPage() {
  const {
    data: projects,
    loading,
    create,
    update,
    remove,
    refresh,
  } = useCollection<Project>("projects");

  useEffect(() => { refresh(); }, [refresh]);

  const [sectorFilter, setSectorFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormData>,
    defaultValues: toFormData(null),
  });

  const isPublished = form.getValues().status === "published";
  const arMissing =
    !form.getValues().nameAr ||
    !form.getValues().locationAr ||
    !form.getValues().descAr;

  const list = (projects ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const sectors = useMemo(
    () => [...new Set(list.map((p) => p.sector))].sort(),
    [list]
  );
  const years = useMemo(
    () => [...new Set(list.map((p) => p.year))].sort((a, b) => b - a),
    [list]
  );

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchSector = sectorFilter === "all" || p.sector === sectorFilter;
      const matchYear = yearFilter === "all" || String(p.year) === yearFilter;
      return matchSector && matchYear;
    });
  }, [list, sectorFilter, yearFilter]);

  if (loading) return null;

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const scopeOfWork = [
        { en: "", ar: "" },
      ];
      const images: ProjectImage[] = [];
      const payload: Partial<Project> & {
        name: { en: string; ar: string };
        location: { en: string; ar: string };
        description: { en: string; ar: string };
        scopeOfWork: { en: string; ar: string }[];
        images: ProjectImage[];
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        slug: generateUniqueSlug(
          data.nameEn,
          list.map((project) => project.slug),
          editing?.slug,
        ),
        client: data.client,
        location: { en: data.locationEn, ar: data.locationAr },
        sector: data.sector,
        year: data.year,
        duration: data.duration,
        description: { en: data.descEn, ar: data.descAr },
        scopeOfWork,
        images,
        coverImageId: undefined,
        featured: data.featured,
        status: data.status,
      };
      if (editing) {
        await update(editing.id, payload as Partial<Omit<Project, "id" | "createdAt">>, "admin");
      } else {
        await create(payload as Omit<Project, "id" | "createdAt" | "updatedAt">, "admin");
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

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Projects"
        description="Manage featured projects and case studies."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Projects" }]}
        action={
          <Button onClick={() => { setEditing(null); form.reset(toFormData(null)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Select value={sectorFilter} onValueChange={(v) => setSectorFilter(v as string)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sectors</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={(v) => setYearFilter(v as string)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-3"><EmptyState title="No projects match your filters" iconKey="Package" /></div>
        ) : (
          filtered.map((p, index) => {
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-video overflow-hidden rounded-lg border border-border mb-3 relative">
                  <Image
                    src={PROJECT_CARD_IMAGES[index % PROJECT_CARD_IMAGES.length]}
                    alt={`${p.name.en} project`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {p.featured && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded">
                      Featured
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground truncate">{p.name.en}</h3>
                <p className="text-xs text-muted-foreground truncate">{p.name.ar}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{p.sector}</span>
                  <span>{p.year}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description.en}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) => current === p.id ? null : p.id)
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Actions for ${p.name.en}`}
                      aria-expanded={openMenuId === p.id}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {openMenuId === p.id && (
                      <div
                        role="menu"
                        className="absolute end-0 bottom-full z-20 mb-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setEditing(p);
                            form.reset(toFormData(p));
                            setOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setDeleteId(p.id);
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
              </div>
            );
          })
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[52rem] sm:!max-w-[calc(100vw-2rem)]">
          <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
              Project portfolio
            </p>
            <SheetTitle className="text-xl">
              {editing ? "Edit Project" : "Add Project"}
            </SheetTitle>
            <SheetDescription>
              Add bilingual project details, location, and gallery images.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Project details</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the project title, client, location, and timeline.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title (EN)</label>
                    <Input {...form.register("nameEn")} placeholder="Project title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title (AR)</label>
                    <Input {...form.register("nameAr")} placeholder="عنوان المشروع" dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client</label>
                    <Input {...form.register("client")} placeholder="e.g. Saudi Aramco" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (EN)</label>
                    <Input {...form.register("locationEn")} placeholder="City, Region" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (AR)</label>
                    <Input {...form.register("locationAr")} placeholder="المدينة، المنطقة" dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sector</label>
                    <Select
                      value={form.getValues().sector}
                      onValueChange={(value) => {
                        if (value !== null) form.setValue("sector", value);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Select
                      value={String(form.getValues().year)}
                      onValueChange={(value) => form.setValue("year", Number(value))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Input {...form.register("duration")} placeholder="e.g. 6 months" />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Description & gallery</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe the project and add supporting images.
                  </p>
                </div>
                <BilingualField
                  label="Description"
                  value={{ en: form.getValues().descEn, ar: form.getValues().descAr }}
                  onChange={(field, value) =>
                    form.setValue(field === "en" ? "descEn" : "descAr", value, {
                      shouldDirty: true,
                    })
                  }
                  multiline
                  error={form.formState.errors.descEn?.message || form.formState.errors.descAr?.message}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gallery</label>
                  <ProjectImageGallery value={[]} onChange={() => {}} />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Publishing</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose whether this project is published and featured.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Status</label>
                    <Select
                      value={form.getValues().status}
                      onValueChange={(value) => form.setValue("status", value as "published" | "draft")}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    {isPublished && arMissing && (
                      <p className="mt-1 text-xs text-destructive">Arabic required for published.</p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <input
                      type="checkbox"
                      {...form.register("featured")}
                      className="h-4 w-4"
                    />
                    Featured project
                  </label>
                </div>
              </section>
            </div>
            <SheetFooter className="mt-0 shrink-0 flex-row justify-end border-t border-border bg-background px-5 py-4 sm:px-7">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPublished && arMissing}
                className="bg-brand-blue text-white"
              >
                {editing ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete project" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

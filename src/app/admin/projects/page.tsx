"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { projectsRepo } from "@/lib/admin/store";
import type { Project, ProjectImage } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { SlugInput } from "@/components/admin/SlugInput";
import { ProjectImageGallery } from "@/components/admin/ProjectImageGallery";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Image as ImageIcon, Star, Clock, Building, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  nameEn: z.string().min(1, "English title is required"),
  nameAr: z.string().min(1, "Arabic title is required"),
  slug: z.string().min(1, "Slug is required"),
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
      nameEn: "", nameAr: "", slug: "", client: "",
      locationEn: "", locationAr: "", sector: "", year: new Date().getFullYear(),
      duration: "", descEn: "", descAr: "", featured: false, status: "draft",
    };
  }
  return {
    nameEn: p.name.en, nameAr: p.name.ar, slug: p.slug, client: p.client,
    locationEn: p.location.en, locationAr: p.location.ar, sector: p.sector,
    year: p.year, duration: p.duration,
    descEn: p.description.en, descAr: p.description.ar,
    featured: p.featured, status: p.status,
  };
}

const SECTORS = ["Oil & Gas", "Petrochemical", "Civil", "Power", "Infrastructure", "Marine"];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

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

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
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
        slug: data.slug,
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
          filtered.map((p) => {
            const cover = p.images.find((i) => i.id === p.coverImageId) || p.images[0];
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-video overflow-hidden rounded-lg border border-border mb-3 relative">
                  {cover ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-[10px] text-muted-foreground">Image preview</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
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
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <button
                    onClick={() => { setEditing(p); form.reset(toFormData(p)); setOpen(true); }}
                    className="p-1.5 text-muted-foreground hover:text-brand-blue"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Project" : "Add Project"}</SheetTitle>
            <SheetDescription>Bilingual project details with gallery.</SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (EN)</label><Input {...form.register("nameEn")} placeholder="Project title" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (AR)</label><Input {...form.register("nameAr")} placeholder="عنوان المشروع" dir="rtl" /></div>
              <div className="md:col-span-2 space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Slug</label><SlugInput value={form.getValues().slug} onChange={(v) => form.setValue("slug", v)} sourceName={form.getValues().nameEn} /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Client</label><Input {...form.register("client")} placeholder="e.g. Saudi Aramco" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Location (EN)</label><Input {...form.register("locationEn")} placeholder="City, Region" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Location (AR)</label><Input {...form.register("locationAr")} placeholder="المدينة، المنطقة" dir="rtl" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Sector</label><Select value={form.getValues().sector} onValueChange={(v) => form.setValue("sector", v as string)}>
                <SelectTrigger><SelectValue placeholder={form.getValues().sector} /></SelectTrigger>
                <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Year</label><Select value={String(form.getValues().year)} onValueChange={(v) => form.setValue("year", Number(v))}>
                <SelectTrigger><SelectValue placeholder={String(form.getValues().year)} /></SelectTrigger>
                <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Duration</label><Input {...form.register("duration")} placeholder="e.g. 6 months" /></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Description (EN/AR)</label>
              <div className="grid grid-cols-2 gap-4">
                <BilingualField
                  value={{ en: form.getValues().descEn, ar: form.getValues().descAr }}
                  onChange={(field, val) => form.setValue(field === "en" ? "descEn" : "descAr", val)}
                  error={form.formState.errors.descEn?.message || form.formState.errors.descAr?.message}
                />
              </div>
              {form.formState.errors.descEn && <p className="text-xs text-destructive">{form.formState.errors.descEn.message}</p>}
              {form.formState.errors.descAr && <p className="text-xs text-destructive">{form.formState.errors.descAr.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Gallery</label>
              <ProjectImageGallery value={[]} onChange={() => {}} />
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
                <label className="text-xs font-medium text-muted-foreground">Featured</label>
                <button onClick={() => form.setValue("featured", !form.getValues().featured)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", form.getValues().featured ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
                  <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", form.getValues().featured ? "translate-x-6" : "translate-x-1")} />
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

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete project" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

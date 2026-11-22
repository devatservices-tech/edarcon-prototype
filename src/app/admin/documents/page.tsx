"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { documentsRepo } from "@/lib/admin/store";
import type { CompanyDocument, DocumentCategory, DocumentLanguage } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { SlugInput } from "@/components/admin/SlugInput";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const documentSchema = z.object({
  nameEn: z.string().min(1, "English title is required"),
  nameAr: z.string().min(1, "Arabic title is required"),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "ar", "both"]),
  public: z.boolean(),
  status: z.enum(["published", "draft"]),
});

type DocumentFormData = z.infer<typeof documentSchema>;

function toFormData(d: CompanyDocument | null): DocumentFormData {
  if (!d) {
    return { nameEn: "", nameAr: "", category: "Company Profile", language: "both", public: false, status: "draft" };
  }
  return {
    nameEn: d.name.en, nameAr: d.name.ar, category: d.category, language: d.language,
    public: d.public, status: d.status,
  };
}

const CATEGORIES: DocumentCategory[] = ["Company Profile", "Brochure", "Policy", "Price list"];

export default function DocumentsPage() {
  const {
    data: documents,
    loading,
    create,
    update,
    remove,
    refresh,
  } = useCollection<CompanyDocument>("documents");

  useEffect(() => { refresh(); }, [refresh]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema) as any,
    defaultValues: toFormData(null),
  });

  if (loading) return null;

  const list = (documents ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isPublished = form.getValues().status === "published";
  const arMissing = !form.getValues().nameAr;

  const handleSubmit = async (data: DocumentFormData) => {
    try {
      const payload: Partial<CompanyDocument> & {
        name: { en: string; ar: string };
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        category: data.category as DocumentCategory,
        language: data.language as DocumentLanguage,
        fileSize: 0,
        fileName: "",
        downloadCount: 0,
        public: data.public,
        status: data.status,
      };
      if (editing) {
        await update(editing.id, payload as Partial<Omit<CompanyDocument, "id" | "createdAt">>, "admin");
      } else {
        await create(payload as Omit<CompanyDocument, "id" | "createdAt" | "updatedAt">, "admin");
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
        title="Documents"
        description="Downloadable company documents used across the website, catalog, and chatbot."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Documents" }]}
        action={
          <Button onClick={() => { setEditing(null); form.reset(toFormData(null)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Document
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <EmptyState title="No documents yet" iconKey="Package" />
        ) : (
          <DataTable
            columns={[
              { accessorKey: "name", header: "Title" },
              { accessorKey: "category", header: "Category" },
              { accessorKey: "language", header: "Language" },
              { accessorKey: "downloadCount", header: "Downloads" },
              { accessorKey: "public", header: "Public" },
              { accessorKey: "status", header: "Status" },
            ] as any}
            data={list as any}
            rowActions={(row: any) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (row.file) {
                      window.open(`/api/documents/download/${row.id}`, "_blank");
                    }
                  }}
                  className="p-2 text-brand-blue hover:text-brand-blue-dark"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditing(row); form.reset(toFormData(row)); setOpen(true); }}
                  className="p-2 text-muted-foreground hover:text-brand-blue"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(row.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            emptyMessage="No documents yet."
          />
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Document" : "Add Document"}</SheetTitle>
            <SheetDescription>Company document details used across public pages.</SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (EN)</label><Input {...form.register("nameEn")} placeholder="Document title" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (AR)</label><Input {...form.register("nameAr")} placeholder="عنوان المستند" dir="rtl" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Category</label><Select value={form.getValues().category} onValueChange={(v) => form.setValue("category", v as DocumentCategory)}>
                <SelectTrigger><SelectValue placeholder={form.getValues().category} /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Language</label><Select value={form.getValues().language} onValueChange={(v) => form.setValue("language", v as DocumentLanguage)}>
                <SelectTrigger><SelectValue placeholder={form.getValues().language} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English only</SelectItem>
                  <SelectItem value="ar">Arabic only</SelectItem>
                  <SelectItem value="both">Both languages</SelectItem>
                </SelectContent>
              </Select></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-brand-blue-dark"
              />
              {editing?.fileName && (
                <p className="text-xs text-muted-foreground">{editing.fileName} • {(editing.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              )}
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
                <label className="text-xs font-medium text-muted-foreground">Publicly downloadable</label>
                <button onClick={() => form.setValue("public", !form.getValues().public)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", form.getValues().public ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
                  <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", form.getValues().public ? "translate-x-6" : "translate-x-1")} />
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

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete document" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import type { CompanyDocument, DocumentCategory, DocumentLanguage } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { EmptyState } from "@/components/admin/EmptyState";
import { BilingualField } from "@/components/admin/BilingualField";
import { ServiceDocumentUploader } from "@/components/admin/ServiceDocumentUploader";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Download, FileText, MoreVertical, Power } from "lucide-react";
import { cn } from "@/lib/utils";

const documentSchema = z.object({
  nameEn: z.string().min(1, "English title is required"),
  nameAr: z.string().min(1, "Arabic title is required"),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "ar", "both"]),
  public: z.boolean(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

function toFormData(d: CompanyDocument | null): DocumentFormData {
  if (!d) {
    return { nameEn: "", nameAr: "", category: "Company Profile", language: "both", public: false, fileId: undefined, fileName: "", fileSize: 0 };
  }
  return {
    nameEn: d.name.en, nameAr: d.name.ar, category: d.category, language: d.language,
    public: d.public, fileId: d.file, fileName: d.fileName, fileSize: d.fileSize,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema) as Resolver<DocumentFormData>,
    defaultValues: toFormData(null),
  });
  const formValues = form.watch();

  if (loading) return null;

  const list = (documents ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleSubmit = async (data: DocumentFormData) => {
    try {
      const payload: Partial<CompanyDocument> & {
        name: { en: string; ar: string };
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        category: data.category as DocumentCategory,
        language: data.language as DocumentLanguage,
        file: data.fileId,
        fileSize: data.fileSize ?? editing?.fileSize ?? 0,
        fileName: data.fileName ?? editing?.fileName ?? "",
        downloadCount: editing?.downloadCount ?? 0,
        public: data.public,
        status: editing?.status ?? "draft",
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

  const toggleDocumentStatus = async (document: CompanyDocument) => {
    try {
      await update(
        document.id,
        { status: document.status === "published" ? "draft" : "published" },
        "admin",
      );
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
        title="Documents"
        description="Downloadable company documents used across the website, catalog, and chatbot."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Documents" }]}
        action={
          <Button onClick={() => { setEditing(null); form.reset(toFormData(null)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Document
          </Button>
        }
      />

      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState title="No documents yet" iconKey="Package" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((document) => (
            <article
              key={document.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 font-semibold text-foreground">
                    {document.name.en}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground" dir="rtl">
                    {document.name.ar}
                  </p>
                </div>
                <StatusBadge status={document.status} />
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) => current === document.id ? null : document.id)
                    }
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Actions for ${document.name.en}`}
                    aria-expanded={openMenuId === document.id}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenuId === document.id && (
                    <div
                      role="menu"
                      className="absolute end-0 top-full z-20 mt-1 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg"
                    >
                      {document.file && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            window.open(`/api/documents/download/${document.id}`, "_blank");
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setEditing(document);
                          form.reset(toFormData(document));
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
                        onClick={() => void toggleDocumentStatus(document)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        <Power className="h-4 w-4" />
                        {document.status === "published" ? "Set draft" : "Publish"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setDeleteId(document.id);
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

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {document.category}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {document.language === "both" ? "English & Arabic" : document.language === "en" ? "English" : "Arabic"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {document.public ? "Public" : "Private"}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                <p className="truncate font-medium text-foreground">
                  {document.fileName || "No file uploaded"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {document.downloadCount} download{document.downloadCount === 1 ? "" : "s"}
                </p>
              </div>

            </article>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[52rem] sm:!max-w-[calc(100vw-2rem)]">
          <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
              Document library
            </p>
            <SheetTitle className="text-xl">{editing ? "Edit Document" : "Add Document"}</SheetTitle>
            <SheetDescription>
              Add bilingual document details and upload the file visitors can access.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Document details</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the document title in English and Arabic, then choose its category and language.
                  </p>
                </div>
                <BilingualField
                  label="Title"
                  value={{ en: formValues.nameEn, ar: formValues.nameAr }}
                  onChange={(field, value) =>
                    form.setValue(field === "en" ? "nameEn" : "nameAr", value, {
                      shouldDirty: true,
                    })
                  }
                  error={form.formState.errors.nameEn?.message || form.formState.errors.nameAr?.message}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formValues.category}
                      onValueChange={(value) => {
                        if (value !== null) {
                          form.setValue("category", value as DocumentCategory, { shouldDirty: true });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select
                      value={formValues.language}
                      onValueChange={(value) => {
                        if (value !== null) {
                          form.setValue("language", value as DocumentLanguage, { shouldDirty: true });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English only</SelectItem>
                        <SelectItem value="ar">Arabic only</SelectItem>
                        <SelectItem value="both">Both languages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Document file</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF document up to 5 MB.
                  </p>
                </div>
                <ServiceDocumentUploader
                  value={formValues.fileId}
                  documentLabel="company document"
                  onChange={(fileId, file) => {
                    form.setValue("fileId", fileId, { shouldDirty: true });
                    form.setValue("fileName", file?.name ?? "", { shouldDirty: true });
                    form.setValue("fileSize", file?.size ?? 0, { shouldDirty: true });
                  }}
                />
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Access settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Documents are saved as drafts and can be published from their card actions.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Publicly downloadable</label>
                    <p className="text-xs text-muted-foreground">
                      Allow visitors to download this document.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => form.setValue("public", !formValues.public, { shouldDirty: true })}
                    aria-pressed={formValues.public}
                    className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-colors", formValues.public ? "border-brand-blue bg-brand-blue" : "border-border bg-input")}
                  >
                    <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", formValues.public ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
              </section>
            </div>

            <SheetFooter className="mt-0 shrink-0 flex-row justify-end border-t border-border bg-background px-5 py-4 sm:px-7">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-blue text-white hover:bg-brand-blue-dark">
                {editing ? "Update Document" : "Create Document"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete document" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

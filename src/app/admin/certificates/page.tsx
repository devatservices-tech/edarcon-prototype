"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { certificatesRepo } from "@/lib/admin/store";
import type { Certificate, CertificateVersion } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { SlugInput } from "@/components/admin/SlugInput";
import { CertificateFileUploader } from "@/components/admin/CertificateFileUploader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Download, Shield, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const certificateSchema = z.object({
  nameEn: z.string().min(1, "English title is required"),
  nameAr: z.string().min(1, "Arabic title is required"),
  issuingBodyEn: z.string().min(1, "English issuing body is required"),
  issuingBodyAr: z.string().min(1, "Arabic issuing body is required"),
  certificateNumber: z.string().min(1, "Certificate number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  showOnWebsite: z.boolean(),
  status: z.enum(["published", "draft"]),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  versions: z.array(z.any()).optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

function toFormData(c: Certificate | null): CertificateFormData {
  if (!c) {
    return {
      nameEn: "", nameAr: "", issuingBodyEn: "", issuingBodyAr: "",
      certificateNumber: "", issueDate: "", expiryDate: "",
      showOnWebsite: false, status: "draft",
      fileId: undefined, fileName: undefined, fileSize: undefined, versions: undefined,
    };
  }
  return {
    nameEn: c.name.en, nameAr: c.name.ar,
    issuingBodyEn: c.issuingBody.en, issuingBodyAr: c.issuingBody.ar,
    certificateNumber: c.certificateNumber,
    issueDate: c.issueDate, expiryDate: c.expiryDate,
    showOnWebsite: c.showOnWebsite, status: c.status,
    fileId: c.file, fileName: undefined, fileSize: undefined, versions: c.versions,
  };
}

function expiryBadge(expiryDate: string): { label: string; variant: string } {
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", variant: "destructive" };
  if (days <= 60) return { label: `Expiring in ${days} days`, variant: "warning" };
  return { label: "Valid", variant: "default" };
}

export default function CertificatesPage() {
  const {
    data: certificates,
    loading,
    create,
    update,
    remove,
    refresh,
  } = useCollection<Certificate>("certificates");

  useEffect(() => { refresh(); }, [refresh]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema) as any,
    defaultValues: toFormData(null),
  });

  if (loading) return null;

  const list = (certificates ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isPublished = form.getValues().status === "published";
  const arMissing =
    !form.getValues().nameAr ||
    !form.getValues().issuingBodyAr;

  const expiringCount = list.reduce((acc, c) => {
    const now = Date.now();
    const days = Math.ceil((new Date(c.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
    if (days < 0 || days <= 60) return acc + 1;
    return acc;
  }, 0);

  const handleSubmit = async (data: CertificateFormData) => {
    try {
      const payload: Partial<Certificate> & {
        name: { en: string; ar: string };
        issuingBody: { en: string; ar: string };
        versions: CertificateVersion[];
      } = {
        name: { en: data.nameEn, ar: data.nameAr },
        issuingBody: { en: data.issuingBodyEn, ar: data.issuingBodyAr },
        certificateNumber: data.certificateNumber,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        showOnWebsite: data.showOnWebsite,
        status: data.status,
        versions: [],
      };
      if (editing) {
        await update(editing.id, payload as Partial<Omit<Certificate, "id" | "createdAt">>, "admin");
      } else {
        await create(payload as Omit<Certificate, "id" | "createdAt" | "updatedAt">, "admin");
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
        title="Certificates"
        description={expiringCount > 0 ? `${expiringCount} certificate(s) expiring soon or expired` : "Manage company certificates and approvals."}
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Certificates" }]}
        action={
          <Button onClick={() => { setEditing(null); form.reset(toFormData(null)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Certificate
          </Button>
        }
      />

      {expiringCount > 0 && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-800">Expiring certificates</h3>
              <p className="text-sm text-rose-700 mt-1">
                {expiringCount} certificate(s) are expiring within 60 days or have expired.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <EmptyState title="No certificates yet" iconKey="Package" />
        ) : (
          <DataTable
            columns={[
              { accessorKey: "name", header: "Title" },
              { accessorKey: "certificateNumber", header: "Certificate No." },
              { accessorKey: "expiryDate", header: "Expiry Date" },
              { accessorKey: "status", header: "Status" },
              { accessorKey: "showOnWebsite", header: "Show on Site" },
            ] as any}
            data={list as any}
            rowActions={(row: any) => {
              const badge = expiryBadge(row.expiryDate);
              return (
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-medium ${badge.variant === "destructive" ? "text-destructive" : badge.variant === "warning" ? "text-amber-600" : "text-green-600"}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-2">
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
                </div>
              );
            }}
            emptyMessage="No certificates yet."
          />
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Certificate" : "Add Certificate"}</SheetTitle>
            <SheetDescription>Certificate details with file versioning.</SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (EN)</label><Input {...form.register("nameEn")} placeholder="Certificate title" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Title (AR)</label><Input {...form.register("nameAr")} placeholder="عنوان الشهادة" dir="rtl" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Issuing Body (EN)</label><Input {...form.register("issuingBodyEn")} placeholder="e.g. International Certification Body" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Issuing Body (AR)</label><Input {...form.register("issuingBodyAr")} placeholder="الجهة المانحة" dir="rtl" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Certificate Number</label><Input {...form.register("certificateNumber")} placeholder="e.g. ICB-ISO9001-2024-001" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Issue Date</label><Input type="date" {...form.register("issueDate")} className="h-8" /></div>
              <div className="space-y-2"><label className="text-xs font-medium text-muted-foreground uppercase">Expiry Date</label><Input type="date" {...form.register("expiryDate")} className="h-8" /></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Certificate File (PDF or Image)</label>
              <CertificateFileUploader
                value={editing?.file}
                versions={editing?.versions ?? []}
                onChange={(data) => {
                  form.setValue("fileId", data.fileId);
                  form.setValue("fileName", data.fileName);
                  form.setValue("fileSize", data.fileSize);
                  form.setValue("versions", data.versions ?? []);
                }}
              />
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
                <label className="text-xs font-medium text-muted-foreground">Show on website</label>
                <button onClick={() => form.setValue("showOnWebsite", !form.getValues().showOnWebsite)} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", form.getValues().showOnWebsite ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
                  <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", form.getValues().showOnWebsite ? "translate-x-6" : "translate-x-1")} />
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

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete certificate" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

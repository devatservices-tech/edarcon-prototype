"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import type { Certificate, CertificateVersion } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { BilingualField } from "@/components/admin/BilingualField";
import { CertificateFileUploader } from "@/components/admin/CertificateFileUploader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, MoreVertical, Trash2, Shield } from "lucide-react";
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
  versions: z.array(z.object({
    id: z.string(),
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    uploadedAt: z.string(),
    uploadedBy: z.string(),
  })).optional(),
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
    fileId: c.file,
    fileName: c.versions[c.versions.length - 1]?.fileName,
    fileSize: c.versions[c.versions.length - 1]?.fileSize,
    versions: c.versions,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema) as Resolver<CertificateFormData>,
    defaultValues: toFormData(null),
  });
  const formValues = form.watch();

  if (loading) return null;

  const list = (certificates ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isPublished = formValues.status === "published";
  const arMissing =
    !formValues.nameAr.trim() ||
    !formValues.issuingBodyAr.trim();

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
        file: data.fileId,
        showOnWebsite: data.showOnWebsite,
        status: data.status,
        versions: data.versions ?? [],
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

      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState title="No certificates yet" iconKey="Package" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((certificate) => {
            const badge = expiryBadge(certificate.expiryDate);
            return (
              <article
                key={certificate.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-brand-blue/10 p-2.5 text-brand-blue">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 font-semibold text-foreground">
                      {certificate.name.en}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground" dir="rtl">
                      {certificate.name.ar}
                    </p>
                  </div>
                  <StatusBadge status={certificate.status} />
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === certificate.id ? null : certificate.id,
                        )
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Actions for ${certificate.name.en}`}
                      aria-expanded={openMenuId === certificate.id}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {openMenuId === certificate.id && (
                      <div
                        role="menu"
                        className="absolute end-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setEditing(certificate);
                            form.reset(toFormData(certificate));
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
                            setDeleteId(certificate.id);
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

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 rounded-lg bg-muted/50 p-3">
                    <dt className="text-xs text-muted-foreground">Certificate number</dt>
                    <dd className="mt-1 break-all font-medium text-foreground">
                      {certificate.certificateNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Issue date</dt>
                    <dd className="mt-1 font-medium text-foreground">{certificate.issueDate}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Expiry date</dt>
                    <dd className="mt-1 font-medium text-foreground">{certificate.expiryDate}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.variant === "destructive" ? "bg-destructive/10 text-destructive" : badge.variant === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
                    {badge.label}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {certificate.showOnWebsite ? "Shown on website" : "Hidden from website"}
                  </span>
                </div>

              </article>
            );
          })}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[52rem] sm:!max-w-[calc(100vw-2rem)]">
          <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
              Certificate library
            </p>
            <SheetTitle className="text-xl">{editing ? "Edit Certificate" : "Add Certificate"}</SheetTitle>
            <SheetDescription>
              Manage certificate details, file versions, and website visibility.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Certificate identity</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the certificate title and issuing organization in both languages.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <BilingualField
                    label="Certificate title"
                    value={{ en: formValues.nameEn, ar: formValues.nameAr }}
                    onChange={(field, value) =>
                      form.setValue(field === "en" ? "nameEn" : "nameAr", value, {
                        shouldDirty: true,
                      })
                    }
                    error={form.formState.errors.nameEn?.message || form.formState.errors.nameAr?.message}
                  />
                  <BilingualField
                    label="Issuing body"
                    value={{ en: formValues.issuingBodyEn, ar: formValues.issuingBodyAr }}
                    onChange={(field, value) =>
                      form.setValue(field === "en" ? "issuingBodyEn" : "issuingBodyAr", value, {
                        shouldDirty: true,
                      })
                    }
                    error={form.formState.errors.issuingBodyEn?.message || form.formState.errors.issuingBodyAr?.message}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certificate number</label>
                  <Input
                    {...form.register("certificateNumber")}
                    placeholder="e.g. ICB-ISO9001-2024-001"
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Validity period</h3>
                  <p className="text-sm text-muted-foreground">
                    Record when the certificate was issued and when it expires.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue date</label>
                    <Input type="date" {...form.register("issueDate")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry date</label>
                    <Input type="date" {...form.register("expiryDate")} />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Certificate file</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF or image. New uploads are kept in the version history.
                  </p>
                </div>
                <CertificateFileUploader
                  value={formValues.fileId}
                  versions={formValues.versions ?? []}
                  onChange={(data) => {
                    form.setValue("fileId", data.fileId, { shouldDirty: true });
                    form.setValue("fileName", data.fileName, { shouldDirty: true });
                    form.setValue("fileSize", data.fileSize, { shouldDirty: true });
                    form.setValue("versions", data.versions ?? [], { shouldDirty: true });
                  }}
                />
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div>
                  <h3 className="font-semibold text-foreground">Publishing settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the certificate status and whether it appears on the website.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={formValues.status}
                      onValueChange={(value) => {
                        if (value !== null) {
                          form.setValue("status", value as "published" | "draft", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    {isPublished && arMissing && (
                      <p className="text-xs text-destructive">
                        Arabic title and issuing body are required to publish.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <label className="text-sm font-medium">Show on website</label>
                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("showOnWebsite", !formValues.showOnWebsite, {
                          shouldDirty: true,
                        })
                      }
                      aria-pressed={formValues.showOnWebsite}
                      className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-colors", formValues.showOnWebsite ? "border-brand-blue bg-brand-blue" : "border-border bg-input")}
                    >
                      <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", formValues.showOnWebsite ? "translate-x-5" : "translate-x-0")} />
                    </button>
                  </div>
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
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                {editing ? "Update Certificate" : "Create Certificate"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Delete certificate" description="This action cannot be undone." onConfirm={handleDelete} confirmLabel="Delete" />
    </AdminLayout>
  );
}

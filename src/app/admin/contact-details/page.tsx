"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { contactDetailsRepo } from "@/lib/admin/store";
import type { ContactDetails, ContactPhone, ContactEmail } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { RepeatableStringList } from "@/components/admin/RepeatableList";
import { EmptyState } from "@/components/admin/EmptyState";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Clock, Globe, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneListItemProps {
  item: ContactPhone;
  onChange: (item: ContactPhone) => void;
  onRemove: () => void;
}

function PhoneListItem({ item, onChange, onRemove }: PhoneListItemProps) {
  const [label, setLabel] = useState(item.label);
  const [number, setNumber] = useState(item.number);
  const [primary, setPrimary] = useState(item.primary);
  return (
    <div className="flex items-center gap-2 border border-border rounded-lg p-2 bg-muted/30">
      <Input value={label} onChange={(e) => { setLabel(e.target.value); onChange({ ...item, label: e.target.value }); }} placeholder="Label" className="text-sm h-8 p-1 flex-1" />
      <Input value={number} onChange={(e) => { setNumber(e.target.value); onChange({ ...item, number: e.target.value }); }} placeholder="Number" className="text-sm h-8 p-1 w-48" />
      <Select value={primary ? "true" : "false"} onValueChange={(v) => setPrimary(v === "true")}>
        <SelectTrigger className="w-24 h-8"><SelectValue placeholder={primary ? "Primary" : "Secondary"} /></SelectTrigger>
        <SelectContent><SelectItem value="true">Primary</SelectItem><SelectItem value="false">Secondary</SelectItem></SelectContent>
      </Select>
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

interface EmailListItemProps {
  item: ContactEmail;
  onChange: (item: ContactEmail) => void;
  onRemove: () => void;
}

function EmailListItem({ item, onChange, onRemove }: EmailListItemProps) {
  const [label, setLabel] = useState(item.label);
  const [address, setAddress] = useState(item.address);
  const [primary, setPrimary] = useState(item.primary);
  return (
    <div className="flex items-center gap-2 border border-border rounded-lg p-2 bg-muted/30">
      <Input value={label} onChange={(e) => { setLabel(e.target.value); onChange({ ...item, label: e.target.value }); }} placeholder="Label" className="text-sm h-8 p-1 flex-1" />
      <Input value={address} onChange={(e) => { setAddress(e.target.value); onChange({ ...item, address: e.target.value }); }} placeholder="Email" className="text-sm h-8 p-1 w-48" />
      <Select value={primary ? "true" : "false"} onValueChange={(v) => setPrimary(v === "true")}>
        <SelectTrigger className="w-24 h-8"><SelectValue placeholder={primary ? "Primary" : "Secondary"} /></SelectTrigger>
        <SelectContent><SelectItem value="true">Primary</SelectItem><SelectItem value="false">Secondary</SelectItem></SelectContent>
      </Select>
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

const contactSchema = z.object({
  addressEn: z.string().min(1, "English address is required"),
  addressAr: z.string().min(1, "Arabic address is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  workingHoursEn: z.string().min(1, "English working hours is required"),
  workingHoursAr: z.string().min(1, "Arabic working hours is required"),
  mapUrl: z.string().min(1, "Map URL is required"),
  primaryPhoneLabel: z.string().min(1, "Primary phone label is required"),
  primaryPhoneNumber: z.string().min(1, "Primary phone number is required"),
  primaryEmailLabel: z.string().min(1, "Primary email label is required"),
  primaryEmailAddress: z.string().email("Valid email is required"),
  status: z.enum(["published", "draft"]),
});

type ContactFormData = z.infer<typeof contactSchema>;

function toFormData(d: ContactDetails | null): ContactFormData {
  if (!d) {
    return {
      addressEn: "", addressAr: "", whatsapp: "",
      workingHoursEn: "", workingHoursAr: "", mapUrl: "",
      primaryPhoneLabel: "", primaryPhoneNumber: "",
      primaryEmailLabel: "", primaryEmailAddress: "",
      status: "draft",
    };
  }
  const primaryPhone = d.phones.find((p) => p.primary) || d.phones[0] || { label: "", number: "" };
  const primaryEmail = d.emails.find((e) => e.primary) || d.emails[0] || { label: "", address: "" };
  return {
    addressEn: d.address.en, addressAr: d.address.ar, whatsapp: d.whatsapp ?? "",
    workingHoursEn: d.workingHours.en, workingHoursAr: d.workingHours.ar, mapUrl: d.mapUrl,
    primaryPhoneLabel: primaryPhone.label, primaryPhoneNumber: primaryPhone.number,
    primaryEmailLabel: primaryEmail.label, primaryEmailAddress: primaryEmail.address,
    status: "draft",
  };
}

function PhoneList({ phones, onUpdate, onAdd, onRemove }: { phones: ContactPhone[]; onUpdate: (index: number, updated: ContactPhone) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <div className="space-y-2">
      {phones.map((p, i) => (
        <PhoneListItem
          key={i}
          item={p}
          onChange={(updated) => onUpdate(i, updated)}
          onRemove={() => onRemove(i)}
        />
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Phone
      </Button>
    </div>
  );
}

function EmailList({ emails, onUpdate, onAdd, onRemove }: { emails: ContactEmail[]; onUpdate: (index: number, updated: ContactEmail) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <div className="space-y-2">
      {emails.map((e, i) => (
        <EmailListItem
          key={i}
          item={e}
          onChange={(updated) => onUpdate(i, updated)}
          onRemove={() => onRemove(i)}
        />
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Email
      </Button>
    </div>
  );
}

export default function ContactDetailsPage() {
  const {
    data: contacts,
    loading,
    update,
    refresh,
  } = useCollection<ContactDetails>("contact-details");

  useEffect(() => { refresh(); }, [refresh]);

  const contact = contacts[0];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<boolean>(!!contact);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: toFormData(contact),
  });

  if (loading) return null;

  const handleSubmit = async (data: ContactFormData) => {
    try {
      const primaryPhone: ContactPhone = { label: data.primaryPhoneLabel, number: data.primaryPhoneNumber, primary: true };
      const primaryEmail: ContactEmail = { label: data.primaryEmailLabel, address: data.primaryEmailAddress, primary: true };
      const payload: Partial<ContactDetails> & {
        address: { en: string; ar: string };
        phones: ContactPhone[];
        emails: ContactEmail[];
        workingHours: { en: string; ar: string };
      } = {
        address: { en: data.addressEn, ar: data.addressAr },
        phones: contact?.phones ?? [],
        whatsapp: data.whatsapp,
        emails: contact?.emails ?? [],
        workingHours: { en: data.workingHoursEn, ar: data.workingHoursAr },
        mapUrl: data.mapUrl,
      };
      if (contact) {
        await update(contact.id, payload as Partial<Omit<ContactDetails, "id" | "createdAt">>, "admin");
      } else {
        // create path not used since contact-details is a singleton
      }
      setOpen(false);
      await refresh();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await update(deleteId, { status: "draft" } as any, "admin");
    setDeleteId(null);
    await refresh();
  };

  const handlePhoneUpdate = (index: number, updated: ContactPhone) => {
    if (!contact) return;
    const phones = [...contact.phones];
    phones[index] = updated;
    update(contact.id, { phones } as any, "admin");
  };

  const handlePhoneAdd = () => {
    if (!contact) return;
    const phones = [...contact.phones, { label: "", number: "", primary: false }];
    update(contact.id, { phones } as any, "admin");
  };

  const handlePhoneRemove = (index: number) => {
    if (!contact) return;
    const phones = contact.phones.filter((_, idx) => idx !== index);
    update(contact.id, { phones } as any, "admin");
  };

  const handleEmailUpdate = (index: number, updated: ContactEmail) => {
    if (!contact) return;
    const emails = [...contact.emails];
    emails[index] = updated;
    update(contact.id, { emails } as any, "admin");
  };

  const handleEmailAdd = () => {
    if (!contact) return;
    const emails = [...contact.emails, { label: "", address: "", primary: false }];
    update(contact.id, { emails } as any, "admin");
  };

  const handleEmailRemove = (index: number) => {
    if (!contact) return;
    const emails = contact.emails.filter((_, idx) => idx !== index);
    update(contact.id, { emails } as any, "admin");
  };

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Contact Details"
        description="Manage company contact information shown on the website footer and contact page."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Contact Details" }]}
        action={
          <Button onClick={() => { setEditing(!!contact); form.reset(toFormData(contact)); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> {contact ? "Edit Details" : "Add Details"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview card */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Live Preview</h3>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Footer & Contact Page</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{contact?.address.en || "Address not set"}</p>
                <p className="text-xs text-muted-foreground">{contact?.address.ar || ""}</p>
              </div>
            </div>
            {contact?.phones.map((p) => (
              <div key={p.label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
                <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.number}</p>
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                  {p.primary && <span className="text-[10px] font-bold text-green-600 mt-1">Primary</span>}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{contact?.whatsapp || "WhatsApp not set"}</p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>
            {contact?.emails.map((e) => (
              <div key={e.label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{e.address}</p>
                  <p className="text-xs text-muted-foreground">{e.label}</p>
                  {e.primary && <span className="text-[10px] font-bold text-green-600 mt-1">Primary</span>}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-muted/30">
              <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{contact?.workingHours.en || "Hours not set"}</p>
                <p className="text-xs text-muted-foreground">{contact?.workingHours.ar || ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-1 space-y-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="max-w-lg">
              <SheetHeader>
                <SheetTitle>{contact ? "Edit Contact Details" : "Add Contact Details"}</SheetTitle>
                <SheetDescription>Manage bilingual contact information.</SheetDescription>
              </SheetHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Address (EN)</label>
                    <Input {...form.register("addressEn")} placeholder="P.O. Box..." />
                    {form.formState.errors.addressEn && <p className="text-xs text-destructive">{form.formState.errors.addressEn.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Address (AR)</label>
                    <Input {...form.register("addressAr")} placeholder="العنوان" dir="rtl" />
                    {form.formState.errors.addressAr && <p className="text-xs text-destructive">{form.formState.errors.addressAr.message}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">WhatsApp</label>
                    <Input {...form.register("whatsapp")} placeholder="+966 55 902 1988" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Working Hours (EN)</label>
                    <Textarea {...form.register("workingHoursEn")} rows={2} placeholder="Description" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Working Hours (AR)</label>
                    <Textarea {...form.register("workingHoursAr")} rows={2} dir="rtl" placeholder="الوصف" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Google Maps URL</label>
                  <Input {...form.register("mapUrl")} placeholder="https://maps.google.com" />
                </div>

                <PhoneList phones={contact?.phones ?? []} onUpdate={handlePhoneUpdate} onAdd={handlePhoneAdd} onRemove={handlePhoneRemove} />

                <EmailList emails={contact?.emails ?? []} onUpdate={handleEmailUpdate} onAdd={handleEmailAdd} onRemove={handleEmailRemove} />

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Linked Google Maps URL</label>
                  <Input {...form.register("mapUrl")} placeholder="https://maps.google.com" />
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                    <Select value={form.getValues().status} onValueChange={(v) => form.setValue("status", v as "published" | "draft")}>
                      <SelectTrigger><SelectValue placeholder={form.getValues().status} /></SelectTrigger>
                      <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-brand-blue text-white">Save Contact Details</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Archive contact details" description="This will hide contact info from the public site." onConfirm={handleDelete} confirmLabel="Archive" />
        </div>
      </div>
    </AdminLayout>
)
}

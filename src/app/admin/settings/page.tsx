"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCollection } from "@/hooks/useCollection";
import { siteSettingsRepo } from "@/lib/admin/store";
import type { SiteSettings, SiteContentBlock, SiteSEO, SiteChatbot } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { DataTable } from "@/components/admin/DataTable";
import { BilingualField } from "@/components/admin/BilingualField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, Upload, Download, RefreshCw, ShieldCheck, Globe, Palette, FileText, Users, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "content", label: "Content", icon: FileText },
  { key: "seo", label: "SEO", icon: ShieldCheck },
  { key: "chatbot", label: "Chatbot", icon: Globe },
  { key: "users", label: "Users", icon: Users },
  { key: "data", label: "Data", icon: Save },
] as const;

const settingsSchema = z.object({
  siteNameEn: z.string().min(1, "English site name is required"),
  siteNameAr: z.string().min(1, "Arabic site name is required"),
  taglineEn: z.string().min(1, "English tagline is required"),
  taglineAr: z.string().min(1, "Arabic tagline is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(1, "Phone is required"),
  addressEn: z.string().min(1, "English address is required"),
  addressAr: z.string().min(1, "Arabic address is required"),
  defaultTheme: z.enum(["light", "dark", "system"]),
  defaultLanguage: z.enum(["en", "ar"]),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function toFormData(s: SiteSettings | null): SettingsFormData {
  if (!s) {
    return { siteNameEn: "", siteNameAr: "", taglineEn: "", taglineAr: "", contactEmail: "", contactPhone: "", addressEn: "", addressAr: "", defaultTheme: "system", defaultLanguage: "en" };
  }
  return { siteNameEn: s.siteName.en, siteNameAr: s.siteName.ar, taglineEn: s.tagline.en, taglineAr: s.tagline.ar, contactEmail: s.contactEmail, contactPhone: s.contactPhone, addressEn: s.address.en, addressAr: s.address.ar, defaultTheme: s.defaultTheme, defaultLanguage: s.defaultLanguage };
}

function missingArCount(s: SiteSettings): number {
  let count = 0;
  if (!s.siteName.ar) count++;
  if (!s.tagline.ar) count++;
  if (!s.address.ar) count++;
  s.homeContent.forEach((b) => { if (!b.title.ar || !b.body.ar) count++; });
  Object.values(s.seo).forEach((seo) => { if (!seo.title.ar || !seo.description.ar) count++; });
  if (!s.chatbot.greeting.ar) count++;
  return count;
}

export default function SettingsPage() {
  const {
    data: settings,
    loading,
    update,
    refresh,
  } = useCollection<SiteSettings>("site-settings");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [tab, setTab] = useState<"general" | "content" | "seo" | "chatbot" | "users" | "data">("general");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [importJson, setImportJson] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toFormData(settings?.[0] ?? null),
  });

  useEffect(() => { refresh(); }, [refresh]);

  const setting = settings?.[0] ?? null;

  if (loading || !setting) return null;

  const handleSubmit = async (data: SettingsFormData) => {
    try {
      const payload: Partial<SiteSettings> & {
        siteName: { en: string; ar: string };
        tagline: { en: string; ar: string };
        address: { en: string; ar: string };
      } = {
        siteName: { en: data.siteNameEn, ar: data.siteNameAr },
        tagline: { en: data.taglineEn, ar: data.taglineAr },
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: { en: data.addressEn, ar: data.addressAr },
        defaultTheme: data.defaultTheme,
        defaultLanguage: data.defaultLanguage,
      };
      if (setting) {
        await update(setting.id, payload as Partial<Omit<SiteSettings, "id" | "createdAt">>, "admin");
      }
      setOpen(false);
      await refresh();
    } catch {}
  };

  const handleExport = () => {
    const data = JSON.stringify(setting, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edarcon-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (setting) {
          await update(setting.id, parsed as Partial<Omit<SiteSettings, "id" | "createdAt">>, "admin");
          await refresh();
        }
      } catch {
        // ignore
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = async () => {
    // Reset by re-seeding
    if (setting) {
      await update(setting.id, {
        siteName: { en: "Edarcon Contracting", ar: "إيداركون كونتراكتينج" },
        tagline: { en: "Industrial & Civil Contractor", ar: "مقاول صناعي ومدني" },
        chatbot: { greeting: { en: "Hello! How can I help you today?", ar: "مرحباً! كيف يمكنني مساعدتك اليوم؟" }, autoOpen: false, delaySeconds: 3, enabled: true },
      } as any, "admin");
      await refresh();
    }
  };

  const arMissing = missingArCount(setting ?? {} as SiteSettings);

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="Website Settings"
        description="Configure site branding, content, SEO, chatbot, and data operations."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Website Settings" }]}
      />

      {/* Arabic missing banner */}
      {arMissing > 0 && (
        <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Arabic missing</span>
            <span className="text-sm text-amber-700">{arMissing} field(s) have English but no Arabic translation.</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              tab === t.key ? "border-brand-blue text-brand-blue bg-brand-blue/10" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon ? <t.icon className="w-4 h-4 mr-1.5" /> : null}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <GeneralSettings form={form} setting={setting} onSubmit={handleSubmit} open={open} setOpen={setOpen} />
      )}
      {tab === "content" && (
        <ContentSettings setting={setting} onUpdate={update} refresh={refresh} />
      )}
      {tab === "seo" && (
        <SEOSettings setting={setting} onUpdate={update} refresh={refresh} />
      )}
      {tab === "chatbot" && (
        <ChatbotSettings setting={setting} onUpdate={update} refresh={refresh} />
      )}
      {tab === "users" && (
        <UsersSettings />
      )}
      {tab === "data" && (
        <DataSettings onExport={handleExport} onImport={handleImport} onReset={handleReset} />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }} title="Reset settings" description="This will reset settings to defaults." onConfirm={handleReset} confirmLabel="Reset" />
    </AdminLayout>
  );
}

function GeneralSettings({ form, setting, onSubmit, open, setOpen }: { form: any; setting: SiteSettings | null; onSubmit: (d: any) => void; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Site Name (EN)</label>
          <Input {...form.register("siteNameEn")} placeholder="Edarcon Contracting" />
          {form.formState.errors.siteNameEn && <p className="text-xs text-destructive">{form.formState.errors.siteNameEn.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Site Name (AR)</label>
          <Input {...form.register("siteNameAr")} placeholder="إيداركون كونتراكتينج" dir="rtl" />
          {form.formState.errors.siteNameAr && <p className="text-xs text-destructive">{form.formState.errors.siteNameAr.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Tagline (EN)</label>
          <Input {...form.register("taglineEn")} placeholder="Industrial & Civil Contractor" />
          {form.formState.errors.taglineEn && <p className="text-xs text-destructive">{form.formState.errors.taglineEn.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Tagline (AR)</label>
          <Input {...form.register("taglineAr")} placeholder="مقاول صناعي ومدني" dir="rtl" />
          {form.formState.errors.taglineAr && <p className="text-xs text-destructive">{form.formState.errors.taglineAr.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Contact Email</label>
          <Input {...form.register("contactEmail")} placeholder="info@edarcon.com" />
          {form.formState.errors.contactEmail && <p className="text-xs text-destructive">{form.formState.errors.contactEmail.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Contact Phone</label>
          <Input {...form.register("contactPhone")} placeholder="+966 13 812 3456" />
        </div>
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
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Default Theme</label>
        <Select value={form.getValues().defaultTheme} onValueChange={(v) => form.setValue("defaultTheme", v as "light" | "dark" | "system")}>
          <SelectTrigger><SelectValue placeholder={form.getValues().defaultTheme} /></SelectTrigger>
          <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Default Language</label>
        <Select value={form.getValues().defaultLanguage} onValueChange={(v) => form.setValue("defaultLanguage", v as "en" | "ar")}>
          <SelectTrigger><SelectValue placeholder={form.getValues().defaultLanguage} /></SelectTrigger>
          <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Logo</label>
        <ImageUploader value={setting?.logo} onChange={(v) => form.setValue("logo", v)} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Favicon</label>
        <ImageUploader value={setting?.favicon} onChange={(v) => form.setValue("favicon", v)} />
      </div>

      <button type="submit" className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-medium hover:bg-brand-blue-dark">Save Settings</button>
    </form>
  );
}

function ContentSettings({ setting, onUpdate, refresh }: { setting: SiteSettings | null; onUpdate: any; refresh: any }) {
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const blocks = setting?.homeContent ?? [];

  const handleSave = async (key: string, title: { en: string; ar: string }, body: { en: string; ar: string }, ctaText?: { en: string; ar: string }, ctaLink?: string) => {
    if (setting) {
      const next = [...setting.homeContent];
      const idx = next.findIndex((b) => b.key === key);
      if (idx === -1) {
        next.push({ key, title, body, ctaText, ctaLink });
      } else {
        next[idx] = { ...next[idx], title, body, ctaText, ctaLink };
      }
      await onUpdate(setting.id, { homeContent: next } as any, "admin");
      await refresh();
    }
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Home Page Content Blocks</h3>
        <Button onClick={() => { setEditingKey(null); setOpen(true); }} size="sm">
          <Plus className="w-3 h-3 mr-1" /> Add Block
        </Button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <EmptyState title="No content blocks yet" iconKey="FileText" />
        ) : (
          blocks.map((block) => (
            <div key={block.key} className="border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{block.key}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingKey(block.key); setOpen(true); }}
                    className="p-1 text-muted-foreground hover:text-brand-blue"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <BilingualField value={block.title} onChange={(f, v) => {}} error={!block.title.ar ? "Arabic missing" : undefined} />
              <p className="text-sm text-muted-foreground mt-1">{block.body.en}</p>
              {block.body.ar && <p className="text-sm text-muted-foreground mt-1" dir="rtl">{block.body.ar}</p>}
              {block.ctaText && (
                <p className="text-xs text-brand-blue mt-2">{block.ctaText.en} → {block.ctaLink}</p>
              )}
            </div>
          ))
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingKey ? "Edit Content Block" : "Add Content Block"}</SheetTitle>
            <SheetDescription>Bilingual content for home page sections.</SheetDescription>
          </SheetHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const key = (formData.get("key") as string) || editingKey || "block-" + Date.now();
            handleSave(key, { en: formData.get("titleEn") as string, ar: formData.get("titleAr") as string }, { en: formData.get("bodyEn") as string, ar: formData.get("bodyAr") as string }, { en: formData.get("ctaTextEn") as string, ar: formData.get("ctaTextAr") as string }, formData.get("ctaLink") as string || undefined);
          }} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Block Key</label>
              <Input name="key" defaultValue={editingKey ?? ""} placeholder="hero" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Title (EN)</label>
              <Input name="titleEn" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.title.en : ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Title (AR)</label>
              <Input name="titleAr" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.title.ar : ""} dir="rtl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Body (EN)</label>
              <Textarea name="bodyEn" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.body.en : ""} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Body (AR)</label>
              <Textarea name="bodyAr" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.body.ar : ""} rows={3} dir="rtl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">CTA Text (EN)</label>
              <Input name="ctaTextEn" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.ctaText?.en : ""} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">CTA Text (AR)</label>
              <Input name="ctaTextAr" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.ctaText?.ar : ""} dir="rtl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">CTA Link</label>
              <Input name="ctaLink" defaultValue={editingKey ? blocks.find((b) => b.key === editingKey)?.ctaLink : ""} placeholder="/contact" />
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-brand-blue text-white">Save Block</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SEOSettings({ setting, onUpdate, refresh }: { setting: SiteSettings | null; onUpdate: any; refresh: any }) {
  const pages = ["/", "/services", "/catalog", "/contact"];
  const seo = setting?.seo ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        {pages.map((path) => {
          const current = seo[path] || { title: { en: "", ar: "" }, description: { en: "", ar: "" } };
          return (
            <div key={path} className="border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">{path}</span>
              </div>
              <BilingualField value={current.title} onChange={(f, v) => {
                const next = { ...seo, [path]: { ...current, title: { en: f === "en" ? v : current.title.en, ar: f === "ar" ? v : current.title.ar } } };
                if (setting) onUpdate(setting.id, { seo: next } as any, "admin");
              }} error={!current.title.ar ? "Arabic missing" : undefined} />
              <BilingualField value={current.description} onChange={(f, v) => {
                const next = { ...seo, [path]: { ...current, description: { en: f === "en" ? v : current.description.en, ar: f === "ar" ? v : current.description.ar } } };
                if (setting) onUpdate(setting.id, { seo: next } as any, "admin");
              }} error={!current.description.ar ? "Arabic missing" : undefined} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatbotSettings({ setting, onUpdate, refresh }: { setting: SiteSettings | null; onUpdate: any; refresh: any }) {
  const bot = setting?.chatbot || { greeting: { en: "", ar: "" }, autoOpen: false, delaySeconds: 3, enabled: true };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Greeting (EN)</label>
        <Input value={bot.greeting.en} onChange={(e) => { if (setting) onUpdate(setting.id, { chatbot: { ...bot, greeting: { en: e.target.value, ar: bot.greeting.ar } } } as any, "admin"); }} placeholder="Hello! How can I help you?" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Greeting (AR)</label>
        <Input value={bot.greeting.ar} onChange={(e) => { if (setting) onUpdate(setting.id, { chatbot: { ...bot, greeting: { en: bot.greeting.en, ar: e.target.value } } } as any, "admin"); }} dir="rtl" placeholder="مرحباً! كيف يمكنني مساعدتك؟" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Enabled</label>
        <button onClick={() => { if (setting) onUpdate(setting.id, { chatbot: { ...bot, enabled: !bot.enabled } } as any, "admin"); }} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", bot.enabled ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
          <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", bot.enabled ? "translate-x-6" : "translate-x-1")} />
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Auto Open</label>
        <button onClick={() => { if (setting) onUpdate(setting.id, { chatbot: { ...bot, autoOpen: !bot.autoOpen } } as any, "admin"); }} className={cn("relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5", bot.autoOpen ? "bg-brand-blue border-brand-blue" : "bg-input border-border")}>
          <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform", bot.autoOpen ? "translate-x-6" : "translate-x-1")} />
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">Delay (seconds)</label>
        <Input type="number" value={bot.delaySeconds} onChange={(e) => { if (setting) onUpdate(setting.id, { chatbot: { ...bot, delaySeconds: Number(e.target.value) || 3 } } as any, "admin"); }} className="h-8 w-32" />
      </div>
    </div>
  );
}

function UsersSettings() {
  const users = [
    { name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" },
    { name: "Editor User", email: "editor@edarcon.com", role: "Editor" },
    { name: "Sales User", email: "sales@edarcon.com", role: "Sales" },
  ];
  return (
    <div className="p-6 space-y-6">
      <h3 className="font-semibold text-foreground">Admin Users (Read-Only)</h3>
      <p className="text-sm text-muted-foreground">Real authentication (Supabase Auth / Auth.js) replaces this in production.</p>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <table className="w-full text-sm divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-sm text-foreground">{u.name}</td>
                <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-3 text-sm font-medium text-brand-blue capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataSettings({ onExport, onImport, onReset }: { onExport: () => void; onImport: (e: React.ChangeEvent<HTMLInputElement>) => void; onReset: () => void }) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="font-semibold text-foreground">Data Operations</h3>
      <p className="text-sm text-muted-foreground">Export, import, or reset all demo data.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button onClick={onExport} className="w-full">
          <Download className="w-4 h-4 mr-2" /> Export JSON
        </Button>
        <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
          <Upload className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Import JSON</span>
          <input type="file" accept=".json" className="sr-only" onChange={onImport} />
        </label>
        <Button onClick={onReset} variant="destructive" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" /> Reset Demo Data
        </Button>
      </div>
    </div>
  );
}

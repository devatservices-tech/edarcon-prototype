"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { rfqsRepo, activitiesRepo } from "@/lib/admin/store";
import type { RFQ, Activity } from "@/lib/admin/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import { migrateLegacyLeads } from "@/lib/admin/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Download,
  Filter,
  ChevronRight,
  MessageCircle as WhatsAppIcon,
  FileText,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

const SOURCE_LABELS: Record<string, string> = {
  chatbot: "Chatbot",
  contact: "Contact form",
  catalog: "Catalog",
  whatsapp: "WhatsApp",
};

const ADMIN_USERS = [
  { email: "admin@edarcon.com", label: "Admin User (Super Admin)" },
  { email: "editor@edarcon.com", label: "Editor User (Editor)" },
  { email: "sales@edarcon.com", label: "Sales User (Sales)" },
  { email: "", label: "Unassigned" },
];

export default function RfqPage() {
  const {
    data: rfqs,
    loading,
    update,
    remove,
    refresh,
  } = useCollection<RFQ>("rfqs");
  const { data: acts, refresh: refreshActs } = useCollection<Activity>("activities");

  useEffect(() => {
    migrateLegacyLeads();
    refresh();
    refreshActs();
  }, [refresh, refreshActs]);

  const list = (rfqs ?? []).slice().sort(
    (a: RFQ, b: RFQ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<
    "new" | "contacted" | "quoted" | "won" | "lost" | ""
  >("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [item, setItem] = useState<RFQ | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const services = useMemo(
    () => [...new Set(list.map((r) => r.service))].sort(),
    [list]
  );

  const filtered = useMemo(() => {
    return list.filter((r: RFQ) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.referenceNo.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchService = serviceFilter === "all" || r.service === serviceFilter;
      const matchSource = sourceFilter === "all" || r.source === sourceFilter;
      const fromOk = !dateFrom || new Date(r.createdAt) >= new Date(dateFrom);
      const toOk = !dateTo || new Date(r.createdAt) <= new Date(dateTo);
      return matchSearch && matchStatus && matchService && matchSource && fromOk && toOk;
    });
  }, [list, search, statusFilter, serviceFilter, sourceFilter, dateFrom, dateTo]);

  if (loading) return null;

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const selectAll = () => {
    const all = filtered.map((r) => r.id);
    setSelectedIds(selectedIds.length === all.length ? [] : all);
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus) return;
    await Promise.all(
      selectedIds.map((id) => updateStatus(id, bulkStatus, "Bulk update"))
    );
    setSelectedIds([]);
    setBulkStatus("");
    await refresh();
  };

  const handleBulkDelete = async () => {
    await Promise.all(selectedIds.map((id) => remove(id, "admin")));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    await refresh();
  };

  const updateStatus = async (
    id: string,
    status: RFQ["status"],
    actor = "admin",
    note?: string
  ) => {
    const current = list.find((r) => r.id === id);
    if (!current) return;
    await update(
      id,
      {
        status,
        timeline: [
          ...current.timeline,
          {
            id: crypto.randomUUID(),
            status,
            changedBy: actor,
            changedAt: new Date().toISOString(),
            note,
          },
        ],
      },
      actor
    );
    await refreshActs();
    await refresh();
  };

  const addNote = async (id: string, author: string, content: string) => {
    const current = list.find((r) => r.id === id);
    if (!current) return;
    await update(
      id,
      {
        notes: [
          ...current.notes,
          {
            id: crypto.randomUUID(),
            author,
            content,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      author
    );
    await refreshActs();
    await refresh();
  };

  const assignTo = async (id: string, email: string) => {
    await update(id, { assignedTo: email || undefined }, "admin");
    await refreshActs();
    await refresh();
  };

  const setFollowUp = async (id: string, date: string) => {
    await update(id, { followUpDate: date || undefined }, "admin");
    await refreshActs();
    await refresh();
  };

  const csvHeaders = [
    "Reference",
    "Date",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Service",
    "Source",
    "Status",
    "Assigned To",
    "Follow Up",
  ];
  const csvRows = filtered.map((r) => [
    r.referenceNo,
    new Date(r.createdAt).toLocaleDateString(),
    r.name,
    r.email,
    r.phone,
    r.company,
    r.service,
    r.source,
    r.status,
    r.assignedTo || "",
    r.followUpDate || "",
  ]);
  const exportCsv = () => {
    const lines = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edarcon-rfqs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      user={{ name: "Admin User", email: "admin@edarcon.com", role: "Super Admin" }}
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
    >
      <PageHeader
        title="RFQ Management"
        description="Review and respond to request-for-quote submissions."
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "RFQ Management" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={exportCsv} size="sm">
              <FileText className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reference, name, company, service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={(v) => setServiceFilter(v as string)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as string)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36 h-8"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36 h-8"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm mb-6 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as "new" | "contacted" | "quoted" | "won" | "lost" | "")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Change status…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Set status to</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleBulkUpdate} size="sm" disabled={!bulkStatus}>
            Apply
          </Button>
          <Button
            onClick={() => setBulkDeleteOpen(true)}
            variant="destructive"
            size="sm"
          >
            Delete selected
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-border text-brand-blue"
                />
              </th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Reference</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Company</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Service</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Source</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-left text-xs font-medium text-muted-foreground">Assigned to</th>
              <th className="p-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-muted-foreground">
                  No enquiries match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(r.id)}
                        className="w-4 h-4 rounded border-border text-brand-blue"
                      />
                    </td>
                    <td className="p-3 font-mono text-xs text-foreground">{r.referenceNo}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-foreground">{r.name}</td>
                    <td className="p-3 text-sm text-muted-foreground truncate max-w-[160px]">
                      {r.company}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground truncate max-w-[140px]">
                      {r.service}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground capitalize">
                      {r.source}
                    </td>
                    <td className="p-3">
                      <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v as RFQ["status"])}>
                        <SelectTrigger className="w-32">
                          <SelectValue>{STATUS_LABELS[r.status]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {r.assignedTo || "—"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setItem(r);
                          setDrawerOpen(true);
                        }}
                        className="text-brand-blue text-xs font-medium hover:underline"
                      >
                        View <ChevronRight className="w-3 h-3 inline ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="border-t border-border bg-muted/30 px-5 py-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {filtered.length} of {list.length} enquiries
          </span>
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="!w-full h-dvh max-h-dvh gap-0 overflow-hidden p-0 sm:!w-[46rem] sm:!max-w-[calc(100vw-2rem)]"
        >
          <SheetHeader className="shrink-0 border-b border-border bg-background px-6 py-5 pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
              RFQ Management
            </p>
            <SheetTitle className="text-xl">{item ? item.referenceNo : ""}</SheetTitle>
            <SheetDescription>
              {item ? `${item.name} · ${item.company}` : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
            {item && (
              <>
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <StatusBadge status={item.status} />
                  <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {item.language.toUpperCase()}
                  </span>
                </div>
                <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Contact information</h3>
                    <p className="text-sm text-muted-foreground">Details provided with this enquiry.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                      <p className="break-words text-sm text-foreground">{item.name}</p>
                    </div>
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label>
                      <a href={`tel:${item.phone}`} className="break-words text-sm text-brand-blue hover:underline">
                        {item.phone}
                      </a>
                    </div>
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                      <a href={`mailto:${item.email}`} className="break-all text-sm text-brand-blue hover:underline">
                        {item.email}
                      </a>
                    </div>
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">WhatsApp</label>
                      <a
                        href={`https://wa.me/${item.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello Edarcon, following up on ${item.referenceNo}`)}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 text-sm text-brand-blue hover:underline"
                      >
                        <WhatsAppIcon className="h-4 w-4" /> Message
                      </a>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Enquiry details</h3>
                    <p className="text-sm text-muted-foreground">Requested service and message.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Service</label>
                    <p className="text-sm text-foreground">{item.service}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
                    <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                      {item.message.en || item.message.ar}
                    </p>
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Follow-up</h3>
                    <p className="text-sm text-muted-foreground">Assign an owner and set a follow-up date.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Assigned to</label>
                      <Select
                        value={item.assignedTo ?? ""}
                        onValueChange={(v) => assignTo(item.id, v as string)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select user…" />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_USERS.map((u) => (
                            <SelectItem key={u.email} value={u.email}>{u.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Follow-up date</label>
                      <Input
                        type="date"
                        value={item.followUpDate ?? ""}
                        onChange={(e) => setFollowUp(item.id, e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Status timeline</h3>
                    <p className="text-sm text-muted-foreground">Recent activity for this enquiry.</p>
                  </div>
                  <div className="space-y-4">
                    {item.timeline.slice().reverse().map((t) => (
                      <div key={t.id} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-foreground">
                            <span className="font-medium">{STATUS_LABELS[t.status]}</span>
                            {t.note ? ` — ${t.note}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t.changedBy} · {new Date(t.changedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Internal notes</h3>
                    <p className="text-sm text-muted-foreground">Notes are visible to admins only.</p>
                  </div>
                  <div className="space-y-2">
                    {item.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-foreground">{n.author}</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{n.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {!item.notes.length && (
                      <p className="text-xs text-muted-foreground">No internal notes yet.</p>
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const author = (form.elements.namedItem("author") as HTMLInputElement).value || "admin";
                      const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
                      if (content.trim()) {
                        addNote(item.id, author, content);
                        form.reset();
                      }
                    }}
                    className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
                  >
                    <Input
                      name="author"
                      placeholder="Your name"
                      defaultValue="admin"
                    />
                    <Textarea
                      name="content"
                      placeholder="Add a note…"
                      rows={3}
                    />
                    <Button type="submit" className="sm:self-start">
                      Save note
                    </Button>
                  </form>
                </section>
              </>
            )}
          </div>
          <SheetFooter className="mt-0 shrink-0 flex-row justify-end border-t border-border bg-background px-5 py-4 sm:px-7">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected enquiries"
        description="This action cannot be undone."
        onConfirm={handleBulkDelete}
        confirmLabel="Delete"
      />
    </AdminLayout>
  );
}

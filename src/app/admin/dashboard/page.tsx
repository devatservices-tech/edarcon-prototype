"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import type { RFQ, Activity, Equipment, Certificate } from "@/lib/admin/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/nav";
import Link from "next/link";
import { migrateLegacyLeads } from "@/lib/admin/seed";
import {
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function sampleTimestamp(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

const SAMPLE_RFQS: RFQ[] = [
  {
    id: "sample-rfq-1",
    createdAt: sampleTimestamp(1),
    updatedAt: sampleTimestamp(1),
    referenceNo: "RFQ-2026-1042",
    name: "Ahmed Al-Mansour",
    email: "ahmed@example.com",
    phone: "+966 55 123 4567",
    company: "Gulf Industrial Services",
    service: "Heat Exchanger Retubing",
    source: "contact",
    language: "en",
    message: { en: "Requesting a quotation for an upcoming maintenance window.", ar: "" },
    status: "new",
    timeline: [],
    notes: [],
  },
  {
    id: "sample-rfq-2",
    createdAt: sampleTimestamp(2),
    updatedAt: sampleTimestamp(2),
    referenceNo: "RFQ-2026-1041",
    name: "Sarah Khalid",
    email: "sarah@example.com",
    phone: "+966 54 234 5678",
    company: "Eastern Petrochemical Co.",
    service: "Industrial & Mechanical Services",
    source: "catalog",
    language: "en",
    message: { en: "Please share pricing and availability for mechanical support.", ar: "" },
    status: "quoted",
    timeline: [],
    notes: [],
  },
  {
    id: "sample-rfq-3",
    createdAt: sampleTimestamp(4),
    updatedAt: sampleTimestamp(4),
    referenceNo: "RFQ-2026-1040",
    name: "Faisal Rahman",
    email: "faisal@example.com",
    phone: "+966 50 345 6789",
    company: "Al Noor Contracting",
    service: "Equipment Rental",
    source: "whatsapp",
    language: "en",
    message: { en: "Looking for equipment for a short-term site project.", ar: "" },
    status: "contacted",
    timeline: [],
    notes: [],
  },
  {
    id: "sample-rfq-4",
    createdAt: sampleTimestamp(5),
    updatedAt: sampleTimestamp(5),
    referenceNo: "RFQ-2026-1039",
    name: "Mariam Hassan",
    email: "mariam@example.com",
    phone: "+966 56 456 7890",
    company: "Jubail Plant Operations",
    service: "Manpower & Operational Support",
    source: "contact",
    language: "en",
    message: { en: "We need certified technicians for a scheduled shutdown.", ar: "" },
    status: "new",
    timeline: [],
    notes: [],
  },
  {
    id: "sample-rfq-5",
    createdAt: sampleTimestamp(12),
    updatedAt: sampleTimestamp(12),
    referenceNo: "RFQ-2026-1038",
    name: "Omar Nasser",
    email: "omar@example.com",
    phone: "+966 53 567 8901",
    company: "Red Sea Infrastructure",
    service: "Road Signs Provision & Replacement",
    source: "chatbot",
    language: "en",
    message: { en: "Requesting a proposal for road signage works.", ar: "" },
    status: "won",
    timeline: [],
    notes: [],
  },
  {
    id: "sample-rfq-6",
    createdAt: sampleTimestamp(18),
    updatedAt: sampleTimestamp(18),
    referenceNo: "RFQ-2026-1037",
    name: "Lina Abdullah",
    email: "lina@example.com",
    phone: "+966 58 678 9012",
    company: "Dammam Facilities Group",
    service: "Facility Management",
    source: "contact",
    language: "en",
    message: { en: "Please provide details of your ongoing facility services.", ar: "" },
    status: "quoted",
    timeline: [],
    notes: [],
  },
];

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: "sample-activity-1",
    createdAt: sampleTimestamp(1),
    updatedAt: sampleTimestamp(1),
    action: "create",
    collection: "rfqs",
    recordId: "sample-rfq-1",
    recordName: "RFQ-2026-1042",
    user: "Admin User",
    details: "New enquiry received from Gulf Industrial Services",
  },
  {
    id: "sample-activity-2",
    createdAt: sampleTimestamp(2),
    updatedAt: sampleTimestamp(2),
    action: "update",
    collection: "rfqs",
    recordId: "sample-rfq-2",
    recordName: "RFQ-2026-1041",
    user: "Sales Team",
    details: "Quotation sent to Eastern Petrochemical Co.",
  },
  {
    id: "sample-activity-3",
    createdAt: sampleTimestamp(3),
    updatedAt: sampleTimestamp(3),
    action: "create",
    collection: "equipment",
    recordId: "sample-equipment-1",
    recordName: "Mobile Crane 25T",
    user: "Admin User",
    details: "Equipment listing added",
  },
  {
    id: "sample-activity-4",
    createdAt: sampleTimestamp(5),
    updatedAt: sampleTimestamp(5),
    action: "update",
    collection: "services",
    recordId: "sample-service-1",
    recordName: "Industrial & Mechanical Services",
    user: "Editor",
    details: "Service information updated",
  },
  {
    id: "sample-activity-5",
    createdAt: sampleTimestamp(7),
    updatedAt: sampleTimestamp(7),
    action: "update",
    collection: "rfqs",
    recordId: "sample-rfq-4",
    recordName: "RFQ-2026-1039",
    user: "Sales Team",
    details: "Follow-up scheduled",
  },
  {
    id: "sample-activity-6",
    createdAt: sampleTimestamp(9),
    updatedAt: sampleTimestamp(9),
    action: "create",
    collection: "certificates",
    recordId: "sample-certificate-1",
    recordName: "ISO 9001",
    user: "Admin User",
    details: "Certificate record added",
  },
];

const SAMPLE_DAILY_COUNTS = [
  2, 1, 3, 2, 4, 3, 1, 2, 5, 3, 4, 2, 3, 1, 4,
  5, 2, 3, 4, 2, 6, 3, 4, 2, 5, 3, 4, 6, 3, 5,
];

export default function DashboardPage() {
  const [clientReady, setClientReady] = useState(false);
  const [user] = useState<{ name: string; email: string; role: string }>({
    name: "Admin User",
    email: "admin@edarcon.com",
    role: "Super Admin",
  });

  const { data: rfqs } = useCollection<RFQ>("rfqs");
  const { data: equipment } = useCollection<Equipment>("equipment");
  const { data: certificates } = useCollection<Certificate>("certificates");
  const { data: activities } = useCollection<Activity>("activities");

  useEffect(() => {
    setClientReady(true);
    migrateLegacyLeads();
  }, []);

  const dashboardRfqs = rfqs?.length
    ? rfqs
    : clientReady
      ? SAMPLE_RFQS
      : [];
  const dashboardActivities = activities?.length
    ? activities
    : clientReady
      ? SAMPLE_ACTIVITIES
      : [];

  const total = dashboardRfqs.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = dashboardRfqs.filter(
    (r: RFQ) => r.status === "new" && new Date(r.createdAt).getTime() >= weekAgo
  ).length;
  const quoted = dashboardRfqs.filter((r: RFQ) => r.status === "quoted").length;
  const won = dashboardRfqs.filter((r: RFQ) => r.status === "won").length;

  const recent = dashboardRfqs
    .slice()
    .sort((a: RFQ, b: RFQ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentActivities = dashboardActivities
    .slice()
    .sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const publishedEquip = equipment?.length
    ? equipment.filter((e: Equipment) => e.status === "published").length
    : clientReady
      ? 18
      : 0;
  const totalEquip = equipment?.length
    ? equipment.length
    : clientReady
      ? 24
      : 0;

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const expiring = certificates?.length
    ? certificates.filter(
        (c: Certificate) =>
          new Date(c.expiryDate).getTime() - now <= thirtyDays &&
          new Date(c.expiryDate).getTime() > now,
      ).length
    : clientReady
      ? 2
      : 0;

  const serviceCounts: Record<string, number> = {};
  for (const r of dashboardRfqs) serviceCounts[r.service] = (serviceCounts[r.service] ?? 0) + 1;
  const barData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));

  const daily: Record<string, number> = {};
  for (const r of dashboardRfqs) {
    const d = new Date(r.createdAt).toISOString().slice(0, 10);
    daily[d] = (daily[d] ?? 0) + 1;
  }
  const dates = Object.keys(daily).sort().slice(-30);
  const lineData = rfqs?.length
    ? dates.map((d) => ({ date: d, value: daily[d] }))
    : clientReady
      ? SAMPLE_DAILY_COUNTS.map((value, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (SAMPLE_DAILY_COUNTS.length - index - 1));
        return { date: date.toISOString().slice(0, 10), value };
        })
      : [];

  const getStringValue = (value: string | { en: string; ar: string } | undefined): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.en || value.ar || "";
  };

  return (
    <AdminLayout user={user} sidebarItems={ADMIN_SIDEBAR_ITEMS}>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name} (${user.role.replace("_", " ")}).`}
        breadcrumb={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total enquiries"
          value={total}
          change={{ value: "+8%", positive: true }}
          icon={FileText}
        />
        <StatCard
          title="New this week"
          value={newThisWeek}
          change={{ value: newThisWeek > 0 ? "+12%" : "0%", positive: true }}
          icon={TrendingUp}
        />
        <StatCard
          title="Quoted"
          value={quoted}
          change={{ value: "+5%", positive: true }}
          icon={Clock}
        />
        <StatCard
          title="Won"
          value={won}
          change={{ value: "+3%", positive: true }}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Enquiries over last 30 days</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer minWidth={300} minHeight={300}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1F5A99" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Enquiries by service</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer minWidth={300} minHeight={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="value" fill="#F5A031" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent enquiries</h3>
            <Link href="/admin/rfq" className="text-sm text-brand-blue hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enquiries yet.</p>
            ) : (
              recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {r.referenceNo.split("-").pop()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">{r.name}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.company} • {r.service}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.createdAt)} • {r.source}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Equipment availability</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="text-sm font-medium text-foreground">{publishedEquip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">On hire</span>
                <span className="text-sm font-medium text-foreground">{totalEquip - publishedEquip}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">{totalEquip}</span>
              </div>
            </div>
          </div>
          {expiring > 0 && (
            <div className="rounded-xl border border-rose-200/50 bg-rose-50/50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-rose-800">Expiring certificates</h3>
                  <p className="text-sm text-rose-700 mt-1">
                    {expiring} certificate(s) expire within 30 days.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Activity feed</h3>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold shrink-0">
                  {a.action.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.user}</span>{" "}
                    {a.action === "create" ? "created" : a.action === "update" ? "updated" : "removed"}{" "}
                    <span className="font-medium">{a.recordName}</span>{" "}
                    in <span className="font-medium">{a.collection}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.createdAt)} {a.details ? `• ${getStringValue(a.details)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

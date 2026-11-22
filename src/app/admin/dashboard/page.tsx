"use client";

import { useEffect, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { rfqsRepo, equipmentRepo, certificatesRepo, activitiesRepo } from "@/lib/admin/store";
import type { RFQ, Activity, Equipment, Certificate } from "@/lib/admin/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const [user] = useState<{ name: string; email: string; role: string }>({
    name: "Admin User",
    email: "admin@edarcon.com",
    role: "Super Admin",
  });

  const { data: rfqs, loading: rfqsLoading } = useCollection<RFQ>("rfqs");
  const { data: equipment, loading: equipLoading } = useCollection<Equipment>("equipment");
  const {
    data: certificates,
    loading: certsLoading,
  } = useCollection<Certificate>("certificates");
  const {
    data: activities,
    loading: actsLoading,
  } = useCollection<Activity>("activities");

  useEffect(() => {
    migrateLegacyLeads();
  }, []);

  const loading = rfqsLoading || equipLoading || certsLoading || actsLoading;

  const total = rfqs?.length ?? 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = rfqs?.filter(
    (r: RFQ) => r.status === "new" && new Date(r.createdAt).getTime() >= weekAgo
  ).length;
  const quoted = rfqs?.filter((r: RFQ) => r.status === "quoted").length ?? 0;
  const won = rfqs?.filter((r: RFQ) => r.status === "won").length ?? 0;

  const recent = (rfqs ?? [])
    .slice()
    .sort((a: RFQ, b: RFQ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentActivities = (activities ?? [])
    .slice()
    .sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const publishedEquip = equipment?.filter((e: Equipment) => e.status === "published").length ?? 0;
  const totalEquip = equipment?.length ?? 0;

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const expiring = certificates?.filter(
    (c: Certificate) => new Date(c.expiryDate).getTime() - now <= thirtyDays && new Date(c.expiryDate).getTime() > now
  ).length;

  const serviceCounts: Record<string, number> = {};
  for (const r of rfqs ?? []) serviceCounts[r.service] = (serviceCounts[r.service] ?? 0) + 1;
  const barData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));

  const daily: Record<string, number> = {};
  for (const r of rfqs ?? []) {
    const d = new Date(r.createdAt).toISOString().slice(0, 10);
    daily[d] = (daily[d] ?? 0) + 1;
  }
  const dates = Object.keys(daily).sort().slice(-30);
  const lineData = dates.map((d) => ({ date: d, value: daily[d] }));

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
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={0} />
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
        {loading || recentActivities.length === 0 ? (
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

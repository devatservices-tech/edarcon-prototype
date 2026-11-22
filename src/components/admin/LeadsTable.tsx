"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loadLeads, type Lead } from "@/data/chatFlow";

// TODO: protect this admin route with auth before production.
export function LeadsTable({
  locale,
}: {
  locale: string;
}) {
  const t = useTranslations("admin");
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  const csv = [
    [
      t("colId"),
      t("colName"),
      t("colEmail"),
      t("colPhone"),
      t("colService"),
      t("colDetails"),
      t("colTopics"),
      t("colLocale"),
      t("colPageUrl"),
      t("colCreatedAt"),
    ],
    ...leads.map((l) => [
      l.id,
      l.name,
      l.email,
      l.phone,
      l.service,
      l.details,
      l.topicsViewed.join(";"),
      l.locale,
      l.pageUrl,
      l.createdAt,
    ]),
  ]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const copyCsv = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(csv);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("subtitle")} ({leads.length})
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            locale={locale as "en" | "ar"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors"
          >
            {t("backToSite")}
          </Link>
          <button
            onClick={copyCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-blue)] text-white text-sm font-bold hover:bg-[var(--brand-blue-dark)] transition-colors"
          >
            <Download className="w-4 h-4" /> {t("copyCsv")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {[
                t("colId"),
                t("colName"),
                t("colEmail"),
                t("colPhone"),
                t("colService"),
                t("colDetails"),
                t("colTopics"),
                t("colLocale"),
                t("colCreatedAt"),
              ].map((h) => (
                <th key={h} className="p-3 font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-6 text-center text-muted-foreground"
                >
                  {t("noLeads")}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground">{lead.id}</td>
                  <td className="p-3 text-foreground">{lead.name}</td>
                  <td className="p-3 text-foreground">{lead.email}</td>
                  <td className="p-3 text-foreground">{lead.phone}</td>
                  <td className="p-3 text-foreground">{lead.service}</td>
                  <td className="p-3 text-muted-foreground truncate max-w-[200px]">
                    {lead.details || "-"}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {lead.topicsViewed.join(", ") || "-"}
                  </td>
                  <td className="p-3 text-muted-foreground">{lead.locale}</td>
                  <td className="p-3 text-muted-foreground">{lead.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Download, ExternalLink, Phone } from "lucide-react";
import type { ServiceConfig } from "@/data/chatFlow";

interface ServiceCardProps {
  service: ServiceConfig;
  onDownloadPdf: () => void;
  onDownloadCatalog: () => void;
  onWhatsApp: () => void;
  onQuote: () => void;
}

export function ServiceCard({
  service,
  onDownloadPdf,
  onDownloadCatalog,
  onWhatsApp,
  onQuote,
}: ServiceCardProps) {
  const t = useTranslations("chatbot");

  return (
    <div className="mt-3 p-3 rounded-xl border border-border bg-card shadow-sm">
      <h4 className="font-bold text-sm text-foreground mb-2">{service.title}</h4>
      <ul className="list-disc list-inside text-xs text-muted-foreground mb-3 space-y-1">
        {service.highlights.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDownloadPdf}
          aria-label={t("downloadPdf", { service: service.title })}
          className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--brand-orange)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          <Download className="w-3 h-3" /> {t("pdfOpen")}
        </button>
        <button
          onClick={onDownloadCatalog}
          aria-label={t("downloadCatalog")}
          className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[var(--brand-blue)] text-xs font-bold hover:bg-muted active:scale-95 transition-all"
        >
          <ExternalLink className="w-3 h-3" /> {t("pdfDownload")}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onWhatsApp}
          aria-label={t("talkWhatsApp")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1DB954] active:scale-95 transition-all"
        >
          <Phone className="w-3 h-3" /> {t("talkWhatsApp")}
        </button>
        <button
          onClick={onQuote}
          aria-label={t("requestQuote")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-[var(--brand-blue)] text-xs font-bold hover:bg-muted active:scale-95 transition-all"
        >
          {t("requestQuote")}
        </button>
      </div>
    </div>
  );
}

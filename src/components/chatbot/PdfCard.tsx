"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface PdfCardProps {
  title: string;
  pdfPath: string;
  fileSizeLabel?: string;
  onOpen?: () => void;
  onDownload?: () => void;
}

export function PdfCard({
  title,
  pdfPath,
  fileSizeLabel,
  onOpen,
  onDownload,
}: PdfCardProps) {
  const t = useTranslations("chatbot");
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(pdfPath, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pdfPath]);

  const handleOpen = () => {
    if (typeof window !== "undefined") window.open(pdfPath, "_blank");
    onOpen?.();
  };

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = pdfPath.split("/").pop() || "document.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  if (available === false) {
    return (
      <div className="p-3 rounded-xl border border-border bg-muted/50 text-sm">
        <div className="flex items-start gap-2 mb-2">
          <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-foreground">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t("pdfFallback")}
        </p>
        <a
          href={`https://wa.me/966559021988`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--brand-orange)]/50 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-medium hover:bg-[var(--brand-orange)]/20 transition-all"
        >
          <span className="w-3 h-3" />
          {t("pdfFallbackWhatsApp")}
        </a>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-2 mb-2">
        <FileText className="w-4 h-4 mt-0.5 text-[var(--brand-blue)] dark:text-[var(--brand-orange)] shrink-0" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {fileSizeLabel && (
        <p className="text-xs text-muted-foreground mb-3">{fileSizeLabel}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleOpen}
          aria-label={t("downloadPdf", { service: title })}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={available === null}
        >
          <ExternalLink className="w-3 h-3" /> {t("pdfOpen")}
        </button>
        <button
          onClick={handleDownload}
          aria-label={t("downloadCatalog")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--brand-orange)]/50 bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] text-xs font-bold hover:bg-[var(--brand-orange)]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={available === null}
        >
          <Download className="w-3 h-3" /> {t("pdfDownload")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { jsPDF } from "jspdf";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Phone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAdminData, usePublished, useTranslatable } from "@/lib/admin/data-provider";
import { SERVICE_IMAGES } from "@/components/home/ServiceSection";
import { getServiceCategoryLabel } from "@/lib/admin/serviceCategory";
import { getFileUrl, revokeFileUrl } from "@/lib/admin/files";
import type { Service } from "@/lib/admin/types";

function CatalogBody({
  svc,
  locale,
  related,
}: {
  svc: Service;
  locale: "en" | "ar";
  related: Service[];
}) {
  const isRtl = locale === "ar";
  const name = useTranslatable(svc.name, locale);
  const title = useTranslatable(svc.title ?? svc.name, locale);
  const subtitle = useTranslatable(svc.subtitle ?? svc.shortDescription, locale);
  const shortDesc = useTranslatable(svc.shortDescription, locale);
  const description = useTranslatable(svc.description, locale);
  const categoryLabel = getServiceCategoryLabel(
    svc.category,
    svc.categoryLocalized,
    locale,
  );
  const image = svc.image || SERVICE_IMAGES[svc.slug];
  const [downloading, setDownloading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentUnavailable, setDocumentUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const linkedDocument = svc.linkedPdf;
    setDocumentUrl(null);
    setDocumentUnavailable(false);
    if (!linkedDocument) return;

    if (/^https?:\/\//i.test(linkedDocument)) {
      setDocumentUrl(linkedDocument);
      return;
    }

    getFileUrl(linkedDocument)
      .then((url) => {
        if (cancelled) return;
        if (url) setDocumentUrl(url);
        else setDocumentUnavailable(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load the service document.", error);
        setDocumentUnavailable(true);
      });

    return () => {
      cancelled = true;
      revokeFileUrl(linkedDocument);
    };
  }, [svc.linkedPdf]);

  const highlights = svc.highlights.map((h) => (isRtl ? h.ar || h.en : h.en || h.ar));

  async function downloadPdf() {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 16;
      let y = 16;

      if (image) {
        try {
          const dataUrl = await fetch(image)
            .then((res) => res.blob())
            .then(
              (blob) =>
                new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = () => reject(reader.error);
                  reader.readAsDataURL(blob);
                })
            );
          const format = dataUrl.includes("image/png") ? "PNG" : "JPEG";
          doc.addImage(dataUrl, format, margin, y, pageWidth - margin * 2, 72);
          y += 80;
        } catch {
          // Continue without the photo if the file cannot be read.
        }
      }

      const pdfTitle = svc.title?.en || svc.name.en || name;
      const pdfBody = svc.description.en || svc.shortDescription.en || description;
      const pdfHighlights = svc.highlights.map((h) => h.en).filter(Boolean);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 40, 80);
      const titleLines = doc.splitTextToSize(pdfTitle, pageWidth - margin * 2);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 8 + 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text(categoryLabel, margin, y);
      y += 10;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(12);
      const descLines = doc.splitTextToSize(pdfBody, pageWidth - margin * 2);
      doc.text(descLines, margin, y);
      y += descLines.length * 6 + 8;

      if (pdfHighlights.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(20, 40, 80);
        doc.text("What this catalog covers", margin, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        pdfHighlights.forEach((item) => {
          const lines = doc.splitTextToSize(`- ${item}`, pageWidth - margin * 2);
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(lines, margin, y);
          y += lines.length * 6 + 2;
        });
      }

      y += 6;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Edarcon Contracting Company — Service Catalog", margin, y);

      doc.save(`${svc.slug}-catalog.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  const waText = encodeURIComponent(
    `Hello Edarcon, I would like a quote for ${name}.`
  );

  return (
    <>
      <section className="relative bg-[var(--navy)] overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              {isRtl ? "الرئيسية" : "Home"}
            </Link>
            <span aria-hidden="true">{isRtl ? "‹" : "›"}</span>
            <Link href="/services" className="hover:text-white transition-colors">
              {isRtl ? "الخدمات" : "Services"}
            </Link>
            <span aria-hidden="true">{isRtl ? "‹" : "›"}</span>
            <span className="text-white">{name}</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)] mb-3">
            {isRtl ? "كتالوج الخدمة" : "Service catalog"}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl">
            {title}
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-lg">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-[420px] object-cover"
                />
              ) : (
                <div className="h-[420px] bg-muted flex items-center justify-center text-muted-foreground">
                  {isRtl ? "لا توجد صورة" : "No image available"}
                </div>
              )}
              <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-white/90 text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-blue)]">
                {categoryLabel}
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isRtl ? "عن هذه الخدمة" : "About this service"}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
            {description || shortDesc}
            </p>

            {highlights.length > 0 && (
              <ul className="space-y-3 mb-8">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--brand-orange)]" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-col sm:flex-row flex-wrap gap-3">
              {documentUrl && (
                <a
                  href={documentUrl}
                  download={!/^https?:\/\//i.test(svc.linkedPdf ?? "")}
                  target={/^https?:\/\//i.test(svc.linkedPdf ?? "") ? "_blank" : undefined}
                  rel={/^https?:\/\//i.test(svc.linkedPdf ?? "") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  <FileText size={16} />
                  {isRtl ? "تنزيل مستند الخدمة" : "Download service document"}
                </a>
              )}
              {documentUnavailable && (
                <p className="w-full text-xs text-muted-foreground">
                  {isRtl
                    ? "مستند الخدمة غير متاح في هذا المتصفح."
                    : "The service document is unavailable in this browser."}
                </p>
              )}
              <button
                type="button"
                onClick={downloadPdf}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--brand-orange)] text-white text-sm font-bold hover:bg-[var(--brand-orange-dark)] disabled:opacity-70 transition-colors"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isRtl ? "تنزيل كتالوج PDF" : "Download catalog PDF"}
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--brand-blue)] text-white text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-colors"
              >
                {isRtl ? "اطلب عرض سعر" : "Request a quote"}
                <ArrowRight size={15} className={cn(isRtl && "rotate-180")} />
              </Link>
              <a
                href={`https://wa.me/966559021988?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Phone size={15} className="text-[#25D366]" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {isRtl ? "خدمات ذات صلة" : "Related services"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <RelatedCard key={item.id} svc={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function RelatedCard({ svc, locale }: { svc: Service; locale: "en" | "ar" }) {
  const isRtl = locale === "ar";
  const name = useTranslatable(svc.name, locale);
  const shortDesc = useTranslatable(svc.shortDescription, locale);
  const image = svc.image || SERVICE_IMAGES[svc.slug];

  return (
    <Link
      href={`/services/${svc.slug}`}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-40 bg-muted overflow-hidden">
        {image && (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground mb-1 group-hover:text-[var(--brand-blue)] transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{shortDesc}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-blue)]">
          {isRtl ? "عرض الكتالوج" : "See Catalog"}
          <ArrowRight size={13} className={cn(isRtl && "rotate-180")} />
        </span>
      </div>
    </Link>
  );
}

export default function ServiceCatalogPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = (params.locale === "ar" ? "ar" : "en") as "en" | "ar";
  const slug = params.slug;
  const { services, loading } = useAdminData();
  const published = usePublished(services ?? []);

  const svc = useMemo(
    () => published.find((item) => item.slug === slug),
    [published, slug]
  );

  const related = useMemo(
    () =>
      svc
        ? published.filter((item) => item.category === svc.category && item.slug !== svc.slug).slice(0, 3)
        : [],
    [published, svc]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="animate-pulse h-80 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!svc) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">
          {locale === "ar" ? "الكتالوج غير متوفر" : "Catalog not found"}
        </h1>
        <Link href="/services" className="text-[var(--brand-blue)] font-semibold">
          {locale === "ar" ? "العودة إلى الخدمات" : "Back to services"}
        </Link>
      </div>
    );
  }

  return <CatalogBody svc={svc} locale={locale} related={related} />;
}

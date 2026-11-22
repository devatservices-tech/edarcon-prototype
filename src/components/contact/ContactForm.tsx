"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPublicRFQ } from "@/lib/admin/rfq-public";

const schema = z.object({
  name:         z.string().min(2),
  company:      z.string().min(1),
  email:        z.string().email(),
  phone:        z.string().min(7),
  service:      z.string().min(1),
  siteLocation: z.string().min(1),
  message:      z.string().min(10),
});
type FormData = z.infer<typeof schema>;

interface Labels {
  name: string; company: string; email: string; phone: string;
  service: string; siteLocation: string; message: string;
  submit: string; success: string; selectService: string;
}

const SERVICE_OPTIONS_EN = [
  "Project Support Services", "Site Preparation", "De-Watering",
  "Civil Works", "Scaffolding", "Equipment Rental",
  "Manpower Support", "Facility Management",
];
const SERVICE_OPTIONS_AR = [
  "خدمات دعم المشاريع", "تجهيز الموقع", "تصريف المياه",
  "الأعمال المدنية", "السقالات", "تأجير المعدات",
  "دعم القوى العاملة", "إدارة المرافق",
];

const fieldBase =
  "w-full rounded-xl border border-input bg-background dark:bg-[var(--navy-light)] px-4 py-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "aria-[invalid=true]:border-destructive";

const errorClass = "text-xs text-destructive mt-1.5";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  );
}

export default function ContactForm({
  labels,
  locale,
  prefillMessage,
  prefill,
}: {
  labels: Labels;
  locale: string;
  prefillMessage?: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const isAr = locale === "ar";
  const serviceOptions = isAr ? SERVICE_OPTIONS_AR : SERVICE_OPTIONS_EN;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: prefill?.name || "",
      email: prefill?.email || "",
      phone: prefill?.phone || "",
      service: prefill?.service || "",
      message: prefillMessage || "",
    },
  });

  useEffect(() => {
    reset({
      name: prefill?.name || "",
      email: prefill?.email || "",
      phone: prefill?.phone || "",
      service: prefill?.service || "",
      message: prefillMessage || "",
    });
  }, [prefill, prefillMessage, reset]);

  async function onSubmit(data: FormData) {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      try {
        const isAr = locale === "ar";
        await createPublicRFQ({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          service: data.service,
          source: "contact",
          language: (isAr ? "ar" : "en") as "en" | "ar",
          message: isAr
            ? { en: "", ar: data.message }
            : { en: data.message, ar: "" },
        });
      } catch {
        // RFQ creation is best-effort; contact submission still succeeded.
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center" role="status" aria-live="polite">
        <CheckCircle2 size={48} className="text-[var(--brand-orange)]" />
        <p className="text-lg font-semibold text-foreground">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="cf-name" label={labels.name} error={errors.name?.message}>
          <input id="cf-name" {...register("name")} className={fieldBase} placeholder={labels.name}
            aria-invalid={!!errors.name} autoComplete="name" />
        </Field>
        <Field id="cf-company" label={labels.company} error={errors.company?.message}>
          <input id="cf-company" {...register("company")} className={fieldBase} placeholder={labels.company}
            aria-invalid={!!errors.company} autoComplete="organization" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="cf-email" label={labels.email} error={errors.email?.message}>
          <input id="cf-email" {...register("email")} type="email" className={fieldBase} placeholder={labels.email}
            aria-invalid={!!errors.email} autoComplete="email" />
        </Field>
        <Field id="cf-phone" label={labels.phone} error={errors.phone?.message}>
          <input id="cf-phone" {...register("phone")} type="tel" className={fieldBase} placeholder="+966 5X XXX XXXX"
            aria-invalid={!!errors.phone} autoComplete="tel" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="cf-service" label={labels.service} error={errors.service?.message}>
          <select id="cf-service" {...register("service")} className={cn(fieldBase, "cursor-pointer")}
            aria-invalid={!!errors.service} defaultValue="">
            <option value="" disabled>{labels.selectService}</option>
            {serviceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field id="cf-location" label={labels.siteLocation} error={errors.siteLocation?.message}>
          <input id="cf-location" {...register("siteLocation")} className={fieldBase}
            placeholder={isAr ? "مثال: الجبيل الصناعية" : "e.g. Jubail Industrial City"}
            aria-invalid={!!errors.siteLocation} />
        </Field>
      </div>

      <Field id="cf-message" label={labels.message} error={errors.message?.message}>
        <textarea id="cf-message" {...register("message")} rows={5}
          className={cn(fieldBase, "resize-none")}
          placeholder={isAr ? "صف نطاق عملك..." : "Describe your scope of work..."}
          aria-invalid={!!errors.message} />
      </Field>

      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again."}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--brand-blue)] text-white font-bold text-sm hover:bg-[var(--brand-blue-dark)] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[var(--brand-blue)]/20"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {labels.submit}
      </button>
    </form>
  );
}

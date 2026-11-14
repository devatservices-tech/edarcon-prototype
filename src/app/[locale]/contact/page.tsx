import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import RevealOnScroll from "@/components/RevealOnScroll";
import SectionHeading from "@/components/SectionHeading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: `${t("title")} | Edarcon`, description: t("subtitle") };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { message: prefillMessage } = await searchParams;
  const t = await getTranslations({ locale, namespace: "contact" });
  const formLabels = {
    name: t("form.name"),
    company: t("form.company"),
    email: t("form.email"),
    phone: t("form.phone"),
    service: t("form.service"),
    siteLocation: t("form.siteLocation"),
    message: t("form.message"),
    submit: t("form.submit"),
    success: t("form.success"),
    selectService: t("form.selectService"),
  };

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            <RevealOnScroll direction="left" className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {t("contactInfo")}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/30 transition-all">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                        <MapPin size={22} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("addressLabel")}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{t("address")}</p>
                        <span className="inline-block mt-2 text-xs font-medium text-[var(--brand-blue)] dark:text-[var(--brand-orange)]">
                          {t("addressCode")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/30 transition-all">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                        <Phone size={22} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("phoneLabel")}</p>
                        <a href="tel:+966559021988" className="text-sm text-[var(--brand-blue)] dark:text-[var(--brand-orange)] hover:underline mt-1 block">
                          +966 55 902 1988
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/30 transition-all">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                        <Mail size={22} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("emailLabel")}</p>
                        <a href="mailto:Edarcon@edarcon.com" className="text-sm text-[var(--brand-blue)] dark:text-[var(--brand-orange)] hover:underline mt-1 block">
                          Edarcon@edarcon.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/30 transition-all">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                        <Clock size={22} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("workingHoursLabel")}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {t("workingHours")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("serviceArea")}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/5 p-6">
                  <p className="font-semibold text-[var(--brand-blue)] dark:text-[var(--brand-orange)] text-center">
                    {t("whatsappLabel")}
                  </p>
                  <a
                    href="https://wa.me/966559021988"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full mt-3 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1DB954] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t("whatsappCTA")}
                  </a>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right" delay={0.1}>
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-lg">
                <SectionHeading
                  eyebrow={t("eyebrow")}
                  title={t("title")}
                  subtitle={t("subtitle")}
                  align="start"
                  className="mb-8"
                />
                <ContactForm labels={formLabels} locale={locale} prefillMessage={prefillMessage as string | undefined} />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnScroll className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {t("customQuoteTitle")}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("customQuoteDesc")}
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: MapPin, label: t("freeSiteSurvey"), desc: t("freeSiteSurveyDesc") },
                { icon: Phone, label: t("instantConsultation"), desc: t("instantConsultationDesc") },
                { icon: Mail, label: t("quote48Hours"), desc: t("quote48HoursDesc") },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-[var(--brand-blue)]/30 hover:shadow-md transition-all h-full">
                  <div className="w-14 h-14 rounded-xl bg-[var(--brand-blue)]/10 flex items-center justify-center">
                    <item.icon size={26} className="text-[var(--brand-blue)] dark:text-[var(--brand-orange)]" />
                  </div>
                  <h3 className="font-bold text-foreground">{item.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
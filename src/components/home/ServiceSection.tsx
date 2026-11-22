"use client";

import { cn } from "@/lib/utils";
import {
  HardHat, Shovel, Droplets, Building2,
  Construction, Truck, Users, Settings,
  ArrowRight, Thermometer, Wrench, Zap,
  Scissors, Gauge, Package, Signpost,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { useTranslatable } from "@/lib/admin/data-provider";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  projectSupport: HardHat,
  sitePrep: Shovel,
  dewatering: Droplets,
  civilWorks: Building2,
  scaffolding: Construction,
  equipmentRental: Truck,
  manpower: Users,
  facilityMgmt: Settings,
  "flange-facing-machining": HardHat,
  "post-heat-treatment-pwht": Thermometer,
  "bolt-torquing-tensioning": Wrench,
  "heat-exchanger-retubing": Droplets,
  "motors-pumps-services": Zap,
  "oil-flushing-filtration": Droplets,
  "pipe-cold-cutting-and-beveling": Scissors,
  "valves-instrumentation": Gauge,
  "equipment-rental": Truck,
  "industrial-hoses-supply": Zap,
  "new-used-storage-drums": Package,
  "project-materials-supply": Package,
  "manpower-operational-support": Users,
  "facility-management": Building2,
  "general-contracting": HardHat,
  "road-signs-provision-replacement": Signpost,
};

const SERVICE_IMAGES: Record<string, string> = {
  "flange-facing-machining": "/images/services/01. Industrial & Mechanical Services/Flange Facing & Machining.jpeg",
  "post-heat-treatment-pwht": "/images/services/01. Industrial & Mechanical Services/Post Heat Treatment (PWHT).jpeg",
  "bolt-torquing-tensioning": "/images/services/01. Industrial & Mechanical Services/Bolt Torquing & Tensioning.jpeg",
  "heat-exchanger-retubing": "/images/services/01. Industrial & Mechanical Services/Heat Exchanger Retubing.jpeg",
  "motors-pumps-services": "/images/services/01. Industrial & Mechanical Services/Motors & Pumps Services.jpeg",
  "oil-flushing-filtration": "/images/services/01. Industrial & Mechanical Services/Oil Flushing & Filtration.jpeg",
  "pipe-cold-cutting-and-beveling": "/images/services/01. Industrial & Mechanical Services/Pipe cold cutting and beveling .jpeg",
  "valves-instrumentation": "/images/services/01. Industrial & Mechanical Services/Valves & Instrumentation.jpeg",
  "equipment-rental": "/images/services/02. Industrial Equipment & Material Supply/Equipment Rental.jpeg",
  "industrial-hoses-supply": "/images/services/02. Industrial Equipment & Material Supply/Industrial Hoses Supply.jpeg",
  "new-used-storage-drums": "/images/services/02. Industrial Equipment & Material Supply/New & Used Storage Drums.jpeg",
  "project-materials-supply": "/images/services/02. Industrial Equipment & Material Supply/Project Materials Supply.jpeg",
  "manpower-operational-support": "/images/services/03. Manpower & Operational Support/Manpower & Operational Support.jpeg",
  "facility-management": "/images/services/04. Contracting & Facility Management/Facility Management.jpeg",
  "general-contracting": "/images/services/04. Contracting & Facility Management/General Contracting.jpeg",
  "road-signs-provision-replacement": "/images/services/05. Infrastructure & Site Support/Road Signs Provision & Replacement.jpeg",
};

interface ServiceSectionProps {
  svc: { id: string; slug: string; name: { en: string; ar: string }; shortDescription: { en: string; ar: string }; highlights: { en: string; ar: string }[]; status: "published" | "draft"; active: boolean; order: number; category: string; image?: string };
  locale: string;
  isRtl: boolean;
  index: number;
}

export function ServiceSection({ svc, locale, isRtl, index }: ServiceSectionProps) {
  const name = useTranslatable(svc.name, locale as "en" | "ar");
  const shortDesc = useTranslatable(svc.shortDescription, locale as "en" | "ar");

  const Icon = SERVICE_ICONS[svc.slug as keyof typeof SERVICE_ICONS] || HardHat;
  const image = svc.image ?? SERVICE_IMAGES[svc.slug];

  return (
    <article
      key={svc.id}
      id={svc.slug}
      className={cn(
        "group relative rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
        index % 2 === 0 && "bg-muted/30",
      )}
      aria-label={name}
    >
      <RevealOnScroll direction="up" amount={0.1}>
        <div className="relative h-48 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Icon size={32} strokeWidth={1.5} className="text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-tl-xl rounded-br-xl bg-[var(--brand-blue)]/90 backdrop-blur text-xs font-semibold text-white uppercase tracking-tighter">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} strokeWidth={1.5} className="text-[var(--brand-orange)]" />
            <span className="text-xs font-medium text-[var(--brand-blue)] uppercase tracking-tighter">
              {svc.category}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-[var(--brand-blue)] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {shortDesc}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)] hover:gap-3 transition-all"
          >
            Get a Quote
            <ArrowRight size={13} className={cn(isRtl && "rotate-180")} />
          </Link>
        </div>
      </RevealOnScroll>
    </article>
  );
}

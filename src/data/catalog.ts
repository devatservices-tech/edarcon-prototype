/* ⚠️ PLACEHOLDER SEED DATA ⚠️
 * The 16 products below are realistic placeholders only. Replace them with
 * real Edarcon fleet data before launch. Translatable fields (name,
 * shortDescription, description, features, applications, spec labels) live in
 * messages/en.json and messages/ar.json under "Catalog.products.<id>".
 * This file holds language-neutral values only.
 */

export type Locale = "en" | "ar";

export type Availability = "rent" | "supply" | "both";

export interface CatalogSpec {
  key: string; // message key: Catalog.products.<id>.specs.<key>
  value: string; // language-neutral value
}

export interface CatalogProduct {
  id: string;
  slug: string;
  category: string;
  image: string;
  gallery: string[];
  featured: boolean;
  availability: Availability;
  operatorOption: boolean;
  specs: CatalogSpec[];
}

export interface CatalogCategory {
  id: string;
}

export const CATEGORIES: CatalogCategory[] = [
  { id: "cranes-lifting" },
  { id: "earthmoving" },
  { id: "power-generators" },
  { id: "dewatering" },
  { id: "scaffolding-access" },
  { id: "site-vehicles" },
  { id: "fabrication-manufacturing" },
];

export const PRODUCTS: CatalogProduct[] = [
  {
    id: "mobile-crane-25t",
    slug: "mobile-crane-25t",
    category: "cranes-lifting",
    image: "/images/catalog/mobile-crane-25t.svg",
    gallery: ["/images/catalog/mobile-crane-25t.svg"],
    featured: true,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "maxCapacity", value: "25 tonnes" },
      { key: "boomLength", value: "10–33.5 m" },
      { key: "drive", value: "All-terrain, road-legal" },
      { key: "operator", value: "Certified rigger-operator included" },
    ],
  },
  {
    id: "crawler-crane-100t",
    slug: "crawler-crane-100t",
    category: "cranes-lifting",
    image: "/images/catalog/crawler-crane-100t.svg",
    gallery: ["/images/catalog/crawler-crane-100t.svg"],
    featured: true,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "maxCapacity", value: "100 tonnes" },
      { key: "boomType", value: "Lattice" },
      { key: "drive", value: "Tracked" },
      { key: "groundPressure", value: "Low ground pressure" },
    ],
  },
  {
    id: "forklift-5t",
    slug: "forklift-5t",
    category: "cranes-lifting",
    image: "/images/catalog/forklift-5t.svg",
    gallery: ["/images/catalog/forklift-5t.svg"],
    featured: false,
    availability: "both",
    operatorOption: true,
    specs: [
      { key: "capacity", value: "5 tonnes" },
      { key: "fuel", value: "Diesel" },
      { key: "terrain", value: "Rough terrain" },
      { key: "tyres", value: "Heavy-duty" },
    ],
  },
  {
    id: "excavator-20t",
    slug: "excavator-20t",
    category: "earthmoving",
    image: "/images/catalog/excavator-20t.svg",
    gallery: ["/images/catalog/excavator-20t.svg"],
    featured: true,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "operatingWeight", value: "20 tonnes" },
      { key: "armType", value: "Long reach" },
      { key: "drive", value: "Tracked" },
      { key: "attachments", value: "Hydraulic ready" },
    ],
  },
  {
    id: "wheel-loader-3m3",
    slug: "wheel-loader-3m3",
    category: "earthmoving",
    image: "/images/catalog/wheel-loader-3m3.svg",
    gallery: ["/images/catalog/wheel-loader-3m3.svg"],
    featured: false,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "bucketCapacity", value: "3 m³" },
      { key: "drive", value: "4WD" },
      { key: "type", value: "Wheel loader" },
    ],
  },
  {
    id: "backhoe-loader",
    slug: "backhoe-loader",
    category: "earthmoving",
    image: "/images/catalog/backhoe-loader.svg",
    gallery: ["/images/catalog/backhoe-loader.svg"],
    featured: false,
    availability: "both",
    operatorOption: true,
    specs: [
      { key: "drive", value: "4WD" },
      { key: "dipper", value: "Extendable" },
      { key: "functions", value: "Loader + backhoe" },
    ],
  },
  {
    id: "diesel-generator-100kva",
    slug: "diesel-generator-100kva",
    category: "power-generators",
    image: "/images/catalog/diesel-generator-100kva.svg",
    gallery: ["/images/catalog/diesel-generator-100kva.svg"],
    featured: true,
    availability: "both",
    operatorOption: false,
    specs: [
      { key: "powerRating", value: "100 kVA" },
      { key: "fuel", value: "Diesel" },
      { key: "canopy", value: "Soundproofed" },
      { key: "start", value: "Auto-start" },
    ],
  },
  {
    id: "light-tower-led",
    slug: "light-tower-led",
    category: "power-generators",
    image: "/images/catalog/light-tower-led.svg",
    gallery: ["/images/catalog/light-tower-led.svg"],
    featured: false,
    availability: "rent",
    operatorOption: false,
    specs: [
      { key: "lightingType", value: "LED" },
      { key: "chassis", value: "Mobile trailer" },
      { key: "operation", value: "Dusk-to-dawn" },
      { key: "runtime", value: "Extended runtime" },
    ],
  },
  {
    id: "air-compressor-185cfm",
    slug: "air-compressor-185cfm",
    category: "power-generators",
    image: "/images/catalog/air-compressor-185cfm.svg",
    gallery: ["/images/catalog/air-compressor-185cfm.svg"],
    featured: false,
    availability: "rent",
    operatorOption: false,
    specs: [
      { key: "freeAirDelivery", value: "185 CFM" },
      { key: "drive", value: "Diesel" },
      { key: "chassis", value: "Towable" },
      { key: "pressure", value: "Working pressure rated" },
    ],
  },
  {
    id: "well-point-system",
    slug: "well-point-system",
    category: "dewatering",
    image: "/images/catalog/well-point-system.svg",
    gallery: ["/images/catalog/well-point-system.svg"],
    featured: false,
    availability: "rent",
    operatorOption: false,
    specs: [
      { key: "systemType", value: "Well-point" },
      { key: "capacity", value: "Site-rated" },
      { key: "pumps", value: "Included" },
      { key: "discharge", value: "Discharge management" },
    ],
  },
  {
    id: "submersible-trash-pump",
    slug: "submersible-trash-pump",
    category: "dewatering",
    image: "/images/catalog/submersible-trash-pump.svg",
    gallery: ["/images/catalog/submersible-trash-pump.svg"],
    featured: false,
    availability: "rent",
    operatorOption: false,
    specs: [
      { key: "type", value: "Submersible trash pump" },
      { key: "application", value: "Dirty water / slurry" },
      { key: "impeller", value: "Solids handling" },
      { key: "mounting", value: "Portable" },
    ],
  },
  {
    id: "tube-fitting-scaffold",
    slug: "tube-fitting-scaffold",
    category: "scaffolding-access",
    image: "/images/catalog/tube-fitting-scaffold.svg",
    gallery: ["/images/catalog/tube-fitting-scaffold.svg"],
    featured: false,
    availability: "supply",
    operatorOption: false,
    specs: [
      { key: "system", value: "Tube-and-fitting" },
      { key: "compliance", value: "TG20" },
      { key: "erectors", value: "Certified riggers" },
      { key: "inspection", value: "Tagging and inspection" },
    ],
  },
  {
    id: "scissor-lift-12m",
    slug: "scissor-lift-12m",
    category: "scaffolding-access",
    image: "/images/catalog/scissor-lift-12m.svg",
    gallery: ["/images/catalog/scissor-lift-12m.svg"],
    featured: true,
    availability: "rent",
    operatorOption: false,
    specs: [
      { key: "workingHeight", value: "12 m" },
      { key: "drive", value: "Electric" },
      { key: "tyres", value: "Non-marking" },
      { key: "emission", value: "Zero emission" },
    ],
  },
  {
    id: "pickup-4x4",
    slug: "pickup-4x4",
    category: "site-vehicles",
    image: "/images/catalog/pickup-4x4.svg",
    gallery: ["/images/catalog/pickup-4x4.svg"],
    featured: false,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "drive", value: "4×4" },
      { key: "model", value: "Hilux / equivalent" },
      { key: "type", value: "Pickup" },
      { key: "driver", value: "Driver included" },
    ],
  },
  {
    id: "personnel-bus-30",
    slug: "personnel-bus-30",
    category: "site-vehicles",
    image: "/images/catalog/personnel-bus-30.svg",
    gallery: ["/images/catalog/personnel-bus-30.svg"],
    featured: false,
    availability: "rent",
    operatorOption: true,
    specs: [
      { key: "capacity", value: "30 seats" },
      { key: "cooling", value: "A/C" },
      { key: "type", value: "Crew bus" },
      { key: "driver", value: "Driver included" },
    ],
  },
  {
    id: "site-cabin-portacabin",
    slug: "site-cabin-portacabin",
    category: "fabrication-manufacturing",
    image: "/images/catalog/site-cabin-portacabin.svg",
    gallery: ["/images/catalog/site-cabin-portacabin.svg"],
    featured: false,
    availability: "supply",
    operatorOption: false,
    specs: [
      { key: "type", value: "Portacabin" },
      { key: "use", value: "Site office / welfare" },
      { key: "insulation", value: "Insulated panels" },
      { key: "deployment", value: "Rapid deployment" },
    ],
  },
] as const;

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): CatalogProduct[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProducts(): CatalogProduct[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function categoryLabelKey(id: string): string {
  return `Catalog.categories.${id}`;
}

export function productMessagePath(id: string, field: string): string {
  return `Catalog.products.${id}.${field}`;
}

export function specMessagePath(id: string, key: string): string {
  return `Catalog.products.${id}.specs.${key}`;
}

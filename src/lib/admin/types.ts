export type Translatable = {
  en: string;
  ar: string;
};

export type Status = "published" | "draft";

export type EquipmentAvailability = "rent" | "supply" | "both";

export type EquipmentCondition = "available" | "rented" | "maintenance";

export type RFQStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type RFQSource = "chatbot" | "contact" | "catalog" | "whatsapp";

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service extends BaseRecord {
  name: Translatable;
  title?: Translatable;
  subtitle?: Translatable;
  slug: string;
  shortDescription: Translatable;
  description: Translatable;
  category: string;
  categoryLocalized?: Translatable;
  icon: string;
  highlights: Translatable[];
  image?: string;
  linkedPdf?: string;
  order: number;
  active: boolean;
  status: Status;
}

export interface EquipmentCategory extends BaseRecord {
  name: Translatable;
  slug: string;
  description: Translatable;
  icon: string;
  order: number;
  active: boolean;
  status: Status;
}

export interface Equipment extends BaseRecord {
  name: Translatable;
  slug: string;
  modelCode: string;
  categoryId: string;
  categoryName?: string;
  descriptions: Translatable;
  images: string[];
  coverImage?: string;
  availability: EquipmentAvailability;
  operator: boolean;
  featured: boolean;
  quantityTotal: number;
  quantityAvailable: number;
  condition: EquipmentCondition;
  specs: Record<string, Translatable | string>;
  features: Translatable[];
  applications: Translatable[];
  brochure?: string;
  status: Status;
}

export interface ManpowerCategory extends BaseRecord {
  name: Translatable;
  slug: string;
  description: Translatable;
  totalHeadcount: number;
  availableHeadcount: number;
  certifications: string[];
  experienceLevel: string;
  active: boolean;
  status: Status;
}

export interface Project extends BaseRecord {
  name: Translatable;
  slug: string;
  client: string;
  location: Translatable;
  sector: string;
  year: number;
  duration: string;
  description: Translatable;
  scopeOfWork: Translatable[];
  images: ProjectImage[];
  coverImageId?: string;
  featured: boolean;
  status: Status;
}

export interface ProjectImage {
  id: string;
  fileId: string;
  caption: Translatable;
  order: number;
}

export interface Certificate extends BaseRecord {
  name: Translatable;
  issuingBody: Translatable;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  file?: string;
  showOnWebsite: boolean;
  status: Status;
  versions: CertificateVersion[];
}

export interface CertificateVersion {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface RFQ extends BaseRecord {
  referenceNo: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  source: RFQSource;
  language: "en" | "ar";
  message: Translatable;
  status: RFQStatus;
  assignedTo?: string;
  followUpDate?: string;
  timeline: TimelineEntry[];
  notes: Note[];
}

export interface TimelineEntry {
  id: string;
  status: RFQStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Note {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Activity extends BaseRecord {
  action: "create" | "update" | "delete";
  collection: string;
  recordId: string;
  recordName: string;
  user: string;
  details?: string;
}

export type DocumentCategory = "Company Profile" | "Brochure" | "Policy" | "Price list";

export type DocumentLanguage = "en" | "ar" | "both";

export interface CompanyDocument extends BaseRecord {
  name: Translatable;
  category: DocumentCategory;
  language: DocumentLanguage;
  file?: string;
  fileSize: number;
  fileName: string;
  downloadCount: number;
  public: boolean;
  status: Status;
}

export interface ContactPhone {
  label: string;
  number: string;
  primary: boolean;
}

export interface ContactEmail {
  label: string;
  address: string;
  primary: boolean;
}

export interface ContactDetails extends BaseRecord {
  address: Translatable;
  phones: ContactPhone[];
  whatsapp?: string;
  emails: ContactEmail[];
  workingHours: Translatable;
  mapUrl: string;
  socialLinks: Record<string, string>;
}

export interface SiteContentBlock {
  key: string;
  title: Translatable;
  body: Translatable;
  ctaText?: Translatable;
  ctaLink?: string;
}

export interface SiteSEO {
  title: Translatable;
  description: Translatable;
  ogImage?: string;
}

export interface SiteChatbot {
  greeting: Translatable;
  autoOpen: boolean;
  delaySeconds: number;
  enabled: boolean;
}

export interface SiteSettings extends BaseRecord {
  siteName: Translatable;
  tagline: Translatable;
  logo?: string;
  favicon?: string;
  defaultTheme: "light" | "dark" | "system";
  defaultLanguage: "en" | "ar";
  contactEmail: string;
  contactPhone: string;
  address: Translatable;
  socialLinks: Record<string, string>;
  homeContent: SiteContentBlock[];
  seo: Record<string, SiteSEO>;
  chatbot: SiteChatbot;
}

export type CollectionName =
  | "services"
  | "equipment-categories"
  | "equipment"
  | "manpower-categories"
  | "manpower"
  | "projects"
  | "certificates"
  | "rfqs"
  | "documents"
  | "contact-details"
  | "site-settings"
  | "users"
  | "activities";

export type CollectionModel =
  | Service
  | EquipmentCategory
  | Equipment
  | ManpowerCategory
  | Project
  | Certificate
  | RFQ
  | CompanyDocument
  | ContactDetails
  | SiteSettings
  | Activity;

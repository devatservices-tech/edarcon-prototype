import {
  LayoutDashboard,
  Wrench,
  Settings,
  Building2,
  Award,
  FileText,
  File,
  Phone,
  UserRound,
} from "lucide-react";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: ("super_admin" | "editor" | "sales")[];
  badge?: number;
}

export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/equipment", label: "Equipment", icon: Settings },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/rfq", label: "RFQ Management", icon: FileText, roles: ["super_admin", "sales"] },
  { href: "/admin/documents", label: "Documents", icon: File },
  { href: "/admin/contact-details", label: "Contact Details", icon: Phone },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ADMIN_SIDEBAR_ITEMS, type SidebarItem } from "@/components/admin/nav";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface AdminLayoutProps {
  user: AdminUser;
  sidebarItems?: SidebarItem[];
  children: React.ReactNode;
}

function formatRole(role: string) {
  return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function AdminLayout({
  user,
  sidebarItems = ADMIN_SIDEBAR_ITEMS,
  children,
}: AdminLayoutProps) {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout request failed");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Failed to log out", error);
      toast.error("Could not log out. Please try again.");
    }
  };

  useEffect(() => {
    let active = true;
    const handleProfileUpdate = (event: Event) => {
      const updatedUser = (event as CustomEvent<AdminUser>).detail;
      if (updatedUser) setCurrentUser(updatedUser);
    };

    window.addEventListener("admin-profile-updated", handleProfileUpdate);
    void fetch("/api/admin/profile")
      .then(async (response) => {
        if (response.status === 401 || response.status === 404) return;
        if (!response.ok) throw new Error("Could not load the signed-in profile");
        const result: { user: AdminUser } = await response.json();
        if (active) setCurrentUser(result.user);
      })
      .catch((error: unknown) => {
        console.error("Failed to load the signed-in profile", error);
      });

    return () => {
      active = false;
      window.removeEventListener("admin-profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        const match = sidebarItems.find(
          (i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (match) {
          window.location.href = match.href;
          setSearchQuery("");
        }
      }
    },
    [searchQuery, sidebarItems]
  );

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const filteredItems = sidebarItems.filter(
    (item) =>
      !item.roles || item.roles.includes(currentUser.role as "super_admin" | "editor" | "sales")
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile drawer backdrop */}
      {mobileDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileDrawer(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "admin-sidebar z-30 flex-shrink-0 transition-all duration-300",
          collapsed ? "lg:w-24" : "lg:w-[22rem]"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center gap-1 p-2" : "justify-between p-4",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-lg font-bold text-white">
              E
            </div>
            {!collapsed && (
              <div className="flex min-w-0 flex-col leading-none">
                <span className="font-bold text-lg tracking-tight">Edarcon</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="mt-5 flex flex-col gap-1 px-2">
          {filteredItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-item whitespace-nowrap",
                  active && "active",
                  collapsed && "justify-center",
                )}
                onClick={() => setMobileDrawer(false)}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "")} />
                {!collapsed && (
                  <>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-border">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors duration-150",
              "hover:bg-muted hover:text-foreground",
            )}
            title="Toggle theme"
            suppressHydrationWarning
          >
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span className="text-sm">Theme</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-full min-w-0">
        <header className="admin-topbar">
          <div className="flex h-full items-center justify-between px-4 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileDrawer((p) => !p)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-3 lg:flex">
                <div className="relative w-64 xl:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search (Enter)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="h-10 w-full border-input bg-card pl-10 pr-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <span className="animate-pulse-dot absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-background" />
                </button>
                <div className="mx-1 h-5 w-px bg-border" />
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                title="View site"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                suppressHydrationWarning
              >
{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-bold">
                    {formatRole(currentUser.role)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

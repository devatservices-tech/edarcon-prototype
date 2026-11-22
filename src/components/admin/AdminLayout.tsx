"use client";

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Moon, Sun, Search, ChevronDown, Bell, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: ("super_admin" | "editor" | "sales")[];
  badge?: number;
}

interface AdminLayoutProps {
  user: AdminUser;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}

const GROUPED_ITEMS: Record<string, SidebarItem[]> = {};

function formatRole(role: string) {
  return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function AdminLayout({ user, sidebarItems, children }: AdminLayoutProps) {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [commandPalette, setCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        const match = sidebarItems.find(
          (i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (match) {
          window.location.href = match.href;
          setCommandPalette(false);
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
      !item.roles || item.roles.includes(user.role as "super_admin" | "editor" | "sales")
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
          collapsed ? "lg:w-20" : ""
        )}
      >
        <div className="p-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight">Edarcon</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          )}
        </div>

        <nav className="mt-5 flex flex-col gap-1 px-2">
          {filteredItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-item",
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
              {!collapsed && (
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {pathname.split("/").filter(Boolean).pop() || "Dashboard"}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-9 pr-8 text-xs bg-transparent border-none outline-none focus:ring-0 w-48"
                />
                <button
                  onClick={() => setCommandPalette((p) => !p)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Command palette"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="w-px h-4 bg-border mx-1" />
              <span className="relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="animate-pulse-dot absolute -right-1 -top-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-background" />
              </span>
            </div>

            <div className="flex items-center gap-2">
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
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-bold">
                    {formatRole(user.role)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                  title="Logout"
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

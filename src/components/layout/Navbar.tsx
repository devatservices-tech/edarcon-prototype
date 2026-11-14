"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Sun, Moon, Globe, Menu, X, ChevronRight } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "home",      href: "/"          },
  { key: "services",  href: "/services"  },
  { key: "equipment", href: "/equipment" },
  { key: "catalog",   href: "/catalog"   },
  { key: "about",     href: "/about"     },
  { key: "contact",   href: "/contact"   },
] as const;

export default function Navbar({ locale }: { locale: string }) {
  const t  = useTranslations("nav");
  const tb = useTranslations("topbar");
  const { resolvedTheme, setTheme } = useTheme();
  const pathname    = usePathname(); // next-intl: already locale-stripped e.g. "/" or "/about"
  const router      = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isRtl       = locale === "ar";
  const otherLocale = isRtl ? "en" : "ar";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync html lang/dir on client-side locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir  = isRtl ? "rtl" : "ltr";
  }, [locale, isRtl]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  function switchLocale() {
    const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
    router.replace(cleanPath, { locale: otherLocale });
  }

  // pathname from next-intl usePathname is already locale-stripped
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden md:block bg-[var(--brand-blue)] text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${tb("phone").replace(/\s/g, "")}`}
              className="hover:text-[var(--brand-orange)] transition-colors"
            >
              {tb("phone")}
            </a>
            <span className="opacity-40">|</span>
            <a
              href={`mailto:${tb("email")}`}
              className="hover:text-[var(--brand-orange)] transition-colors"
            >
              {tb("email")}
            </a>
            <span className="opacity-40">|</span>
            <span className="opacity-80">{tb("location")}</span>
          </div>
          <span className="text-[var(--brand-orange)] font-semibold tracking-wide">
            {tb("vision")}
          </span>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-sm shadow-black/5"
            : "bg-background/70 backdrop-blur-md"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-[var(--brand-orange)] transition-all duration-200">
              <Image
                src="/images/logo.jpeg"
                alt="Edarcon logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-[15px] text-foreground tracking-tight">
                {isRtl ? "إيداركون" : "Edarcon"}
              </span>
              <span className="text-[11px] text-[var(--brand-orange)] font-medium tracking-wide">
                {isRtl ? "كونتراكتينج" : "Contracting"}
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-0.5" role="list">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive(href)
                      ? "text-[var(--brand-blue)] dark:text-[var(--brand-orange)]"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t(key)}
                  {isActive(href) && (
                    <span className="absolute bottom-0.5 start-3.5 end-3.5 h-0.5 rounded-full bg-[var(--brand-orange)]" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
{/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
              >
                {resolvedTheme === "dark"
                  ? <Sun size={17} strokeWidth={2} />
                  : <Moon size={17} strokeWidth={2} />}
              </button>
            )}

            {/* Language switcher */}
            <button
              onClick={switchLocale}
              aria-label={`Switch to ${otherLocale === "ar" ? "Arabic" : "English"}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Globe size={15} strokeWidth={2} />
              <span className="text-xs">{otherLocale === "ar" ? "عربي" : "EN"}</span>
            </button>

            {/* Quote CTA — desktop */}
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-1.5 ms-1 px-4 py-2 rounded-xl bg-[var(--brand-blue)] text-white text-sm font-semibold hover:bg-[var(--brand-blue-dark)] active:scale-95 transition-all duration-150 shadow-sm"
            >
              {t("requestQuote")}
              <ChevronRight size={14} className={cn(isRtl && "rotate-180")} />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="md:hidden p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 z-50 h-full w-72 bg-background border-border flex flex-col md:hidden",
          "transition-transform duration-300 ease-in-out",
          isRtl ? "left-0 border-e" : "right-0 border-s",
          drawerOpen
            ? "translate-x-0"
            : isRtl ? "-translate-x-full" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/images/logo.jpeg" alt="Edarcon" fill className="object-contain" />
            </div>
            <span className="font-bold text-sm text-foreground">
              {isRtl ? "إيداركون" : "Edarcon"}
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--brand-orange)]"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t(key)}
                  <ChevronRight
                    size={14}
                    className={cn("text-foreground/30", isRtl && "rotate-180")}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          <Link
            href="/contact"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--brand-blue)] text-white text-sm font-semibold hover:bg-[var(--brand-blue-dark)] transition-colors"
          >
            {t("requestQuote")}
          </Link>
          <div className="flex items-center justify-between">
            <button
              onClick={switchLocale}
              className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
            >
              <Globe size={13} />
              {otherLocale === "ar" ? "عربي" : "English"}
            </button>
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                {resolvedTheme === "dark"
                  ? <><Sun size={13} /><span>Light</span></>
                  : <><Moon size={13} /><span>Dark</span></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

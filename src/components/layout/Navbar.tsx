"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Bookmark, Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookmarks } from "@/context/BookmarksContext";
import { cn } from "@/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useSidebar } from "@/context/SidebarContext";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { count } = useBookmarks();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const { collapsed, setCollapsed, mobileOpen: sidebarMobileOpen, setMobileOpen: setSidebarMobileOpen } = useSidebar();

  useEffect(() => { 
    setMounted(true); 
    setIsAuth(!!localStorage.getItem("user_token") || !!localStorage.getItem("adminLoggedIn"));
    setIsAdmin(!!localStorage.getItem("adminLoggedIn"));
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const showAIChat = !(pathname.startsWith("/stories") || pathname.startsWith("/articles"));
  const authenticatedNavLinks = [
    { href: "/dashboard", label: t.dashboard },
    { href: "/explore", label: t.explore },
    ...(showAIChat ? [{ href: "/chat", label: "AI Chat" }] : []),
    { href: "/profile", label: "Profile" },
  ];

  const publicNavLinks: { href: string; label: string }[] = [];

  const navLinks = isAuth ? authenticatedNavLinks : publicNavLinks;

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300 w-full",
      isAuth || scrolled
        ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        : "bg-transparent"
    )}>
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section (with hamburger toggle if authenticated) */}
          <div className="flex items-center gap-3">
            {mounted && isAuth && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex p-2 rounded-full hover:bg-secondary/80 text-foreground transition-colors"
                aria-label="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Globe size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold whitespace-nowrap">
                Cultural<span className="text-primary">Vault</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav (hidden if authenticated to avoid duplication with sidebar) */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuth && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label={t.toggleTheme}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            {mounted && isAuth && (
              <Link
                href="/bookmarks"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label={t.bookmarks}
              >
                <Bookmark size={18} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            )}

            {mounted && isAuth && (
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-secondary transition-colors text-foreground"
                  aria-label="Language Selector"
                >
                  <Globe size={18} />
                  <span className="text-xs font-semibold uppercase">{activeLang.code}</span>
                </button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-1.5 z-50 overflow-hidden"
                    >
                      <div className="flex flex-col gap-0.5">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code as any);
                              setLangDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                              language === lang.code
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-secondary text-foreground"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                            {language === lang.code && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {mounted && isAuth ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-amber-500 hover:underline px-2 hidden sm:block border-r border-border pr-3"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-primary hover:underline px-2 hidden sm:block"
                >
                  {t.dashboard}
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("user_token");
                    localStorage.removeItem("adminLoggedIn");
                    setIsAuth(false);
                    window.location.href = "/";
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 ml-1"
                >
                  {t.logout}
                </button>
              </div>
            ) : mounted && !isAuth ? (
              <Link
                href="/signin"
                className="flex items-center text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors ml-2"
              >
                {t.signIn}
              </Link>
            ) : null}

            {mounted && isAuth && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => {
                  setSidebarMobileOpen(!sidebarMobileOpen);
                }}
                aria-label={t.menu}
              >
                {sidebarMobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}

    </header>
  );
}

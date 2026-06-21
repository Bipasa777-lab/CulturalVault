"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  Compass,
  Shield,
  Users,
  X,
  Upload,
  LayoutDashboard,
  MessageSquare,
  User,
  Bookmark,
  LogOut,
  Globe
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const { language, setLanguage } = useLanguage();

  const [sidebarLangOpen, setSidebarLangOpen] = useState(false);
  const sidebarLangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("adminLoggedIn"));
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarLangRef.current && !sidebarLangRef.current.contains(event.target as Node)) {
        setSidebarLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HIDE SIDEBAR ON THE FRONT PAGE & AUTH PAGES
  if (
    pathname === "/" ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/admin/signup"
  )
    return null;

  // 1. Admin Links (Only visible to admin)
  const adminLinks = [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
  ];

  // 2. Core User Links
  const showAIChat = !(pathname.startsWith("/stories") || pathname.startsWith("/articles"));
  const userCoreLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/explore", label: "Explore", icon: Compass },
    ...(showAIChat ? [{ href: "/chat", label: "AI Chat", icon: MessageSquare }] : []),
    { href: "/profile", label: "Profile", icon: User },
  ];

  // Combined for Collapsed View
  const coreLinks = isAdmin
    ? [...adminLinks, ...userCoreLinks]
    : userCoreLinks;

  // 3. Extra Links (Shown in Expanded View under "Overall Features")
  const extraLinks = [
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/risk-map", label: "Risk Dashboard", icon: Shield },
    { href: "/upload-center", label: "Upload Center", icon: Upload },
    { href: "/contribute", label: "Community", icon: Users }
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = !isMobile && collapsed;

    // Render for Collapsed (Compact) Desktop View
    const renderCollapsedLink = (item: { href: string; label: string; icon: any }) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "w-full py-4 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200",
            isActive
              ? "bg-secondary text-primary font-semibold shadow-sm"
              : "hover:bg-secondary/70 text-muted-foreground hover:text-foreground"
          )}
          title={item.label}
        >
          <item.icon size={22} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] tracking-wide mt-1 font-medium">{item.label}</span>
        </Link>
      );
    };

    // Render for Expanded (Full List) View
    const renderExpandedLink = (item: { href: string; label: string; icon: any }) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => isMobile && setMobileOpen(false)}
          className={cn(
            "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap",
            isActive
              ? "bg-secondary text-primary font-semibold shadow-sm"
              : "hover:bg-secondary/70 text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <item.icon size={20} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm">{item.label}</span>
        </Link>
      );
    };

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Mobile Header (Only visible inside mobile drawer) */}
        {isMobile && (
          <div className="h-16 flex items-center px-4 shrink-0 border-b border-border/50 gap-3">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full hover:bg-secondary text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Globe size={16} className="text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                Cultural<span className="text-primary">Vault</span>
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className={cn(
          "flex-1 flex flex-col overflow-y-auto py-3 custom-scrollbar",
          isCollapsed ? "px-1.5 gap-2" : "px-3 gap-1"
        )}>
          {isCollapsed ? (
            // Collapsed Desktop View
            <div className="flex flex-col gap-2 h-full justify-between pb-4">
              <div className="flex flex-col gap-2">
                {coreLinks.map(renderCollapsedLink)}
              </div>
              <div className="flex flex-col gap-2">
                <div className="my-1 border-t border-border/50" />
                {/* Compact Language Selector */}
                <div className="relative" ref={sidebarLangRef}>
                  <button
                    onClick={() => setSidebarLangOpen(!sidebarLangOpen)}
                    className="w-full py-3.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:bg-secondary/70 text-muted-foreground hover:text-foreground"
                    title="Select Language"
                  >
                    <Globe size={20} className="text-muted-foreground" />
                    <span className="text-[10px] tracking-wide mt-1 font-bold uppercase">{language}</span>
                  </button>

                  <AnimatePresence>
                    {sidebarLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-16 bottom-0 w-48 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-1.5 z-50 overflow-hidden"
                      >
                        <div className="flex flex-col gap-0.5">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code as any);
                                setSidebarLangOpen(false);
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
              </div>
            </div>
          ) : (
            // Expanded/Mobile View
            <>
              {isAdmin && (
                <>
                  <div className="px-3 mb-1.5 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-primary uppercase flex items-center gap-1">
                      <Shield size={12} /> Admin Panel
                    </span>
                  </div>
                  {adminLinks.map(renderExpandedLink)}
                  <div className="my-3 border-t border-border/50" />
                  <div className="px-3 mb-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      User Features
                    </span>
                  </div>
                </>
              )}
              {userCoreLinks.map(renderExpandedLink)}
              
              <div className="my-3 border-t border-border/50" />
              

              {extraLinks.map(renderExpandedLink)}

              <div className="my-3 border-t border-border/50" />
              <div className="px-3 py-1 flex flex-col gap-2">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Globe size={12} /> Languages / भाषाओं
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border border-transparent shadow-sm",
                        language === lang.code
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground hover:scale-[1.02]"
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-[40px]" />
              
              <div className="my-2 border-t border-border/50" />
              
              <button
                onClick={() => {
                  localStorage.removeItem("user_token");
                  localStorage.removeItem("adminLoggedIn");
                  window.location.href = "/";
                }}
                className="flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-500/10 font-medium whitespace-nowrap mb-2 animate-fade-in"
              >
                <LogOut size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:block fixed left-0 top-16 h-[calc(100vh-64px)] z-40 overflow-hidden bg-background border-r"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="md:hidden fixed left-0 top-0 h-screen w-[270px] z-50 bg-background shadow-2xl"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
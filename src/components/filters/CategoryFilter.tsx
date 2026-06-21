"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Category } from "@/types";
import { CATEGORIES } from "@/lib/mockData";
import { getCategoryIcon, cn } from "@/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

interface CategoryFilterProps {
  value: Category | "All";
  onChange: (category: Category | "All") => void;
}

export function CategoryFilter({
  value,
  onChange,
}: CategoryFilterProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categoryLabels: Record<string, string> = {
    All: t.all,
    Stories: "Stories",
    Articles: "Blogs",
    Architecture: t.architecture,
    Art: t.art,
    Music: t.music,
    Literature: t.literature,
    Cuisine: t.cuisine,
    Traditions: t.traditions,
    Crafts: t.crafts,
    Dance: t.dance,
  };

  const dropdownOptions = [
    { value: "All" as const, label: t.all },
    { value: "Stories" as const, label: "Story" },
    { value: "Articles" as const, label: "Blogs" },
  ];

  // The main buttons except "Stories" and "Articles" (since they are in the "All" dropdown)
  const mainCategories = CATEGORIES.filter(
    (cat) => cat !== "Stories" && cat !== "Articles"
  );

  const isDropdownActive = value === "All" || value === "Stories" || value === "Articles";
  const activeLabel = value === "Stories" ? "Story" : value === "Articles" ? "Blogs" : t.all;
  const activeIcon = value === "Stories" ? "📖" : value === "Articles" ? "📝" : null;

  return (
    <div className="flex items-center gap-2 w-full">
      {/* All dropdown */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
            isDropdownActive
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-secondary text-secondary-foreground border-transparent hover:border-border hover:bg-secondary/70"
          )}
        >
          {activeIcon && <span className="text-xs">{activeIcon}</span>}
          <span>{activeLabel}</span>
          <ChevronDown className={cn("size-3.5 opacity-80 transition-transform duration-200", isOpen && "rotate-180")} />
        </motion.button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 min-w-[150px] bg-background/95 border border-border rounded-2xl shadow-xl backdrop-blur-md p-1 flex flex-col gap-0.5">
            {dropdownOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-xl text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className="w-4 flex items-center justify-center text-xs">
                    {isSelected ? <Check className="size-3.5" /> : null}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-border/80 shrink-0 mx-1" />

      {/* Other Categories */}
      <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
        {mainCategories.filter((cat) => cat !== "All").map((cat) => {
          const active = value === cat;

          return (
            <motion.button
              key={cat}
              onClick={() => onChange(cat as Category | "All")}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary text-secondary-foreground border-transparent hover:border-border hover:bg-secondary/70"
              )}
            >
              <span className="text-xs">
                {getCategoryIcon(cat)}
              </span>
              {categoryLabels[cat] || cat}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
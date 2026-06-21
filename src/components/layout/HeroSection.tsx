"use client";

import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Link from "next/link";

export function HeroSection() {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <section className="relative hero-gradient overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5 border border-primary/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={12} />
            {t.cataloguedCultures}
          </motion.div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-5">
            {t.heroTitleLine1}{" "}
            <span className="gradient-text">{t.heroTitleLine2}</span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
            {t.heroDescription}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              <Compass size={18} />
              {t.startExploring}
            </a>
            <Link
              href="/community-gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              🏛 Community Gallery
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
             { value: "12+", label: t.culturalItems },
             { value: "8", label: t.categories },
             { value: "6", label: t.continents },
             { value: "50K+", label: t.yearsOfHistory },
            ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


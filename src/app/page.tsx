"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LandingPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [isAuth, setIsAuth] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsAuth(!!localStorage.getItem("user_token"));
  }, []);

  const signupHref = mounted && isAuth ? "/dashboard" : "/signup";
  const signupText = mounted && isAuth ? t.dashboard : t.joinRegistry;
  const exploreHref = mounted && isAuth ? "/explore" : "/signin";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden flex flex-col justify-center items-center">
      {/* Immersive background image with glassy gradient overlays */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <Image 
          src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=2000&q=80" 
          alt="Landing Background" 
          fill 
          className="object-cover opacity-40 hover:scale-105 transition-transform"
          style={{ transitionDuration: "20s" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/50 to-background z-10" />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center"
      >
        <motion.h1 variants={itemVariants} className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-8">
          {t.landingTitle1} <span className="text-primary">{t.landingTitle2}</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">
          {t.landingSubtitle}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link 
            href={signupHref} 
            className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg text-center"
          >
            {signupText}
          </Link>
          <Link 
            href={exploreHref} 
            className="px-10 py-4 bg-secondary/40 border border-border/80 text-foreground font-semibold rounded-2xl hover:bg-secondary/60 transition-all hover:-translate-y-1 shadow-sm text-center"
          >
            {t.exploreLibrary}
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Decorative blurred shapes behind content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/20 blur-[150px] rounded-full pointer-events-none translate-x-1/2 z-0" 
      />
    </main>
  );
}

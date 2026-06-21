"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "hi" | "bn" | "ta" | "te" | "es" | "fr" | "ar";

type ContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<ContextType>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("en");

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "hi" ||
      savedLanguage === "bn" ||
      savedLanguage === "ta" ||
      savedLanguage === "te" ||
      savedLanguage === "es" ||
      savedLanguage === "fr" ||
      savedLanguage === "ar"
    ) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language whenever it changes and update HTML attributes (RTL / lang)
  useEffect(() => {
    localStorage.setItem("language", language);
    if (typeof document !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
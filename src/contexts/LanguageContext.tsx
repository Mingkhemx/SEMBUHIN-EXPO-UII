import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations } from "@/locales/translations";

type Language = "id" | "en" | "ms" | "zh" | "ja" | "ko" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_lang");
    return (saved as Language) || "id";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  // Helper function to get translation from path like "nav.home"
  const t = (path: string): any => {
    const keys = path.split(".");
    let result = translations[language];

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to ID if translation missing
        let fallback = translations["id"];
        let foundFallback = true;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            foundFallback = false;
            break;
          }
        }
        return foundFallback ? fallback : path;
      }
    }

    return result !== undefined ? result : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

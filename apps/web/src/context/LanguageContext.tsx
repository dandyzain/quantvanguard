'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dict: typeof translations.en;
  t: (section: keyof typeof translations.en, key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'quantvanguard_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English by default as requested: "defaultnya bahasa inggris"
  const [language, setLanguageState] = useState<Language>('en');

  // Load from localStorage on mount if saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved === 'en' || saved === 'id') {
        setLanguageState(saved);
      }
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'id' : 'en';
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch (e) {
        // Ignore
      }
      return next;
    });
  }, []);

  const dict = translations[language] || translations.en;

  const t = useCallback(
    (section: keyof typeof translations.en, key: string, fallback?: string): string => {
      const sec = dict[section] as any;
      if (sec && typeof sec[key] === 'string') {
        return sec[key];
      }
      return fallback || key;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        dict,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

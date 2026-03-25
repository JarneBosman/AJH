"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  defaultLanguage,
  getTranslations,
  Language,
  languageCookieName,
  languageStorageKey,
  normalizeLanguage,
  Translations,
} from "@/lib/i18n";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>(normalizeLanguage(initialLanguage));

  const setLanguage = (nextLanguage: Language) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    localStorage.setItem(languageStorageKey, normalized);
    document.cookie = `${languageCookieName}=${normalized}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = normalized;
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: getTranslations(language),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    return {
      language: defaultLanguage,
      setLanguage: () => undefined,
      t: getTranslations(defaultLanguage),
    };
  }

  return context;
};

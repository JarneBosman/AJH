"use client";

import { useI18n } from "@/context/i18n-context";

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/80 p-1">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition sm:px-3 sm:tracking-[0.16em] ${
          language === "en"
            ? "bg-[var(--color-wood)] text-white"
            : "text-[var(--color-muted)] hover:bg-[var(--color-neutral-100)]"
        }`}
        aria-pressed={language === "en"}
      >
        {t.languageEn}
      </button>
      <button
        type="button"
        onClick={() => setLanguage("nl")}
        className={`rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition sm:px-3 sm:tracking-[0.16em] ${
          language === "nl"
            ? "bg-[var(--color-wood)] text-white"
            : "text-[var(--color-muted)] hover:bg-[var(--color-neutral-100)]"
        }`}
        aria-pressed={language === "nl"}
      >
        {t.languageNl}
      </button>
    </div>
  );
};

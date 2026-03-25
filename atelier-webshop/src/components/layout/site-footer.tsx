"use client";

import Link from "next/link";
import { useI18n } from "@/context/i18n-context";

export const SiteFooter = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 md:px-10">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wood)]">
            {t.footerEyebrow}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            {t.footerDescription}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-[var(--color-muted)]">
          <Link href="/shop" className="hover:text-[var(--color-ink)]">
            {t.footerShop}
          </Link>
          <Link href="/configurator" className="hover:text-[var(--color-ink)]">
            {t.footerConfigurator}
          </Link>
          <Link href="/cart" className="hover:text-[var(--color-ink)]">
            {t.footerCart}
          </Link>
        </div>
      </div>
    </footer>
  );
};

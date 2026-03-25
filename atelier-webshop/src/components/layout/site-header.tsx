"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/context/i18n-context";

interface SiteHeaderLink {
  href: string;
  label: string;
  external?: boolean;
}

export const SiteHeader = ({
  brandName = "Atelier Nord",
  links: cmsLinks,
}: {
  brandName?: string;
  links?: SiteHeaderLink[];
}) => {
  const { t } = useI18n();
  const fallbackLinks: SiteHeaderLink[] = [
    { href: "/shop", label: t.navShop },
    { href: "/configurator", label: t.navConfigurator },
    { href: "/cart", label: t.navCart },
  ];

  const links = cmsLinks && cmsLinks.length > 0 ? cmsLinks : fallbackLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-wood)] transition group-hover:scale-125" />
          <span data-preview-brand className="text-sm font-semibold tracking-[0.22em] text-[var(--color-ink)] uppercase">
            {brandName}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex items-center gap-1 rounded-full bg-[var(--color-neutral-100)] p-1"
        >
          {links.map((link, index) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-cms-editable={`nav.header.${index}.label`}
                data-cms-edit-types="text,color,location"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)] md:px-4"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                data-cms-editable={`nav.header.${index}.label`}
                data-cms-edit-types="text,color,location"
                className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)] md:px-4"
              >
                {link.label}
              </Link>
            )
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
};

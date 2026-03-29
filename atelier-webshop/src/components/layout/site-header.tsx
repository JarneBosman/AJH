"use client";

import Image from "next/image";
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
  logoUrl,
  links: cmsLinks,
}: {
  brandName?: string;
  logoUrl?: string;
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
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10">
        <Link href="/" className="group inline-flex items-center gap-3">
          {logoUrl ? (
            <Image
              data-preview-logo-image
              src={logoUrl}
              alt={`${brandName} logo`}
              width={34}
              height={34}
              className="h-8 w-8 rounded-md object-contain"
              unoptimized
            />
          ) : (
            <span
              data-preview-logo-mark
              className="inline-block h-2 w-2 rounded-full bg-[var(--color-logo)] transition group-hover:scale-125"
            />
          )}
          <span
            data-preview-brand
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-logo)] sm:text-sm sm:tracking-[0.22em]"
          >
            {brandName}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex w-full items-center gap-1 overflow-x-auto rounded-full bg-[var(--color-neutral-100)] p-1 sm:w-auto"
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
                className="whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)] sm:text-xs sm:tracking-[0.16em] md:px-4"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                data-cms-editable={`nav.header.${index}.label`}
                data-cms-edit-types="text,color,location"
                className="whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)] sm:text-xs sm:tracking-[0.16em] md:px-4"
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

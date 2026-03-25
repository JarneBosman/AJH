"use client";

import Link from "next/link";
import { useI18n } from "@/context/i18n-context";

interface SiteFooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export const SiteFooter = ({ links: cmsLinks }: { links?: SiteFooterLink[] }) => {
  const { t } = useI18n();
  const fallbackLinks: SiteFooterLink[] = [
    { href: "/shop", label: t.footerShop },
    { href: "/configurator", label: t.footerConfigurator },
    { href: "/cart", label: t.footerCart },
  ];

  const links = cmsLinks && cmsLinks.length > 0 ? cmsLinks : fallbackLinks;

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
          {links.map((link, index) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                data-cms-editable={`nav.footer.${index}.label`}
                data-cms-edit-types="text,color,location"
                className="hover:text-[var(--color-ink)]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                data-cms-editable={`nav.footer.${index}.label`}
                data-cms-edit-types="text,color,location"
                className="hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </footer>
  );
};

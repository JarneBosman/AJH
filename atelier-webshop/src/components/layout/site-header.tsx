import Link from "next/link";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/configurator", label: "Configurator" },
  { href: "/cart", label: "Cart" },
];

export const SiteHeader = ({ brandName = "Atelier Nord" }: { brandName?: string }) => {
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)] md:px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CmsPreviewBridge } from "@/components/layout/cms-preview-bridge";
import { getSiteSettingsFromStore } from "@/lib/site-settings-repository";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier Nord | Handmade Custom Furniture",
  description:
    "Premium handcrafted furniture webshop with configurable pieces and a full custom furniture configurator.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettingsFromStore();

  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${plusJakarta.variable} antialiased`}
        data-layout={siteSettings.layoutMode}
        data-layout-container={siteSettings.containerWidth}
        data-section-spacing={siteSettings.sectionSpacing}
        data-hero-layout={siteSettings.heroLayout}
        style={
          {
            "--color-bg": siteSettings.colorBg,
            "--color-ink": siteSettings.colorInk,
            "--color-muted": siteSettings.colorMuted,
            "--color-neutral-100": siteSettings.colorNeutral100,
            "--color-neutral-200": siteSettings.colorNeutral200,
            "--color-neutral-300": siteSettings.colorNeutral300,
            "--color-wood": siteSettings.colorWood,
            "--color-wood-dark": siteSettings.colorWoodDark,
          } as React.CSSProperties
        }
      >
        <CmsPreviewBridge />
        <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
          <SiteHeader brandName={siteSettings.brandName} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

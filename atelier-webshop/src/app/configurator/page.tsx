import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CustomFurnitureConfigurator } from "@/components/configurator/custom-furniture-configurator";
import { Providers } from "@/components/providers";
import { getPublishedCmsPageContentFromStore, getPublishedSeoBySlug } from "@/lib/cms-repository";
import { getTranslations, languageCookieName, normalizeLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);
  const seo = await getPublishedSeoBySlug("configurator", language);

  return {
    title: seo?.metaTitle || t.configTitle,
    description: seo?.metaDescription || t.configDescription,
    openGraph: {
      title: seo?.metaTitle || t.configTitle,
      description: seo?.metaDescription || t.configDescription,
      ...(seo?.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function ConfiguratorPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);
  const cmsPage = await getPublishedCmsPageContentFromStore("configurator", language);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-12 md:px-10">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wood)]">
          <span data-cms-editable="configurator.eyebrow" data-cms-edit-types="text,color,location">
          {cmsPage?.eyebrow || t.configEyebrow}
          </span>
        </p>
        <h1
          data-cms-editable="configurator.title"
          data-cms-edit-types="text,color,location"
          className="mt-3 text-balance text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl"
        >
          {cmsPage?.title || t.configTitle}
        </h1>
        <p
          data-cms-editable="configurator.description"
          data-cms-edit-types="text,color,location"
          className="mt-4 text-pretty text-base leading-8 text-[var(--color-muted)] md:text-lg"
        >
          {cmsPage?.description || t.configDescription}
        </p>
      </div>

      <Providers>
        <CustomFurnitureConfigurator />
      </Providers>
    </section>
  );
}

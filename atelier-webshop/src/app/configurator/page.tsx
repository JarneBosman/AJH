import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CustomFurnitureConfigurator } from "@/components/configurator/custom-furniture-configurator";
import { Providers } from "@/components/providers";
import {
  getPublishedCmsHomeContentFromStore,
  getPublishedCmsPageContentFromStore,
  getPublishedSeoBySlug,
} from "@/lib/cms-repository";
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
  const cmsHome = await getPublishedCmsHomeContentFromStore(language);
  const hiddenEditableIds = new Set(cmsHome?.hiddenEditableIds ?? []);
  const configuratorCustomBlocks = (cmsHome?.customBlocks ?? []).filter(
    (block) =>
      (block.page ?? "home") === "configurator" &&
      !hiddenEditableIds.has(`home.customBlock.${block.id}`) &&
      (block.type === "text" || block.type === "image"),
  );

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

      <section
        data-cms-custom-blocks-section
        className={`mt-10 ${configuratorCustomBlocks.length === 0 ? "hidden" : ""}`}
      >
        <div data-cms-custom-blocks className="grid gap-5 md:grid-cols-2">
          {configuratorCustomBlocks.map((block) =>
            block.type === "text" ? (
              <article
                key={block.id}
                data-cms-editable={`home.customBlock.${block.id}`}
                data-cms-edit-types="text,color,shape,location,background"
                className="rounded-3xl border border-black/5 bg-white px-5 py-6 text-[var(--color-muted)] shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]"
                style={{
                  backgroundColor: block.backgroundColor || "#ffffff",
                  borderRadius: block.backgroundShape === "pill" ? "9999px" : "1.5rem",
                }}
              >
                <p className="leading-7">{block.text}</p>
              </article>
            ) : (
              <figure
                key={block.id}
                data-cms-editable={`home.customBlock.${block.id}`}
                data-cms-edit-types="image,shape,location,background"
                className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_25px_55px_-35px_rgba(0,0,0,0.5)]"
                style={{
                  backgroundColor: block.backgroundColor || "#ffffff",
                  borderRadius: block.backgroundShape === "pill" ? "9999px" : "1.5rem",
                }}
              >
                <div className="relative aspect-[4/3] w-full">
                  {block.imageUrl ? (
                    <img
                      src={block.imageUrl}
                      alt={block.alt || "Configurator custom block image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-neutral-200)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      Add image
                    </div>
                  )}
                </div>
              </figure>
            ),
          )}
        </div>
      </section>
    </section>
  );
}

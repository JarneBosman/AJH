import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPublishedCmsHomeContentFromStore, getPublishedSeoBySlug } from "@/lib/cms-repository";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getAllCategoriesFromStore } from "@/lib/categories-repository";
import { localizeCategory, localizeProduct } from "@/lib/content-localization";
import { getFeaturedProducts } from "@/lib/products-repository";
import { getTranslations, languageCookieName, normalizeLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);
  const seo = await getPublishedSeoBySlug("home", language);

  return {
    title: seo?.metaTitle || t.homeHeroTitle,
    description: seo?.metaDescription || t.homeHeroDescription,
    openGraph: {
      title: seo?.metaTitle || t.homeHeroTitle,
      description: seo?.metaDescription || t.homeHeroDescription,
      ...(seo?.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function Home() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);
  const cmsHome = await getPublishedCmsHomeContentFromStore(language);
  const featuredProducts = (await getFeaturedProducts()).map((product) =>
    localizeProduct(product, language),
  );
  const categories = (await getAllCategoriesFromStore()).map((category) =>
    localizeCategory(category, language),
  );
  const hiddenEditableIds = new Set(cmsHome?.hiddenEditableIds ?? []);
  const isVisible = (editableId: string) => !hiddenEditableIds.has(editableId);
  const customBlocks = (cmsHome?.customBlocks ?? []).filter((block) =>
    isVisible(`home.customBlock.${block.id}`),
  );

  return (
    <div className="pb-20">
      {isVisible("home.heroSection") ? (
        <section
          data-home-hero
          data-cms-editable="home.heroSection"
          data-cms-edit-types="shape,location,background"
          className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-6 pt-10 sm:gap-8 sm:px-6 md:grid-cols-[1fr_1.1fr] md:px-10 md:pt-20"
        >
        <div data-home-hero-copy className="animate-rise max-w-xl space-y-6">
          {isVisible("home.heroEyebrow") ? (
            <p
              data-cms-editable="home.heroEyebrow"
              data-cms-edit-types="text,color,shape,location,background"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]"
            >
              {cmsHome?.heroEyebrow || t.homeHeroEyebrow}
            </p>
          ) : null}
          {isVisible("home.heroTitle") ? (
            <h1
              data-cms-editable="home.heroTitle"
              data-cms-edit-types="text,color,shape,location,background"
              className="text-balance text-4xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl md:text-6xl"
            >
              {cmsHome?.heroTitle || t.homeHeroTitle}
            </h1>
          ) : null}
          {isVisible("home.heroDescription") ? (
            <p
              data-cms-editable="home.heroDescription"
              data-cms-edit-types="text,color,location"
              className="text-pretty text-base leading-7 text-[var(--color-muted)] md:text-lg"
            >
              {cmsHome?.heroDescription || t.homeHeroDescription}
            </p>
          ) : null}
          {isVisible("home.heroPrimaryCta") || isVisible("home.heroSecondaryCta") ? (
            <div data-home-hero-actions className="flex flex-wrap gap-3">
              {isVisible("home.heroPrimaryCta") ? (
                <Link href="/shop">
                  <Button
                    data-cms-editable="home.heroPrimaryCta"
                    data-cms-edit-types="text,color,shape,location,background"
                  >
                    {cmsHome?.heroPrimaryCta || t.homeHeroPrimaryCta}
                  </Button>
                </Link>
              ) : null}
              {isVisible("home.heroSecondaryCta") ? (
                <Link href="/configurator">
                  <Button
                    variant="secondary"
                    data-cms-editable="home.heroSecondaryCta"
                    data-cms-edit-types="text,color,shape,location,background"
                  >
                    {cmsHome?.heroSecondaryCta || t.homeHeroSecondaryCta}
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {isVisible("home.heroMedia") ? (
          <div
            data-home-hero-media
            data-cms-editable="home.heroMedia"
            data-cms-edit-types="image,shape,location,background"
            data-cms-image-target="img"
            className="relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white p-2 shadow-[0_30px_70px_-45px_rgba(0,0,0,0.5)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem]">
              <Image
                src={
                  cmsHome?.heroImage ||
                  "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80"
                }
                alt="Artisanal table in a modern interior"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          </div>
        ) : null}
      </section>
      ) : null}

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 md:mt-12 md:px-10">
        {isVisible("home.featuredEyebrow") ||
        isVisible("home.featuredTitle") ||
        isVisible("home.featuredDescription") ? (
          <SectionHeading
            eyebrow={isVisible("home.featuredEyebrow") ? cmsHome?.featuredEyebrow || t.homeFeaturedEyebrow : undefined}
            title={isVisible("home.featuredTitle") ? cmsHome?.featuredTitle || t.homeFeaturedTitle : undefined}
            description={
              isVisible("home.featuredDescription")
                ? cmsHome?.featuredDescription || t.homeFeaturedDescription
                : undefined
            }
            eyebrowEditableId={isVisible("home.featuredEyebrow") ? "home.featuredEyebrow" : undefined}
            titleEditableId={isVisible("home.featuredTitle") ? "home.featuredTitle" : undefined}
            descriptionEditableId={
              isVisible("home.featuredDescription") ? "home.featuredDescription" : undefined
            }
          />
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 md:mt-20 md:px-10">
        {isVisible("home.categoriesEyebrow") ||
        isVisible("home.categoriesTitle") ||
        isVisible("home.categoriesDescription") ? (
          <SectionHeading
            eyebrow={
              isVisible("home.categoriesEyebrow")
                ? cmsHome?.categoriesEyebrow || t.homeCategoriesEyebrow
                : undefined
            }
            title={
              isVisible("home.categoriesTitle") ? cmsHome?.categoriesTitle || t.homeCategoriesTitle : undefined
            }
            description={
              isVisible("home.categoriesDescription")
                ? cmsHome?.categoriesDescription || t.homeCategoriesDescription
                : undefined
            }
            eyebrowEditableId={isVisible("home.categoriesEyebrow") ? "home.categoriesEyebrow" : undefined}
            titleEditableId={isVisible("home.categoriesTitle") ? "home.categoriesTitle" : undefined}
            descriptionEditableId={
              isVisible("home.categoriesDescription") ? "home.categoriesDescription" : undefined
            }
          />
        ) : null}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop/${category.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/5 bg-white transition hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={category.heroImage}
                  alt={category.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="space-y-2 px-5 py-5">
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                  {category.name}
                </h3>
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {isVisible("home.storyCard") ? (
        <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 md:mt-20 md:px-10">
        <div
          data-cms-editable="home.storyCard"
          data-cms-edit-types="shape,location,background"
          className="rounded-[2rem] border border-black/5 bg-white p-5 sm:p-8 md:p-12"
        >
          {isVisible("home.storyEyebrow") || isVisible("home.storyTitle") || isVisible("home.storyDescription") ? (
            <SectionHeading
              eyebrow={isVisible("home.storyEyebrow") ? cmsHome?.storyEyebrow || t.homeStoryEyebrow : undefined}
              title={isVisible("home.storyTitle") ? cmsHome?.storyTitle || t.homeStoryTitle : undefined}
              description={
                isVisible("home.storyDescription")
                  ? cmsHome?.storyDescription || t.homeStoryDescription
                  : undefined
              }
              eyebrowEditableId={isVisible("home.storyEyebrow") ? "home.storyEyebrow" : undefined}
              titleEditableId={isVisible("home.storyTitle") ? "home.storyTitle" : undefined}
              descriptionEditableId={isVisible("home.storyDescription") ? "home.storyDescription" : undefined}
            />
          ) : null}
          {isVisible("home.storyPointOne") ||
          isVisible("home.storyPointTwo") ||
          isVisible("home.storyPointThree") ? (
            <div className="mt-8 grid gap-4 text-sm text-[var(--color-muted)] md:grid-cols-3">
              {isVisible("home.storyPointOne") ? (
                <p data-cms-editable="home.storyPointOne" data-cms-edit-types="text,color,shape,location,background">
                  {cmsHome?.storyPointOne || t.homeStoryPointOne}
                </p>
              ) : null}
              {isVisible("home.storyPointTwo") ? (
                <p data-cms-editable="home.storyPointTwo" data-cms-edit-types="text,color,shape,location,background">
                  {cmsHome?.storyPointTwo || t.homeStoryPointTwo}
                </p>
              ) : null}
              {isVisible("home.storyPointThree") ? (
                <p data-cms-editable="home.storyPointThree" data-cms-edit-types="text,color,shape,location,background">
                  {cmsHome?.storyPointThree || t.homeStoryPointThree}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
      ) : null}

      <section
        data-cms-custom-blocks-section
        className={`mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6 md:mt-20 md:px-10 ${
          customBlocks.length === 0 ? "hidden" : ""
        }`}
      >
        <div data-cms-custom-blocks className="grid gap-5 md:grid-cols-2">
          {customBlocks.map((block) =>
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
                    <Image
                      src={block.imageUrl}
                      alt={block.alt || "Homepage custom block image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
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
    </div>
  );
}

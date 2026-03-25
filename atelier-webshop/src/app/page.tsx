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

  return (
    <div className="pb-20">
      <section
        data-home-hero
        data-cms-editable="home.heroSection"
        data-cms-edit-types="shape,location,background"
        className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-8 pt-14 md:grid-cols-[1fr_1.1fr] md:px-10 md:pt-20"
      >
        <div data-home-hero-copy className="animate-rise max-w-xl space-y-6">
          <p
            data-cms-editable="home.heroEyebrow"
            data-cms-edit-types="text,color,location"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]"
          >
            {cmsHome?.heroEyebrow || t.homeHeroEyebrow}
          </p>
          <h1
            data-cms-editable="home.heroTitle"
            data-cms-edit-types="text,color,location"
            className="text-balance text-5xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] md:text-6xl"
          >
            {cmsHome?.heroTitle || t.homeHeroTitle}
          </h1>
          <p
            data-cms-editable="home.heroDescription"
            data-cms-edit-types="text,color,location"
            className="text-pretty text-base leading-8 text-[var(--color-muted)] md:text-lg"
          >
            {cmsHome?.heroDescription || t.homeHeroDescription}
          </p>
          <div data-home-hero-actions className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              data-cms-editable="home.heroPrimaryCta"
              data-cms-edit-types="text,color,shape,location,background"
            >
              <Button>{cmsHome?.heroPrimaryCta || t.homeHeroPrimaryCta}</Button>
            </Link>
            <Link
              href="/configurator"
              data-cms-editable="home.heroSecondaryCta"
              data-cms-edit-types="text,color,shape,location,background"
            >
              <Button variant="secondary">{cmsHome?.heroSecondaryCta || t.homeHeroSecondaryCta}</Button>
            </Link>
          </div>
        </div>

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
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow={cmsHome?.featuredEyebrow || t.homeFeaturedEyebrow}
          title={cmsHome?.featuredTitle || t.homeFeaturedTitle}
          description={cmsHome?.featuredDescription || t.homeFeaturedDescription}
          eyebrowEditableId="home.featuredEyebrow"
          titleEditableId="home.featuredTitle"
          descriptionEditableId="home.featuredDescription"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow={cmsHome?.categoriesEyebrow || t.homeCategoriesEyebrow}
          title={cmsHome?.categoriesTitle || t.homeCategoriesTitle}
          description={cmsHome?.categoriesDescription || t.homeCategoriesDescription}
          eyebrowEditableId="home.categoriesEyebrow"
          titleEditableId="home.categoriesTitle"
          descriptionEditableId="home.categoriesDescription"
        />

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

      <section className="mx-auto mt-20 w-full max-w-7xl px-6 md:px-10">
        <div
          data-cms-editable="home.storyCard"
          data-cms-edit-types="shape,location,background"
          className="rounded-[2rem] border border-black/5 bg-white p-8 md:p-12"
        >
          <SectionHeading
            eyebrow={cmsHome?.storyEyebrow || t.homeStoryEyebrow}
            title={cmsHome?.storyTitle || t.homeStoryTitle}
            description={cmsHome?.storyDescription || t.homeStoryDescription}
            eyebrowEditableId="home.storyEyebrow"
            titleEditableId="home.storyTitle"
            descriptionEditableId="home.storyDescription"
          />
          <div className="mt-8 grid gap-4 text-sm text-[var(--color-muted)] md:grid-cols-3">
            <p data-cms-editable="home.storyPointOne" data-cms-edit-types="text,color,location">
              {cmsHome?.storyPointOne || t.homeStoryPointOne}
            </p>
            <p data-cms-editable="home.storyPointTwo" data-cms-edit-types="text,color,location">
              {cmsHome?.storyPointTwo || t.homeStoryPointTwo}
            </p>
            <p data-cms-editable="home.storyPointThree" data-cms-edit-types="text,color,location">
              {cmsHome?.storyPointThree || t.homeStoryPointThree}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedCmsHomeContentFromStore } from "@/lib/cms-repository";
import { getAllCategoriesFromStore, getCategoryBySlugFromStore } from "@/lib/categories-repository";
import { localizeCategory, localizeProduct } from "@/lib/content-localization";
import { getAllProducts, getProductsByCategoryFromStore } from "@/lib/products-repository";
import { getTranslations, languageCookieName, normalizeLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value);
  const t = getTranslations(language);

  const { category } = await params;
  const isAllCategory = category === "all";
  const categoryData = isAllCategory
    ? {
        slug: "all",
        name: "All",
        nameNl: "Alle",
        description: "Browse every product in the collection.",
        descriptionNl: "Bekijk alle producten in de collectie.",
        heroImage: "",
      }
    : await getCategoryBySlugFromStore(category);

  if (!categoryData) {
    notFound();
  }

  const localizedCategory = localizeCategory(categoryData, language);
  const categories = (await getAllCategoriesFromStore()).map((entry) => localizeCategory(entry, language));
  const allProducts = (await getAllProducts()).map((product) => localizeProduct(product, language));
  const cmsHome = await getPublishedCmsHomeContentFromStore(language);
  const hiddenEditableIds = new Set(cmsHome?.hiddenEditableIds ?? []);
  const shopCustomBlocks = (cmsHome?.customBlocks ?? []).filter(
    (block) =>
      (block.page ?? "home") === "shop" &&
      !hiddenEditableIds.has(`home.customBlock.${block.id}`) &&
      (block.type === "text" ||
        block.type === "image" ||
        block.type === "product" ||
        block.type === "category"),
  );

  const categoryProducts = (
    isAllCategory ? await getAllProducts() : await getProductsByCategoryFromStore(categoryData.slug)
  ).map((product) =>
    localizeProduct(product, language),
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 md:px-10 md:pb-20 md:pt-12">
      <SectionHeading
        eyebrow={localizedCategory.name}
        title={localizedCategory.description}
        description={t.categoryDescription}
      />

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          href="/shop/all"
          className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
            isAllCategory
              ? "border-[var(--color-wood)] bg-[var(--color-neutral-100)] text-[var(--color-ink)]"
              : "border-black/10 bg-white text-[var(--color-ink)] hover:border-[var(--color-wood)]"
          }`}
          data-cms-editable="shop.category-card.all"
          data-cms-edit-types="location"
        >
          {language === "nl" ? "Alle" : "All"}
        </Link>
        {categories.map((entry) => {
          const isActive = !isAllCategory && entry.slug === categoryData.slug;

          return (
            <Link
              key={entry.slug}
              href={`/shop/${entry.slug}`}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                isActive
                  ? "border-[var(--color-wood)] bg-[var(--color-neutral-100)] text-[var(--color-ink)]"
                  : "border-black/10 bg-white text-[var(--color-ink)] hover:border-[var(--color-wood)]"
              }`}
              data-cms-editable={`shop.category-card.${entry.slug}`}
              data-cms-edit-types="location"
            >
              {entry.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <section
        data-cms-custom-blocks-section
        className={`mt-10 ${shopCustomBlocks.length === 0 ? "hidden" : ""}`}
      >
        <div data-cms-custom-blocks className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shopCustomBlocks.map((block) =>
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
            ) : block.type === "image" ? (
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
                      alt={block.alt || "Shop custom block image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-neutral-200)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      Add image
                    </div>
                  )}
                </div>
              </figure>
            ) : block.type === "product" && block.productId ? (
              (() => {
                const product = allProducts.find((entry) => entry.id === block.productId);
                if (!product) {
                  return null;
                }

                return (
                  <div
                    key={block.id}
                    data-cms-editable={`home.customBlock.${block.id}`}
                    data-cms-edit-types="location"
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })()
            ) : block.type === "category" && block.categoryId ? (
              (() => {
                const categoryEntry = categories.find((entry) => entry.id === block.categoryId);
                if (!categoryEntry) {
                  return null;
                }

                return (
                  <Link
                    key={block.id}
                    href={`/shop/${categoryEntry.slug}`}
                    className="group overflow-hidden rounded-3xl border border-black/5 bg-white transition hover:-translate-y-1"
                    data-cms-editable={`home.customBlock.${block.id}`}
                    data-cms-edit-types="location"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={categoryEntry.heroImage}
                        alt={categoryEntry.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2 px-5 py-5">
                      <h3 className="text-lg font-semibold text-[var(--color-ink)]">{categoryEntry.name}</h3>
                      <p className="text-sm leading-6 text-[var(--color-muted)]">{categoryEntry.description}</p>
                    </div>
                  </Link>
                );
              })()
            ) : null,
          )}
        </div>
      </section>
    </section>
  );
}

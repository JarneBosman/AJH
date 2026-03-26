import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
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
    </section>
  );
}

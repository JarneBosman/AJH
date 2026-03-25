import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCustomizationOptions } from "@/data/shop-data";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryBySlugFromStore } from "@/lib/categories-repository";
import { localizeCategory, localizeProduct } from "@/lib/content-localization";
import { getProductsByCategoryFromStore } from "@/lib/products-repository";
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
  const categoryData = await getCategoryBySlugFromStore(category);

  if (!categoryData) {
    notFound();
  }

  const localizedCategory = localizeCategory(categoryData, language);

  const categoryProducts = (await getProductsByCategoryFromStore(categoryData.slug)).map((product) =>
    localizeProduct(product, language),
  );
  const options = getCustomizationOptions(categoryData.slug);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-12 md:px-10">
      <SectionHeading
        eyebrow={localizedCategory.name}
        title={localizedCategory.description}
        description={t.categoryDescription}
      />

      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {t.categoryCustomizations}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => (
            <span
              key={option.id}
              className="rounded-full bg-[var(--color-neutral-100)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]"
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

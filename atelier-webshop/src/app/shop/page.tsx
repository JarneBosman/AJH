import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllCategoriesFromStore } from "@/lib/categories-repository";
import { getAllProducts } from "@/lib/products-repository";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getAllProducts();
  const categories = await getAllCategoriesFromStore();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-12 md:px-10">
      <SectionHeading
        eyebrow="Collection"
        title="Browse the webshop"
        description="Explore handcrafted pieces across tables, chairs, cabinets, and shelving."
      />

      <div className="mt-7 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop/${category.slug}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition hover:border-[var(--color-wood)]"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { getAllCategoriesFromStore } from "@/lib/categories-repository";
import { getFeaturedProducts } from "@/lib/products-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getAllCategoriesFromStore();

  return (
    <div className="pb-20">
      <section
        data-home-hero
        className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-8 pt-14 md:grid-cols-[1fr_1.1fr] md:px-10 md:pt-20"
      >
        <div data-home-hero-copy className="animate-rise max-w-xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]">
            Custom furniture workshop
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] md:text-6xl">
            Handmade furniture with tailored craftsmanship.
          </h1>
          <p className="text-pretty text-base leading-8 text-[var(--color-muted)] md:text-lg">
            Discover solid wood pieces crafted in small batches and configured to
            your exact space, finish, and style.
          </p>
          <div data-home-hero-actions className="flex flex-wrap gap-3">
            <Link href="/shop">
              <Button>Browse collection</Button>
            </Link>
            <Link href="/configurator">
              <Button variant="secondary">Start configurator</Button>
            </Link>
          </div>
        </div>

        <div
          data-home-hero-media
          className="relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white p-2 shadow-[0_30px_70px_-45px_rgba(0,0,0,0.5)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem]">
            <Image
              src="https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80"
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
          eyebrow="Featured"
          title="Signature pieces"
          description="Our most requested handcrafted designs, each customizable per category."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by furniture type"
          description="Each category includes dedicated customization logic and tailored finishing options."
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
        <div className="rounded-[2rem] border border-black/5 bg-white p-8 md:p-12">
          <SectionHeading
            eyebrow="Brand story"
            title="Built slowly, made to last"
            description="We partner with local sawmills and shape every piece by hand. Grain, tone, and detail are treated as unique characteristics, never defects."
          />
          <div className="mt-8 grid gap-4 text-sm text-[var(--color-muted)] md:grid-cols-3">
            <p>Solid hardwood construction with durable natural oils.</p>
            <p>Custom dimensions and finishes tailored to your interior.</p>
            <p>Transparent craftsmanship and made-to-order production.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

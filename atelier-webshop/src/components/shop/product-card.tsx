import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/shop";
import { formatCurrency } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_20px_50px_-40px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-35px_rgba(0,0,0,0.35)]">
      <Link href={`/shop/${product.category}/${product.slug}`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="space-y-3 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wood)]">
            {product.category}
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            {product.name}
          </h3>
          <p className="text-sm leading-6 text-[var(--color-muted)]">{product.subtitle}</p>
          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="font-semibold text-[var(--color-ink)]">
              From {formatCurrency(product.basePrice)}
            </span>
            <span className="text-[var(--color-muted)]">{product.leadTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

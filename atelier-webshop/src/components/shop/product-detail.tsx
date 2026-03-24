"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product, CustomizationOption } from "@/types/shop";
import { calculateProductPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { ImageGallery } from "@/components/shop/image-gallery";
import { OptionSelector } from "@/components/shop/option-selector";
import { Button } from "@/components/ui/button";

interface ProductDetailProps {
  product: Product;
  options: CustomizationOption[];
}

const buildLineKey = (productId: string, selectedMap: Record<string, string>) => {
  const sortedEntries = Object.entries(selectedMap).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB),
  );
  return `product:${productId}:${JSON.stringify(sortedEntries)}`;
};

export const ProductDetail = ({ product, options }: ProductDetailProps) => {
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>(
    product.defaultSelections,
  );
  const [comment, setComment] = useState("");
  const [addedMessageVisible, setAddedMessageVisible] = useState(false);
  const { addItem } = useCart();

  const { selections, dynamicPrice } = useMemo(
    () => calculateProductPrice(product.basePrice, options, selectedMap),
    [options, product.basePrice, selectedMap],
  );

  useEffect(() => {
    if (!addedMessageVisible) return;
    const timeout = window.setTimeout(() => setAddedMessageVisible(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [addedMessageVisible]);

  const highlightTone =
    selections.find((selection) =>
      ["material"].includes(selection.optionId),
    )?.swatchHex ?? "#d0beaa";

  const onSelectChoice = (optionId: string, choiceId: string) => {
    setSelectedMap((previous) => ({
      ...previous,
      [optionId]: choiceId,
    }));
  };

  const onAddToCart = () => {
    addItem({
      source: "product",
      lineKey: buildLineKey(product.id, selectedMap),
      name: product.name,
      category: product.category,
      image: product.images[0],
      unitPrice: dynamicPrice,
      selections,
      ...(comment && { comment }),
    });
    setAddedMessageVisible(true);
    setComment("");
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-12 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
            {product.description}
          </p>
        </div>
        <Link
          href={`/shop/${product.category}`}
          className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition hover:border-[var(--color-wood)]"
        >
          Back to category
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <ImageGallery images={product.images} alt={product.name} />

        <div className="space-y-8">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.4)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Dynamic price
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
              {formatCurrency(dynamicPrice)}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Base price {formatCurrency(product.basePrice)}. Lead time {product.leadTime}.
            </p>
          </div>

          <div className="space-y-6 rounded-3xl border border-black/5 bg-white p-6">
            {options.map((option) => (
              <OptionSelector
                key={option.id}
                option={option}
                selectedChoiceId={
                  selectedMap[option.id] || option.choices[0]?.id || ""
                }
                onChange={(choiceId) => onSelectChoice(option.id, choiceId)}
              />
            ))}
            
            <div className="border-t border-black/5 pt-6">
              <label className="block text-sm font-medium text-[var(--color-ink)]">
                Add a note about your customization
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="E.g., 'Please ensure precise measurements' or 'Preferred delivery date: April 15'"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--color-neutral-100)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-[var(--color-neutral-100)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Live preview cues
            </p>
            <div className="mt-4 rounded-2xl border border-white/80 bg-white p-4">
              <div className="flex items-center gap-3">
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
                  style={{ backgroundColor: highlightTone }}
                />
                <span className="text-sm text-[var(--color-ink)]">
                  Material and finish update in real-time while you configure.
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                {selections.map((selection) => (
                  <li key={selection.optionId} className="flex justify-between gap-4">
                    <span>{selection.optionLabel}</span>
                    <span className="font-medium text-[var(--color-ink)]">
                      {selection.choiceLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onAddToCart}>Add to cart</Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedMap(product.defaultSelections)}
            >
              Reset options
            </Button>
            {addedMessageVisible ? (
              <span className="text-sm font-medium text-[var(--color-wood-dark)]" role="status">
                Added to cart
              </span>
            ) : null}
          </div>

          {product.story ? (
            <p className="rounded-2xl border border-black/5 bg-white p-5 text-sm leading-7 text-[var(--color-muted)]">
              {product.story}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

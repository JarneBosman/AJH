"use client";

import Image from "next/image";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { useCart } from "@/context/cart-context";
import { formatCurrency, startCase } from "@/lib/format";
import { Button } from "@/components/ui/button";

const CartContent = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const shipping = items.length > 0 ? 45 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 text-center md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wood)]">
          Cart
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
          Your cart is empty
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">
          Add a handcrafted item from the shop or build one in the configurator.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/shop">
            <Button>Shop collection</Button>
          </Link>
          <Link href="/configurator">
            <Button variant="secondary">Open configurator</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:px-10">
      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-wood)]">
              Cart
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
              Review your items
            </h1>
          </div>
          <Button variant="ghost" onClick={clearCart}>
            Clear cart
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-3xl border border-black/5 bg-white p-4 sm:grid-cols-[130px_1fr]"
            >
              <div className="relative h-32 overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="130px"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                      {item.name}
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {startCase(item.category)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-[var(--color-ink)]">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>

                <ul className="grid gap-1 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                  {item.selections.map((selection) => (
                    <li key={`${item.id}-${selection.optionId}`} className="flex justify-between gap-2">
                      <span>{selection.optionLabel}</span>
                      <span className="font-medium text-[var(--color-ink)]">
                        {selection.choiceLabel}
                      </span>
                    </li>
                  ))}
                  {item.dimensions ? (
                    <li className="flex justify-between gap-2">
                      <span>Dimensions</span>
                      <span className="font-medium text-[var(--color-ink)]">
                        {item.dimensions.width} x {item.dimensions.depth} x {item.dimensions.height} cm
                      </span>
                    </li>
                  ) : null}
                </ul>

                {item.comment ? (
                  <div className="rounded-2xl border border-[var(--color-wood)]/20 bg-[var(--color-wood)]/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-wood)]">
                      Your note
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink)]">{item.comment}</p>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-1">
                  <div className="inline-flex items-center rounded-full border border-black/10">
                    <button
                      type="button"
                      className="px-3 py-1 text-sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      -
                    </button>
                    <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">Checkout summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <p className="flex justify-between text-[var(--color-muted)]">
            <span>Subtotal</span>
            <span className="text-[var(--color-ink)]">{formatCurrency(subtotal)}</span>
          </p>
          <p className="flex justify-between text-[var(--color-muted)]">
            <span>Shipping (mocked)</span>
            <span className="text-[var(--color-ink)]">{formatCurrency(shipping)}</span>
          </p>
          <p className="flex justify-between border-t border-black/5 pt-3 text-base font-semibold text-[var(--color-ink)]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </p>
        </div>

        <Button className="mt-6 w-full">Proceed to checkout</Button>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Checkout flow is intentionally basic and ready to be connected to a real
          payment/backend service.
        </p>
      </aside>
    </section>
  );
};

export default function CartPage() {
  return (
    <Providers>
      <CartContent />
    </Providers>
  );
}

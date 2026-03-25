"use client";

import { useMemo, useState } from "react";
import {
  baselineDimensions,
  configuratorBaseTypes,
  customizationOptionsByCategory,
} from "@/data/shop-data";
import {
  calculateConfiguratorPrice,
  calculateSelectionsDelta,
  resolveSelections,
} from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { OptionSelector } from "@/components/shop/option-selector";
import { useI18n } from "@/context/i18n-context";

const CONFIGURATOR_BASE_PRICE = 1390;

const configOptions = customizationOptionsByCategory.tables.filter((entry) =>
  ["material"].includes(entry.id),
);

const buildLineKey = (
  baseType: string,
  selectedMap: Record<string, string>,
  dimensions: { width: number; height: number; depth: number },
) => {
  const selectionPart = JSON.stringify(
    Object.entries(selectedMap).sort(([a], [b]) => a.localeCompare(b)),
  );
  return `config:${baseType}:${dimensions.width}x${dimensions.height}x${dimensions.depth}:${selectionPart}`;
};

export const CustomFurnitureConfigurator = () => {
  const { language, t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [baseType, setBaseType] = useState(configuratorBaseTypes[0].id);
  const [dimensions, setDimensions] = useState({ ...baselineDimensions });
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({
    material: "oak",
  });
  const [comment, setComment] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const { addItem } = useCart();

  const steps = [
    t.configStepBaseType,
    t.configStepDimensions,
    t.configStepMaterials,
    t.configStepReview,
  ] as const;

  const currentBaseType =
    configuratorBaseTypes.find((entry) => entry.id === baseType) ||
    configuratorBaseTypes[0];

  const selections = useMemo(
    () => resolveSelections(configOptions, selectedMap, language),
    [language, selectedMap],
  );

  const selectionsPrice = useMemo(
    () => calculateSelectionsDelta(selections),
    [selections],
  );

  // Keep pricing logic centralized so the same formula can be reused by a future backend service.
  const totalPrice = useMemo(
    () =>
      calculateConfiguratorPrice({
        basePrice: CONFIGURATOR_BASE_PRICE,
        baseTypeModifier: currentBaseType.priceModifier,
        selectionsPrice,
        dimensions,
        baseline: baselineDimensions,
      }),
    [currentBaseType.priceModifier, dimensions, selectionsPrice],
  );

  const woodTone =
    selections.find((selection) => selection.optionId === "material")?.swatchHex ||
    "#c9a97c";

  const nextStep = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const addConfiguredItem = () => {
    addItem({
      source: "configurator",
      lineKey: buildLineKey(baseType, selectedMap, dimensions),
      name: `${currentBaseType.label} (Custom)`,
      category: "custom",
      image:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1400&q=80",
      unitPrice: totalPrice,
      selections,
      dimensions,
      ...(comment && { comment }),
    });
    setStatusMessage(t.configAddedToCart);
    setComment("");
    window.setTimeout(() => setStatusMessage(""), 1800);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 md:px-10 md:pb-20 md:pt-12">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]">
          {t.configEyebrow}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl md:text-5xl">
          {t.configTitle}
        </h1>
        <p className="mt-4 text-pretty text-base leading-7 text-[var(--color-muted)]">
          {t.configDescription}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="space-y-4 rounded-3xl border border-black/5 bg-white p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`rounded-2xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] leading-tight sm:px-3 sm:text-xs sm:tracking-[0.12em] ${
                  index <= stepIndex
                    ? "bg-[var(--color-wood-dark)] text-white"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-muted)]"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[var(--color-neutral-100)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {t.configLiveEstimate}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
              {formatCurrency(totalPrice)}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              <li className="flex justify-between">
                <span>{t.configBaseModel}</span>
                <span>{formatCurrency(CONFIGURATOR_BASE_PRICE)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t.configBaseTypeAdjustment}</span>
                <span>{formatCurrency(currentBaseType.priceModifier)}</span>
              </li>
              <li className="flex justify-between">
                <span>{t.configOptionsAdjustment}</span>
                <span>{formatCurrency(selectionsPrice)}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {t.configVisualPreview}
            </p>
            <div className="mt-4 rounded-2xl border border-black/5 bg-[#f4f0ea] p-4">
              <div
                className="mx-auto rounded-xl border border-black/10 transition-all duration-300"
                style={{
                  width: `${Math.max(45, Math.min(95, (dimensions.width / 300) * 100))}%`,
                  height: `${Math.max(16, Math.min(30, (dimensions.depth / 220) * 26))}vh`,
                  maxHeight: "140px",
                  backgroundColor: woodTone,
                }}
              />
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              {dimensions.width}w x {dimensions.depth}d x {dimensions.height}h cm
            </p>
          </div>
        </aside>

        <div className="space-y-6 rounded-3xl border border-black/5 bg-white p-5 sm:p-6">
          {stepIndex === 0 ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {t.configSelectBaseType}
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {configuratorBaseTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBaseType(type.id)}
                    className={`rounded-2xl border px-4 py-5 text-left transition ${
                      baseType === type.id
                        ? "border-[var(--color-wood-dark)] bg-[var(--color-neutral-100)]"
                        : "border-black/10 hover:border-[var(--color-wood)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {type.label}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {type.priceModifier >= 0 ? "+" : ""}
                      {formatCurrency(type.priceModifier)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {stepIndex === 1 ? (
            <section className="space-y-5">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {t.configAdjustDimensions}
              </h2>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>Width ({dimensions.width} cm)</span>
                <input
                  type="range"
                  min={120}
                  max={300}
                  value={dimensions.width}
                  onChange={(event) =>
                    setDimensions((previous) => ({
                      ...previous,
                      width: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-[var(--color-wood-dark)]"
                />
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>Depth ({dimensions.depth} cm)</span>
                <input
                  type="range"
                  min={70}
                  max={140}
                  value={dimensions.depth}
                  onChange={(event) =>
                    setDimensions((previous) => ({
                      ...previous,
                      depth: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-[var(--color-wood-dark)]"
                />
              </label>
              <label className="block space-y-2 text-sm text-[var(--color-ink)]">
                <span>Height ({dimensions.height} cm)</span>
                <input
                  type="range"
                  min={68}
                  max={110}
                  value={dimensions.height}
                  onChange={(event) =>
                    setDimensions((previous) => ({
                      ...previous,
                      height: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-[var(--color-wood-dark)]"
                />
              </label>
            </section>
          ) : null}

          {stepIndex === 2 ? (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {t.configSelectMaterials}
              </h2>
              {configOptions.map((option) => (
                <OptionSelector
                  key={option.id}
                  option={option}
                  selectedChoiceId={selectedMap[option.id] || option.choices[0]?.id || ""}
                  onChange={(choiceId) =>
                    setSelectedMap((previous) => ({
                      ...previous,
                      [option.id]: choiceId,
                    }))
                  }
                />
              ))}
            </section>
          ) : null}

          {stepIndex === 3 ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {t.configReviewConfiguration}
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                <li className="flex justify-between">
                  <span>Base type</span>
                  <span className="font-medium text-[var(--color-ink)]">
                    {currentBaseType.label}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Dimensions</span>
                  <span className="font-medium text-[var(--color-ink)]">
                    {dimensions.width} x {dimensions.depth} x {dimensions.height} cm
                  </span>
                </li>
                {selections.map((selection) => (
                  <li key={selection.optionId} className="flex justify-between">
                    <span>{selection.optionLabel}</span>
                    <span className="font-medium text-[var(--color-ink)]">
                      {selection.choiceLabel}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-black/5 bg-[var(--color-neutral-100)] p-4">
                <label className="block text-sm font-medium text-[var(--color-ink)]">
                  {t.configAddNote}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.configNotePlaceholder}
                  className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                  rows={3}
                />
              </div>

              <Button onClick={addConfiguredItem} className="w-full sm:w-auto">{t.configAddCustomToCart}</Button>
              {statusMessage ? (
                <p className="text-sm font-medium text-[var(--color-wood-dark)]" role="status">
                  {statusMessage}
                </p>
              ) : null}
            </section>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={previousStep} disabled={stepIndex === 0}>
              {t.configPrevious}
            </Button>
            <Button onClick={nextStep} disabled={stepIndex === steps.length - 1}>
              {t.configNext}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

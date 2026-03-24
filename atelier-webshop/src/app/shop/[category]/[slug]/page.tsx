import { notFound } from "next/navigation";
import { getCustomizationOptions } from "@/data/shop-data";
import { Providers } from "@/components/providers";
import { ProductDetail } from "@/components/shop/product-detail";
import { getProductBySlugFromStore } from "@/lib/products-repository";
import { CustomizationOption } from "@/types/shop";

export const dynamic = "force-dynamic";

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, "");

const resolveChoiceId = (option: CustomizationOption, rawDefaultValue: string) => {
  const direct = option.choices.find((choice) => choice.id === rawDefaultValue);
  if (direct) {
    return direct.id;
  }

  const normalizedDefault = normalizeToken(rawDefaultValue);

  const byId = option.choices.find((choice) => normalizeToken(choice.id) === normalizedDefault);
  if (byId) {
    return byId.id;
  }

  const byLabel = option.choices.find(
    (choice) => normalizeToken(choice.label) === normalizedDefault,
  );
  if (byLabel) {
    return byLabel.id;
  }

  return rawDefaultValue;
};

const toOptionLabel = (optionId: string) =>
  optionId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getProductBySlugFromStore(slug);

  if (!product || product.category !== category) {
    notFound();
  }

  const baseOptions = getCustomizationOptions(product.category);
  const customOptions = product.customOptions ?? [];
  const customOptionIds = new Set(customOptions.map((option) => option.id));
  const mergedOptions = [
    ...baseOptions.filter((option) => !customOptionIds.has(option.id)),
    ...customOptions,
  ];

  const reconciledDefaultSelections = Object.fromEntries(
    Object.entries(product.defaultSelections).map(([optionId, value]) => {
      const option = mergedOptions.find((entry) => entry.id === optionId);
      const rawValue = String(value);

      if (!option) {
        return [optionId, rawValue];
      }

      return [optionId, resolveChoiceId(option, rawValue)];
    }),
  );

  const customOptionsFromDefaults: CustomizationOption[] = Object.entries(
    reconciledDefaultSelections,
  )
    .filter(([optionId]) => !mergedOptions.some((option) => option.id === optionId))
    .map(([optionId, value]) => ({
      id: optionId,
      label: toOptionLabel(optionId),
      helperText: "Default option configured in admin.",
      type: "dropdown",
      choices: [
        {
          id: String(value),
          label: String(value),
          priceModifier: 0,
        },
      ],
    }));

  const options = [...mergedOptions, ...customOptionsFromDefaults];
  const productWithResolvedDefaults = {
    ...product,
    defaultSelections: reconciledDefaultSelections,
  };

  return (
    <Providers>
      <ProductDetail product={productWithResolvedDefaults} options={options} />
    </Providers>
  );
}

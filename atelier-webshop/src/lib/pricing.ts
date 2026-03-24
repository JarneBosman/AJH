import {
  CustomizationChoice,
  CustomizationOption,
  DimensionSelection,
  ResolvedSelection,
} from "@/types/shop";

interface ConfiguratorPriceInput {
  basePrice: number;
  baseTypeModifier: number;
  selectionsPrice: number;
  dimensions: DimensionSelection;
  baseline: DimensionSelection;
}

const findChoice = (
  options: CustomizationOption[],
  optionId: string,
  choiceId: string,
): { option: CustomizationOption; choice: CustomizationChoice } | undefined => {
  const option = options.find((entry) => entry.id === optionId);
  if (!option) return undefined;
  const choice = option.choices.find((entry) => entry.id === choiceId);
  if (!choice) return undefined;

  return { option, choice };
};

export const resolveSelections = (
  options: CustomizationOption[],
  selectedMap: Record<string, string>,
): ResolvedSelection[] => {
  // Ensure every option has a valid choice by falling back to the first available choice.
  return options.reduce<ResolvedSelection[]>((accumulator, option) => {
      const desiredChoiceId = selectedMap[option.id] ?? option.choices[0]?.id;
      const match = desiredChoiceId
        ? findChoice(options, option.id, desiredChoiceId)
        : undefined;

      if (!match) {
        return accumulator;
      }

      accumulator.push({
        optionId: option.id,
        optionLabel: option.label,
        choiceId: match.choice.id,
        choiceLabel: match.choice.label,
        priceModifier: match.choice.priceModifier,
        swatchHex: match.choice.swatchHex,
      });

      return accumulator;
    }, []);
};

export const calculateSelectionsDelta = (selections: ResolvedSelection[]) =>
  selections.reduce((sum, selection) => sum + selection.priceModifier, 0);

export const calculateProductPrice = (
  basePrice: number,
  options: CustomizationOption[],
  selectedMap: Record<string, string>,
) => {
  const selections = resolveSelections(options, selectedMap);
  const dynamicPrice = basePrice + calculateSelectionsDelta(selections);

  return {
    selections,
    dynamicPrice,
  };
};

const calculateDimensionDelta = (
  dimensions: DimensionSelection,
  baseline: DimensionSelection,
) => {
  const widthDelta = dimensions.width - baseline.width;
  const depthDelta = dimensions.depth - baseline.depth;
  const heightDelta = dimensions.height - baseline.height;

  // Weighted linear pricing keeps calculations transparent and easy to adapt for backend logic.
  return widthDelta * 4 + depthDelta * 3 + heightDelta * 2;
};

export const calculateConfiguratorPrice = ({
  basePrice,
  baseTypeModifier,
  selectionsPrice,
  dimensions,
  baseline,
}: ConfiguratorPriceInput) => {
  const dimensionDelta = calculateDimensionDelta(dimensions, baseline);
  const total = basePrice + baseTypeModifier + selectionsPrice + dimensionDelta;
  return Math.max(240, Math.round(total));
};

export type CategorySlug = string;
export type CartCategory = CategorySlug | "custom";

export type OptionInputType = "dropdown" | "toggle" | "swatch";

export interface CustomizationChoice {
  id: string;
  label: string;
  description?: string;
  priceModifier: number;
  swatchHex?: string;
}

export interface CustomizationOption {
  id: string;
  label: string;
  helperText?: string;
  type: OptionInputType;
  choices: CustomizationChoice[];
}

export interface ProductCategory {
  slug: CategorySlug;
  name: string;
  description: string;
  heroImage: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: CategorySlug;
  basePrice: number;
  leadTime: string;
  images: string[];
  featured?: boolean;
  story?: string;
  defaultSelections: Record<string, string>;
  customOptions?: CustomizationOption[];
}

export interface ResolvedSelection {
  optionId: string;
  optionLabel: string;
  choiceId: string;
  choiceLabel: string;
  priceModifier: number;
  swatchHex?: string;
}

export interface DimensionSelection {
  width: number;
  height: number;
  depth: number;
}

export interface CartItem {
  id: string;
  lineKey: string;
  source: "product" | "configurator";
  name: string;
  category: CartCategory;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selections: ResolvedSelection[];
  dimensions?: DimensionSelection;
  comment?: string;
}

import { Language } from "@/lib/i18n";
import { Product, ProductCategory } from "@/types/shop";

const pickLocalized = (english: string, dutch: string | undefined, language: Language) =>
  language === "nl" && dutch ? dutch : english;

export const localizeCategory = (category: ProductCategory, language: Language): ProductCategory => ({
  ...category,
  name: pickLocalized(category.name, category.nameNl, language),
  description: pickLocalized(category.description, category.descriptionNl, language),
});

export const localizeProduct = (product: Product, language: Language): Product => ({
  ...product,
  name: pickLocalized(product.name, product.nameNl, language),
  subtitle: pickLocalized(product.subtitle, product.subtitleNl, language),
  description: pickLocalized(product.description, product.descriptionNl, language),
  leadTime: pickLocalized(product.leadTime, product.leadTimeNl, language),
  story: pickLocalized(product.story ?? "", product.storyNl, language) || undefined,
});

import { products as fallbackProducts } from "@/data/shop-data";
import { CategorySlug, CustomizationOption, OptionInputType, Product } from "@/types/shop";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  name_nl: string | null;
  subtitle: string;
  subtitle_nl: string | null;
  description: string;
  description_nl: string | null;
  category: string;
  base_price: number;
  lead_time: string;
  lead_time_nl: string | null;
  images: unknown;
  featured: boolean;
  story: string | null;
  story_nl: string | null;
  default_selections: unknown;
  custom_options: unknown;
}

const validOptionTypes: OptionInputType[] = ["dropdown", "toggle", "swatch"];

const parseCustomOptions = (input: unknown): CustomizationOption[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const parsedOptions = input
    .map((entry): CustomizationOption | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const type = typeof record.type === "string" ? record.type : "dropdown";

      if (!validOptionTypes.includes(type as OptionInputType)) {
        return null;
      }

      const id = typeof record.id === "string" ? record.id.trim() : "";
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const labelNl = typeof record.labelNl === "string" ? record.labelNl.trim() : "";

      if (!id || !label || !Array.isArray(record.choices)) {
        return null;
      }

      const choices = record.choices
        .map((choiceEntry) => {
          if (!choiceEntry || typeof choiceEntry !== "object") {
            return null;
          }

          const choiceRecord = choiceEntry as Record<string, unknown>;
          const choiceId = typeof choiceRecord.id === "string" ? choiceRecord.id.trim() : "";
          const choiceLabel =
            typeof choiceRecord.label === "string" ? choiceRecord.label.trim() : "";
          const choiceLabelNl =
            typeof choiceRecord.labelNl === "string" ? choiceRecord.labelNl.trim() : "";

          if (!choiceId || !choiceLabel) {
            return null;
          }

          return {
            id: choiceId,
            label: choiceLabel,
            ...(choiceLabelNl ? { labelNl: choiceLabelNl } : {}),
            priceModifier: Number(choiceRecord.priceModifier ?? 0),
            ...(typeof choiceRecord.swatchHex === "string" && choiceRecord.swatchHex
              ? { swatchHex: choiceRecord.swatchHex }
              : {}),
          };
        })
        .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice));

      if (choices.length === 0) {
        return null;
      }

      return {
        id,
        label,
        ...(labelNl ? { labelNl } : {}),
        helperText:
          typeof record.helperText === "string" && record.helperText
            ? record.helperText
            : undefined,
        helperTextNl:
          typeof record.helperTextNl === "string" && record.helperTextNl
            ? record.helperTextNl
            : undefined,
        type: type as OptionInputType,
        choices,
      };
    })
    .filter((option): option is CustomizationOption => option !== null);

  return parsedOptions;
};

const mapRowToProduct = (row: ProductRow): Product => {
  const category = row.category || "tables";

  const images = Array.isArray(row.images)
    ? row.images.filter((entry): entry is string => typeof entry === "string")
    : [];

  const defaultSelections =
    row.default_selections && typeof row.default_selections === "object"
      ? (row.default_selections as Record<string, string>)
      : {};

  const customOptions = parseCustomOptions(row.custom_options);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ...(row.name_nl ? { nameNl: row.name_nl } : {}),
    subtitle: row.subtitle,
    ...(row.subtitle_nl ? { subtitleNl: row.subtitle_nl } : {}),
    description: row.description,
    ...(row.description_nl ? { descriptionNl: row.description_nl } : {}),
    category,
    basePrice: Number(row.base_price),
    leadTime: row.lead_time,
    ...(row.lead_time_nl ? { leadTimeNl: row.lead_time_nl } : {}),
    images,
    featured: row.featured,
    story: row.story ?? undefined,
    ...(row.story_nl ? { storyNl: row.story_nl } : {}),
    defaultSelections,
    customOptions,
  };
};

const getSupabaseProducts = async (): Promise<Product[] | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, name_nl, subtitle, subtitle_nl, description, description_nl, category, base_price, lead_time, lead_time_nl, images, featured, story, story_nl, default_selections, custom_options",
    )
    .order("created_at", { ascending: true });

  if (error || !data) {
    return null;
  }

  return (data as ProductRow[]).map(mapRowToProduct);
};

export const getAllProducts = async (): Promise<Product[]> => {
  const supabaseProducts = await getSupabaseProducts();
  if (supabaseProducts && supabaseProducts.length > 0) {
    return supabaseProducts;
  }

  return fallbackProducts;
};

export const getProductsByCategoryFromStore = async (category: CategorySlug) => {
  const allProducts = await getAllProducts();
  return allProducts.filter((product) => product.category === category);
};

export const getProductBySlugFromStore = async (slug: string) => {
  const allProducts = await getAllProducts();
  return allProducts.find((product) => product.slug === slug);
};

export const getFeaturedProducts = async () => {
  const allProducts = await getAllProducts();
  return allProducts.filter((product) => product.featured).slice(0, 3);
};

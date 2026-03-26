import { Language } from "@/lib/i18n";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type CmsNavigationLocation = "header" | "footer";

export interface CmsLinkItem {
  label: string;
  labelNl?: string;
  href: string;
  external?: boolean;
}

export interface CmsHomeCustomBlock {
  id: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  alt?: string;
  backgroundColor?: string;
  backgroundShape?: "rounded-square" | "pill";
}

export interface CmsHomeContent {
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroPrimaryCta?: string;
  heroSecondaryCta?: string;
  heroImage?: string;
  featuredEyebrow?: string;
  featuredTitle?: string;
  featuredDescription?: string;
  categoriesEyebrow?: string;
  categoriesTitle?: string;
  categoriesDescription?: string;
  storyEyebrow?: string;
  storyTitle?: string;
  storyDescription?: string;
  storyPointOne?: string;
  storyPointTwo?: string;
  storyPointThree?: string;
  customBlocks?: CmsHomeCustomBlock[];
}

export interface CmsGenericPageContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export interface CmsSeoContent {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

interface CmsPageRow {
  slug: string;
  title: string;
  draft_content: unknown;
  published_content: unknown;
  draft_seo: unknown;
  published_seo: unknown;
  published_at: string | null;
}

interface CmsNavigationRow {
  location: CmsNavigationLocation;
  draft_items: unknown;
  published_items: unknown;
}

const getLocalizedCmsText = (
  record: Record<string, unknown>,
  key: string,
  language: Language,
  fallbackToBase = true,
): string | undefined => {
  const localizedKey = `${key}Nl`;
  const localizedValue = language === "nl" ? record[localizedKey] : undefined;
  const baseValue = record[key];

  if (typeof localizedValue === "string" && localizedValue.trim()) {
    return localizedValue.trim();
  }

  if (fallbackToBase && typeof baseValue === "string" && baseValue.trim()) {
    return baseValue.trim();
  }

  return undefined;
};

const parseHomeContent = (input: unknown, language: Language): CmsHomeContent | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;
  const output: CmsHomeContent = {};

  for (const key of [
    "heroEyebrow",
    "heroTitle",
    "heroDescription",
    "heroPrimaryCta",
    "heroSecondaryCta",
    "heroImage",
    "featuredEyebrow",
    "featuredTitle",
    "featuredDescription",
    "categoriesEyebrow",
    "categoriesTitle",
    "categoriesDescription",
    "storyEyebrow",
    "storyTitle",
    "storyDescription",
    "storyPointOne",
    "storyPointTwo",
    "storyPointThree",
  ] as const) {
    const value = getLocalizedCmsText(record, key, language, language !== "nl");
    if (value) {
      output[key] = value;
    }
  }

  if (typeof record.heroImage === "string" && record.heroImage.trim()) {
    output.heroImage = record.heroImage.trim();
  }

  if (Array.isArray(record.customBlocks)) {
    const customBlocks = record.customBlocks
      .map((entry, index): CmsHomeCustomBlock | null => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const block = entry as Record<string, unknown>;
        const type = block.type === "image" ? "image" : block.type === "text" ? "text" : null;
        if (!type) {
          return null;
        }

        const id =
          typeof block.id === "string" && block.id.trim().length > 0
            ? block.id.trim()
            : `custom-block-${index + 1}`;

        if (type === "text") {
          const text = getLocalizedCmsText(block, "text", language, language !== "nl");
          if (!text) {
            return null;
          }

          const backgroundColor =
            typeof block.backgroundColor === "string" && block.backgroundColor.trim()
              ? block.backgroundColor.trim()
              : undefined;
          const backgroundShape =
            block.backgroundShape === "pill"
              ? "pill"
              : block.backgroundShape === "rounded-square"
                ? "rounded-square"
                : undefined;

          return {
            id,
            type,
            text,
            ...(backgroundColor ? { backgroundColor } : {}),
            ...(backgroundShape ? { backgroundShape } : {}),
          };
        }

        const imageUrl = typeof block.imageUrl === "string" ? block.imageUrl.trim() : "";
        if (!imageUrl) {
          return null;
        }

        const alt = getLocalizedCmsText(block, "alt", language, true);
        const backgroundColor =
          typeof block.backgroundColor === "string" && block.backgroundColor.trim()
            ? block.backgroundColor.trim()
            : undefined;
        const backgroundShape =
          block.backgroundShape === "pill"
            ? "pill"
            : block.backgroundShape === "rounded-square"
              ? "rounded-square"
              : undefined;

        return {
          id,
          type,
          imageUrl,
          ...(alt ? { alt } : {}),
          ...(backgroundColor ? { backgroundColor } : {}),
          ...(backgroundShape ? { backgroundShape } : {}),
        };
      })
      .filter((entry): entry is CmsHomeCustomBlock => entry !== null);

    if (customBlocks.length > 0) {
      output.customBlocks = customBlocks;
    }
  }

  return Object.keys(output).length > 0 ? output : null;
};

const parseLinkItems = (input: unknown): CmsLinkItem[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry): CmsLinkItem | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const labelNl = typeof record.labelNl === "string" ? record.labelNl.trim() : "";
      const href = typeof record.href === "string" ? record.href.trim() : "";

      if (!label || !href) {
        return null;
      }

      return {
        label,
        ...(labelNl ? { labelNl } : {}),
        href,
        ...(typeof record.external === "boolean" ? { external: record.external } : {}),
      };
    })
    .filter((entry): entry is CmsLinkItem => entry !== null);
};

const parseGenericPageContent = (
  input: unknown,
  language: Language,
): CmsGenericPageContent | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;
  const output: CmsGenericPageContent = {};

  for (const key of ["eyebrow", "title", "description", "primaryCta", "secondaryCta"] as const) {
    const value = getLocalizedCmsText(record, key, language, language !== "nl");
    if (value) {
      output[key] = value;
    }
  }

  return Object.keys(output).length > 0 ? output : null;
};

const parseSeoContent = (input: unknown, language: Language): CmsSeoContent | null => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;
  const output: CmsSeoContent = {};

  const title = getLocalizedCmsText(record, "metaTitle", language, language !== "nl");
  const description = getLocalizedCmsText(record, "metaDescription", language, language !== "nl");

  if (title) {
    output.metaTitle = title;
  }

  if (description) {
    output.metaDescription = description;
  }

  if (typeof record.ogImage === "string" && record.ogImage.trim()) {
    output.ogImage = record.ogImage.trim();
  }

  return Object.keys(output).length > 0 ? output : null;
};

const pickLocalized = (language: Language, english: string, dutch?: string) =>
  language === "nl" && dutch ? dutch : english;

export const getPublishedCmsHomeContentFromStore = async (
  language: Language = "en",
): Promise<CmsHomeContent | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, published_content")
    .eq("slug", "home")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return parseHomeContent((data as Pick<CmsPageRow, "published_content">).published_content, language);
};

export const getPublishedCmsPageContentFromStore = async (
  slug: string,
  language: Language = "en",
): Promise<CmsGenericPageContent | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, published_content")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return parseGenericPageContent((data as Pick<CmsPageRow, "published_content">).published_content, language);
};

export const getPublishedSeoBySlug = async (
  slug: string,
  language: Language = "en",
): Promise<CmsSeoContent | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, published_seo")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return parseSeoContent((data as Pick<CmsPageRow, "published_seo">).published_seo, language);
};

export const getPublishedNavigationFromStore = async (
  location: CmsNavigationLocation,
  language: Language,
): Promise<Array<{ href: string; label: string; external?: boolean }>> => {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("cms_navigation")
    .select("location, published_items")
    .eq("location", location)
    .maybeSingle();

  if (error || !data) {
    return [];
  }

  const items = parseLinkItems((data as Pick<CmsNavigationRow, "published_items">).published_items);

  return items.map((item) => ({
    href: item.href,
    label: pickLocalized(language, item.label, item.labelNl),
    ...(item.external ? { external: true } : {}),
  }));
};

export const getCmsDraftPageBySlug = async (slug: string): Promise<CmsPageRow | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("cms_pages")
    .select("slug, title, draft_content, published_content, draft_seo, published_seo, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CmsPageRow;
};

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { OptionInputType } from "@/types/shop";

interface ProductRow {
  id: string;
  name: string;
  name_nl: string | null;
  slug: string;
  category: string;
  base_price: number;
  subtitle: string;
  subtitle_nl: string | null;
  description: string;
  description_nl: string | null;
  lead_time: string;
  lead_time_nl: string | null;
  images: unknown;
  featured: boolean;
  story: string | null;
  story_nl: string | null;
  default_selections: unknown;
  custom_options: unknown;
}

type ProductCategory = string;

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_nl: string | null;
  description: string;
  description_nl: string | null;
  hero_image: string;
}

interface NewCategoryState {
  name: string;
  nameNl: string;
  slug: string;
  description: string;
  descriptionNl: string;
  heroImage: string;
}

type LayoutMode = "compact" | "balanced" | "spacious";
type ContainerWidthMode = "narrow" | "standard" | "wide";
type SectionSpacingMode = "tight" | "balanced" | "airy";
type HeroLayoutMode = "split" | "centered" | "image-first";
type FontPreset = "manrope" | "jakarta" | "system" | "serif";

interface AppearanceSettingsState {
  brandName: string;
  logoUrl: string;
  logoColor: string;
  colorBg: string;
  colorText: string;
  colorInk: string;
  colorMuted: string;
  colorNeutral100: string;
  colorNeutral200: string;
  colorNeutral300: string;
  colorWood: string;
  colorWoodDark: string;
  colorButtonBg: string;
  colorButtonBgHover: string;
  colorButtonText: string;
  layoutMode: LayoutMode;
  containerWidth: ContainerWidthMode;
  sectionSpacing: SectionSpacingMode;
  heroLayout: HeroLayoutMode;
  fontBody: FontPreset;
  fontHeading: FontPreset;
  buttonRadius: string;
}

interface AppearanceScheme {
  id: string;
  name: string;
  settings: AppearanceSettingsState;
}

interface CmsSeoState {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

interface CmsHomeDraftState {
  heroEyebrow: string;
  heroEyebrowNl: string;
  heroTitle: string;
  heroTitleNl: string;
  heroDescription: string;
  heroDescriptionNl: string;
  heroPrimaryCta: string;
  heroPrimaryCtaNl: string;
  heroSecondaryCta: string;
  heroSecondaryCtaNl: string;
  heroImage: string;
  featuredEyebrow: string;
  featuredEyebrowNl: string;
  featuredTitle: string;
  featuredTitleNl: string;
  featuredDescription: string;
  featuredDescriptionNl: string;
  categoriesEyebrow: string;
  categoriesEyebrowNl: string;
  categoriesTitle: string;
  categoriesTitleNl: string;
  categoriesDescription: string;
  categoriesDescriptionNl: string;
  storyEyebrow: string;
  storyEyebrowNl: string;
  storyTitle: string;
  storyTitleNl: string;
  storyDescription: string;
  storyDescriptionNl: string;
  storyPointOne: string;
  storyPointOneNl: string;
  storyPointTwo: string;
  storyPointTwoNl: string;
  storyPointThree: string;
  storyPointThreeNl: string;
  hiddenEditableIds: string[];
  customBlocks: CmsHomeContentBlockState[];
}

type CmsHomeContentBlockType = "text" | "image";
type CmsHomeContentBlockShape = "rounded-square" | "pill";

interface CmsHomeContentBlockState {
  id: string;
  type: CmsHomeContentBlockType;
  text: string;
  textNl: string;
  imageUrl: string;
  alt: string;
  altNl: string;
  backgroundColor: string;
  backgroundShape: CmsHomeContentBlockShape;
}

interface CmsLinkRowState {
  id: string;
  label: string;
  labelNl: string;
  href: string;
  external: boolean;
}

type CmsPageSlug = "home" | "shop" | "configurator" | "cart";

type CmsDraftSection = "home" | Exclude<CmsPageSlug, "home">;

interface CmsEditableBinding {
  id: string;
  route: string;
  label: string;
  section: CmsDraftSection;
  keyEn: string;
  keyNl?: string;
  kind: "text" | "image";
}

interface CmsNavigationBinding {
  location: "header" | "footer";
  index: number;
  label: string;
}

interface CmsGenericDraftState {
  eyebrow: string;
  eyebrowNl: string;
  title: string;
  titleNl: string;
  description: string;
  descriptionNl: string;
  primaryCta: string;
  primaryCtaNl: string;
  secondaryCta: string;
  secondaryCtaNl: string;
}

interface CmsMediaAssetRow {
  id: string;
  bucket: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt: string | null;
  alt_nl: string | null;
  created_at: string;
}

interface CmsDraftSnapshot {
  homeDraft: CmsHomeDraftState;
  seoDraft: CmsSeoState;
  pageDrafts: Record<Exclude<CmsPageSlug, "home">, CmsGenericDraftState>;
  pageSeoDrafts: Record<Exclude<CmsPageSlug, "home">, CmsSeoState>;
  headerLinks: CmsLinkRowState[];
  footerLinks: CmsLinkRowState[];
}

interface PreviewEditableCapabilities {
  text: boolean;
  color: boolean;
  background: boolean;
  shape: boolean;
  image: boolean;
  location: boolean;
}

interface PreviewEditableValues {
  text: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  backgroundColor: string;
  borderRadius: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreviewEditHistoryEntry {
  id: string;
  before: PreviewEditableValues;
  after: PreviewEditableValues;
  hiddenEditableIdsBefore?: string[];
  hiddenEditableIdsAfter?: string[];
  customBlocksBefore?: CmsHomeContentBlockState[];
  customBlocksAfter?: CmsHomeContentBlockState[];
  customBlockLayoutAfter?: Record<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  >;
  selectedEditableIdBefore?: string;
  selectedEditableIdAfter?: string;
}

interface FullscreenInspectorPosition {
  left: number;
  top: number;
}

interface FullscreenInspectorSize {
  width: number;
  height: number;
}

interface PendingDeleteAction {
  mode: "custom-block" | "home-binding" | "clear-text";
  editableId: string;
  label: string;
  blockId?: string;
}

interface NewProductState {
  name: string;
  nameNl: string;
  slug: string;
  category: ProductCategory;
  basePrice: string;
  subtitle: string;
  subtitleNl: string;
  description: string;
  descriptionNl: string;
  leadTime: string;
  leadTimeNl: string;
  images: string;
  featured: boolean;
  story: string;
  storyNl: string;
}

const createInitialCategoryState = (): NewCategoryState => ({
  name: "",
  nameNl: "",
  slug: "",
  description: "",
  descriptionNl: "",
  heroImage: "",
});

const createInitialAppearanceState = (): AppearanceSettingsState => ({
  brandName: "Atelier Nord",
  logoUrl: "",
  logoColor: "#2b231d",
  colorBg: "#fbfaf8",
  colorText: "#2b231d",
  colorInk: "#2b231d",
  colorMuted: "#6f655c",
  colorNeutral100: "#f2ede7",
  colorNeutral200: "#e8e1d8",
  colorNeutral300: "#d7cabc",
  colorWood: "#b88a5b",
  colorWoodDark: "#7f5534",
  colorButtonBg: "#7f5534",
  colorButtonBgHover: "#b88a5b",
  colorButtonText: "#ffffff",
  layoutMode: "balanced",
  containerWidth: "standard",
  sectionSpacing: "balanced",
  heroLayout: "split",
  fontBody: "manrope",
  fontHeading: "jakarta",
  buttonRadius: "9999px",
});

const createInitialCmsSeoState = (): CmsSeoState => ({
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
});

const createInitialCmsHomeDraftState = (): CmsHomeDraftState => ({
  heroEyebrow: "",
  heroEyebrowNl: "",
  heroTitle: "",
  heroTitleNl: "",
  heroDescription: "",
  heroDescriptionNl: "",
  heroPrimaryCta: "",
  heroPrimaryCtaNl: "",
  heroSecondaryCta: "",
  heroSecondaryCtaNl: "",
  heroImage: "",
  featuredEyebrow: "",
  featuredEyebrowNl: "",
  featuredTitle: "",
  featuredTitleNl: "",
  featuredDescription: "",
  featuredDescriptionNl: "",
  categoriesEyebrow: "",
  categoriesEyebrowNl: "",
  categoriesTitle: "",
  categoriesTitleNl: "",
  categoriesDescription: "",
  categoriesDescriptionNl: "",
  storyEyebrow: "",
  storyEyebrowNl: "",
  storyTitle: "",
  storyTitleNl: "",
  storyDescription: "",
  storyDescriptionNl: "",
  storyPointOne: "",
  storyPointOneNl: "",
  storyPointTwo: "",
  storyPointTwoNl: "",
  storyPointThree: "",
  storyPointThreeNl: "",
  hiddenEditableIds: [],
  customBlocks: [],
});

const createCmsHomeContentBlock = (
  type: CmsHomeContentBlockType,
): CmsHomeContentBlockState => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  text: type === "text" ? "New text block" : "",
  textNl: type === "text" ? "Nieuw tekstblok" : "",
  imageUrl: "",
  alt: "",
  altNl: "",
  backgroundColor: "#ffffff",
  backgroundShape: "rounded-square",
});

const createInitialCmsGenericDraftState = (): CmsGenericDraftState => ({
  eyebrow: "",
  eyebrowNl: "",
  title: "",
  titleNl: "",
  description: "",
  descriptionNl: "",
  primaryCta: "",
  primaryCtaNl: "",
  secondaryCta: "",
  secondaryCtaNl: "",
});

const createInitialPreviewEditableValues = (): PreviewEditableValues => ({
  text: "",
  color: "",
  fontFamily: "",
  fontSize: "",
  fontWeight: "",
  backgroundColor: "",
  borderRadius: "",
  imageUrl: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

interface DefaultSelectionRow {
  id: string;
  optionId: string;
  choiceId: string;
}

interface CustomOptionChoiceForm {
  formId: string;
  id: string;
  label: string;
  labelNl: string;
  priceModifier: string;
  swatchHex: string;
}

interface CustomOptionForm {
  formId: string;
  id: string;
  label: string;
  labelNl: string;
  helperText: string;
  helperTextNl: string;
  type: OptionInputType;
  choices: CustomOptionChoiceForm[];
}

const defaultStandardOptionIds = ["material", "size"];
const standardOptionStorageKey = "atelier.admin.defaultSelectionStandardOptionIds";
const appearanceSchemesStorageKey = "atelier.admin.appearanceSchemes";
const productImageBucket = "product-images";
const appearanceUndoHistoryLimit = 30;
const previewEditHistoryLimit = 200;
const cmsHomeSlug = "home";
const cmsMediaBucket = "cms-media";
const cmsManagedPageSlugs: CmsPageSlug[] = ["home", "shop", "configurator", "cart"];
const cmsAdditionalPageSlugs: Array<Exclude<CmsPageSlug, "home">> = [
  "shop",
  "configurator",
  "cart",
];

const cmsEditableBindings: CmsEditableBinding[] = [
  { id: "home.heroEyebrow", route: "/", label: "Home Hero Eyebrow", section: "home", keyEn: "heroEyebrow", keyNl: "heroEyebrowNl", kind: "text" },
  { id: "home.heroTitle", route: "/", label: "Home Hero Title", section: "home", keyEn: "heroTitle", keyNl: "heroTitleNl", kind: "text" },
  { id: "home.heroDescription", route: "/", label: "Home Hero Description", section: "home", keyEn: "heroDescription", keyNl: "heroDescriptionNl", kind: "text" },
  { id: "home.heroPrimaryCta", route: "/", label: "Home Hero Primary CTA", section: "home", keyEn: "heroPrimaryCta", keyNl: "heroPrimaryCtaNl", kind: "text" },
  { id: "home.heroSecondaryCta", route: "/", label: "Home Hero Secondary CTA", section: "home", keyEn: "heroSecondaryCta", keyNl: "heroSecondaryCtaNl", kind: "text" },
  { id: "home.heroMedia", route: "/", label: "Home Hero Image", section: "home", keyEn: "heroImage", kind: "image" },
  { id: "home.featuredEyebrow", route: "/", label: "Home Featured Eyebrow", section: "home", keyEn: "featuredEyebrow", keyNl: "featuredEyebrowNl", kind: "text" },
  { id: "home.featuredTitle", route: "/", label: "Home Featured Title", section: "home", keyEn: "featuredTitle", keyNl: "featuredTitleNl", kind: "text" },
  { id: "home.featuredDescription", route: "/", label: "Home Featured Description", section: "home", keyEn: "featuredDescription", keyNl: "featuredDescriptionNl", kind: "text" },
  { id: "home.categoriesEyebrow", route: "/", label: "Home Categories Eyebrow", section: "home", keyEn: "categoriesEyebrow", keyNl: "categoriesEyebrowNl", kind: "text" },
  { id: "home.categoriesTitle", route: "/", label: "Home Categories Title", section: "home", keyEn: "categoriesTitle", keyNl: "categoriesTitleNl", kind: "text" },
  { id: "home.categoriesDescription", route: "/", label: "Home Categories Description", section: "home", keyEn: "categoriesDescription", keyNl: "categoriesDescriptionNl", kind: "text" },
  { id: "home.storyEyebrow", route: "/", label: "Home Story Eyebrow", section: "home", keyEn: "storyEyebrow", keyNl: "storyEyebrowNl", kind: "text" },
  { id: "home.storyTitle", route: "/", label: "Home Story Title", section: "home", keyEn: "storyTitle", keyNl: "storyTitleNl", kind: "text" },
  { id: "home.storyDescription", route: "/", label: "Home Story Description", section: "home", keyEn: "storyDescription", keyNl: "storyDescriptionNl", kind: "text" },
  { id: "home.storyPointOne", route: "/", label: "Home Story Point One", section: "home", keyEn: "storyPointOne", keyNl: "storyPointOneNl", kind: "text" },
  { id: "home.storyPointTwo", route: "/", label: "Home Story Point Two", section: "home", keyEn: "storyPointTwo", keyNl: "storyPointTwoNl", kind: "text" },
  { id: "home.storyPointThree", route: "/", label: "Home Story Point Three", section: "home", keyEn: "storyPointThree", keyNl: "storyPointThreeNl", kind: "text" },
  { id: "shop.eyebrow", route: "/shop", label: "Shop Eyebrow", section: "shop", keyEn: "eyebrow", keyNl: "eyebrowNl", kind: "text" },
  { id: "shop.title", route: "/shop", label: "Shop Title", section: "shop", keyEn: "title", keyNl: "titleNl", kind: "text" },
  { id: "shop.description", route: "/shop", label: "Shop Description", section: "shop", keyEn: "description", keyNl: "descriptionNl", kind: "text" },
  { id: "configurator.eyebrow", route: "/configurator", label: "Configurator Eyebrow", section: "configurator", keyEn: "eyebrow", keyNl: "eyebrowNl", kind: "text" },
  { id: "configurator.title", route: "/configurator", label: "Configurator Title", section: "configurator", keyEn: "title", keyNl: "titleNl", kind: "text" },
  { id: "configurator.description", route: "/configurator", label: "Configurator Description", section: "configurator", keyEn: "description", keyNl: "descriptionNl", kind: "text" },
  { id: "cart.eyebrow", route: "/cart", label: "Cart Eyebrow", section: "cart", keyEn: "eyebrow", keyNl: "eyebrowNl", kind: "text" },
  { id: "cart.title", route: "/cart", label: "Cart Title", section: "cart", keyEn: "title", keyNl: "titleNl", kind: "text" },
  { id: "cart.description", route: "/cart", label: "Cart Description", section: "cart", keyEn: "description", keyNl: "descriptionNl", kind: "text" },
  { id: "cart.primaryCta", route: "/cart", label: "Cart Primary CTA", section: "cart", keyEn: "primaryCta", keyNl: "primaryCtaNl", kind: "text" },
  { id: "cart.secondaryCta", route: "/cart", label: "Cart Secondary CTA", section: "cart", keyEn: "secondaryCta", keyNl: "secondaryCtaNl", kind: "text" },
];

const createCmsLinkRow = (): CmsLinkRowState => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  label: "",
  labelNl: "",
  href: "",
  external: false,
});

const asText = (value: unknown) => (typeof value === "string" ? value : "");

const parseNavigationEditableId = (id: string): CmsNavigationBinding | null => {
  const match = id.match(/^nav\.(header|footer)\.(\d+)\.label$/);
  if (!match) {
    return null;
  }

  return {
    location: match[1] as "header" | "footer",
    index: Number(match[2]),
    label: `${match[1] === "header" ? "Header" : "Footer"} Link ${Number(match[2]) + 1}`,
  };
};

const parseCustomHomeBlockEditableId = (id: string): string | null => {
  const match = id.match(/^home\.customBlock\.(.+)$/);
  return match ? match[1] : null;
};

const parseCmsHomeDraft = (value: unknown): CmsHomeDraftState => {
  const defaults = createInitialCmsHomeDraftState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;
  const hiddenEditableIds = Array.isArray(source.hiddenEditableIds)
    ? Array.from(
        new Set(
          source.hiddenEditableIds
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => entry.trim())
            .filter(Boolean),
        ),
      )
    : [];
  const rawBlocks = Array.isArray(source.customBlocks) ? source.customBlocks : [];
  const customBlocks = rawBlocks
    .map((entry): CmsHomeContentBlockState | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const block = entry as Record<string, unknown>;
      const type = block.type === "image" ? "image" : block.type === "text" ? "text" : null;
      if (!type) {
        return null;
      }

      return {
        id: asText(block.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        text: asText(block.text),
        textNl: asText(block.textNl),
        imageUrl: asText(block.imageUrl),
        alt: asText(block.alt),
        altNl: asText(block.altNl),
        backgroundColor: asText(block.backgroundColor) || "#ffffff",
        backgroundShape: block.backgroundShape === "pill" ? "pill" : "rounded-square",
      };
    })
    .filter((entry): entry is CmsHomeContentBlockState => entry !== null);

  return {
    heroEyebrow: asText(source.heroEyebrow),
    heroEyebrowNl: asText(source.heroEyebrowNl),
    heroTitle: asText(source.heroTitle),
    heroTitleNl: asText(source.heroTitleNl),
    heroDescription: asText(source.heroDescription),
    heroDescriptionNl: asText(source.heroDescriptionNl),
    heroPrimaryCta: asText(source.heroPrimaryCta),
    heroPrimaryCtaNl: asText(source.heroPrimaryCtaNl),
    heroSecondaryCta: asText(source.heroSecondaryCta),
    heroSecondaryCtaNl: asText(source.heroSecondaryCtaNl),
    heroImage: asText(source.heroImage),
    featuredEyebrow: asText(source.featuredEyebrow),
    featuredEyebrowNl: asText(source.featuredEyebrowNl),
    featuredTitle: asText(source.featuredTitle),
    featuredTitleNl: asText(source.featuredTitleNl),
    featuredDescription: asText(source.featuredDescription),
    featuredDescriptionNl: asText(source.featuredDescriptionNl),
    categoriesEyebrow: asText(source.categoriesEyebrow),
    categoriesEyebrowNl: asText(source.categoriesEyebrowNl),
    categoriesTitle: asText(source.categoriesTitle),
    categoriesTitleNl: asText(source.categoriesTitleNl),
    categoriesDescription: asText(source.categoriesDescription),
    categoriesDescriptionNl: asText(source.categoriesDescriptionNl),
    storyEyebrow: asText(source.storyEyebrow),
    storyEyebrowNl: asText(source.storyEyebrowNl),
    storyTitle: asText(source.storyTitle),
    storyTitleNl: asText(source.storyTitleNl),
    storyDescription: asText(source.storyDescription),
    storyDescriptionNl: asText(source.storyDescriptionNl),
    storyPointOne: asText(source.storyPointOne),
    storyPointOneNl: asText(source.storyPointOneNl),
    storyPointTwo: asText(source.storyPointTwo),
    storyPointTwoNl: asText(source.storyPointTwoNl),
    storyPointThree: asText(source.storyPointThree),
    storyPointThreeNl: asText(source.storyPointThreeNl),
    hiddenEditableIds,
    customBlocks,
  };
};

const parseCmsGenericDraft = (value: unknown): CmsGenericDraftState => {
  const defaults = createInitialCmsGenericDraftState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;

  return {
    eyebrow: asText(source.eyebrow),
    eyebrowNl: asText(source.eyebrowNl),
    title: asText(source.title),
    titleNl: asText(source.titleNl),
    description: asText(source.description),
    descriptionNl: asText(source.descriptionNl),
    primaryCta: asText(source.primaryCta),
    primaryCtaNl: asText(source.primaryCtaNl),
    secondaryCta: asText(source.secondaryCta),
    secondaryCtaNl: asText(source.secondaryCtaNl),
  };
};

const parseCmsSeoDraft = (value: unknown): CmsSeoState => {
  const defaults = createInitialCmsSeoState();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const source = value as Record<string, unknown>;

  return {
    metaTitle: asText(source.metaTitle),
    metaDescription: asText(source.metaDescription),
    ogImage: asText(source.ogImage),
  };
};

const parseCmsLinkRows = (value: unknown): CmsLinkRowState[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry): CmsLinkRowState | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const source = entry as Record<string, unknown>;
      const label = asText(source.label).trim();
      const href = asText(source.href).trim();

      if (!label || !href) {
        return null;
      }

      return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label,
        labelNl: asText(source.labelNl).trim(),
        href,
        external: source.external === true,
      };
    })
    .filter((entry): entry is CmsLinkRowState => entry !== null);
};

const serializeCmsLinkRows = (rows: CmsLinkRowState[]) =>
  rows
    .map((row) => ({
      label: row.label.trim(),
      labelNl: row.labelNl.trim(),
      href: row.href.trim(),
      external: row.external,
    }))
    .filter((row) => row.label.length > 0 && row.href.length > 0)
    .map((row) => ({
      label: row.label,
      href: row.href,
      ...(row.labelNl ? { labelNl: row.labelNl } : {}),
      ...(row.external ? { external: true } : {}),
    }));

const createDefaultSelectionRow = (): DefaultSelectionRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  optionId: "",
  choiceId: "",
});

const createDefaultSelectionRowForOption = (optionId: string): DefaultSelectionRow => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  optionId,
  choiceId: "",
});

const createStandardDefaultSelectionRows = (optionIds: string[]): DefaultSelectionRow[] =>
  optionIds.map((optionId) => createDefaultSelectionRowForOption(optionId));

const createCustomChoiceForm = (): CustomOptionChoiceForm => ({
  formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: "",
  label: "",
  labelNl: "",
  priceModifier: "0",
  swatchHex: "",
});

const createCustomOptionForm = (): CustomOptionForm => ({
  formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: "",
  label: "",
  labelNl: "",
  helperText: "",
  helperTextNl: "",
  type: "dropdown",
  choices: [createCustomChoiceForm()],
});

const normalizeOptionId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

const rgbLikeToHex = (value: string) => {
  const match = value
    .trim()
    .match(/^rgba?\(\s*(\d{1,3})\s*[ ,]\s*(\d{1,3})\s*[ ,]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)$/i);

  if (!match) {
    return null;
  }

  const [r, g, b] = match.slice(1, 4).map((entry) => Number(entry));
  if ([r, g, b].some((channel) => Number.isNaN(channel) || channel < 0 || channel > 255)) {
    return null;
  }

  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const toColorInputValue = (value: string) => {
  const trimmed = value.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed;
  }

  const parsedRgb = rgbLikeToHex(trimmed);
  return parsedRgb ?? "#c9a97c";
};

const savedEditorColorsStorageKey = "cms-editor-saved-colors-v1";
const maxSavedEditorColors = 12;

const normalizeSavedEditorColor = (value: string) => toColorInputValue(value).toLowerCase();

const applyColorFieldChange = (
  field: "color" | "backgroundColor",
  value: string,
  applyPreviewEditableChanges: (
    changes: Partial<{
      text: string;
      color: string;
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      backgroundColor: string;
      borderRadius: string;
      imageUrl: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
    options?: {
      skipHistory?: boolean;
      targetId?: string;
    },
  ) => void,
) => {
  if (field === "color") {
    applyPreviewEditableChanges({ color: value });
    return;
  }

  applyPreviewEditableChanges({ backgroundColor: value });
};

const isTransparentBackgroundColor = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  return trimmed === "transparent" || trimmed === "rgba(0, 0, 0, 0)" || trimmed === "rgba(0,0,0,0)";
};

type PreviewShapeOption = "rounded-square" | "pill" | "custom";

const parseRadiusToPx = (value: string): number | null => {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(px|rem)$/);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }

  if (match[2] === "rem") {
    return amount * 16;
  }

  return amount;
};

const getPreviewShapeOption = (borderRadius: string): PreviewShapeOption => {
  const trimmed = borderRadius.trim().toLowerCase();
  if (!trimmed) {
    return "custom";
  }

  if (trimmed === "9999px") {
    return "pill";
  }

  if (trimmed === "1.5rem") {
    return "rounded-square";
  }

  const radiusPx = parseRadiusToPx(trimmed);
  if (radiusPx === null) {
    return "custom";
  }

  if (radiusPx >= 999) {
    return "pill";
  }

  if (Math.abs(radiusPx - 24) <= 1) {
    return "rounded-square";
  }

  return "custom";
};

const createInitialProductState = (): NewProductState => ({
  name: "",
  nameNl: "",
  slug: "",
  category: "tables",
  basePrice: "",
  subtitle: "",
  subtitleNl: "",
  description: "",
  descriptionNl: "",
  leadTime: "6-8 weeks",
  leadTimeNl: "",
  images: "",
  featured: false,
  story: "",
  storyNl: "",
});

const fieldClassName =
  "mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

const parseDecimalInput = (value: string): number | null => {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatAdminPrice = (value: number) =>
  value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toDecimalInputValue = (
  value: number | string | null | undefined,
  fallback = "",
): string => {
  const parsed =
    typeof value === "number"
      ? Number.isFinite(value)
        ? value
        : null
      : parseDecimalInput(String(value ?? ""));

  return parsed === null ? fallback : parsed.toString().replace(".", ",");
};

const createCmsDraftSnapshot = (
  homeDraft: CmsHomeDraftState,
  seoDraft: CmsSeoState,
  pageDrafts: Record<Exclude<CmsPageSlug, "home">, CmsGenericDraftState>,
  pageSeoDrafts: Record<Exclude<CmsPageSlug, "home">, CmsSeoState>,
  headerLinks: CmsLinkRowState[],
  footerLinks: CmsLinkRowState[],
): CmsDraftSnapshot => ({
  homeDraft,
  seoDraft,
  pageDrafts,
  pageSeoDrafts,
  headerLinks,
  footerLinks,
});

const areCmsDraftSnapshotsEqual = (left: CmsDraftSnapshot | null, right: CmsDraftSnapshot | null) =>
  JSON.stringify(left) === JSON.stringify(right);

export default function AdminPage() {
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<"catalog" | "appearance">("catalog");
  const [appearanceForm, setAppearanceForm] = useState<AppearanceSettingsState>(
    createInitialAppearanceState,
  );
  const [loadingAppearance, setLoadingAppearance] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearanceDirty, setAppearanceDirty] = useState(false);
  const [appearanceUndoHistory, setAppearanceUndoHistory] = useState<AppearanceSettingsState[]>([]);
  const [appearanceRedoHistory, setAppearanceRedoHistory] = useState<AppearanceSettingsState[]>([]);
  const [appearanceDefaultSnapshot, setAppearanceDefaultSnapshot] =
    useState<AppearanceSettingsState | null>(null);
  const [appearanceSchemes, setAppearanceSchemes] = useState<AppearanceScheme[]>([]);
  const [newAppearanceSchemeName, setNewAppearanceSchemeName] = useState("");
  const [appearanceDrawerOpen, setAppearanceDrawerOpen] = useState(false);
  const [previewPath, setPreviewPath] = useState("/");
  const [previewFrameVersion, setPreviewFrameVersion] = useState(0);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [previewFullscreenInspectorOpen, setPreviewFullscreenInspectorOpen] = useState(true);
  const [previewFullscreenInspectorPosition, setPreviewFullscreenInspectorPosition] =
    useState<FullscreenInspectorPosition>({ left: 24, top: 72 });
  const [previewFullscreenInspectorSize, setPreviewFullscreenInspectorSize] =
    useState<FullscreenInspectorSize>({ width: 420, height: 560 });
  const [homeBlocksMenuOpen, setHomeBlocksMenuOpen] = useState(false);
  const [visualEditorEnabled, setVisualEditorEnabled] = useState(false);
  const [previewGridEnabled, setPreviewGridEnabled] = useState(false);
  const [selectedPreviewEditableId, setSelectedPreviewEditableId] = useState("");
  const [selectedPreviewTagName, setSelectedPreviewTagName] = useState("");
  const [selectedPreviewCapabilities, setSelectedPreviewCapabilities] =
    useState<PreviewEditableCapabilities | null>(null);
  const [previewEditableValues, setPreviewEditableValues] = useState<PreviewEditableValues>(
    createInitialPreviewEditableValues,
  );
  const [savedEditorColors, setSavedEditorColors] = useState<string[]>([]);
  const [previewUndoHistory, setPreviewUndoHistory] = useState<PreviewEditHistoryEntry[]>([]);
  const [previewRedoHistory, setPreviewRedoHistory] = useState<PreviewEditHistoryEntry[]>([]);
  const [colorPickerDrafts, setColorPickerDrafts] = useState<Record<string, string>>({});
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceSuccess, setAppearanceSuccess] = useState("");
  const [loadingCms, setLoadingCms] = useState(false);
  const [savingCmsDraft, setSavingCmsDraft] = useState(false);
  const [publishingCms, setPublishingCms] = useState(false);
  const [cmsError, setCmsError] = useState("");
  const [cmsSuccess, setCmsSuccess] = useState("");
  const [cmsHomeDraft, setCmsHomeDraft] = useState<CmsHomeDraftState>(
    createInitialCmsHomeDraftState,
  );
  const [cmsSeoDraft, setCmsSeoDraft] = useState<CmsSeoState>(createInitialCmsSeoState);
  const [cmsPageDrafts, setCmsPageDrafts] = useState<
    Record<Exclude<CmsPageSlug, "home">, CmsGenericDraftState>
  >({
    shop: createInitialCmsGenericDraftState(),
    configurator: createInitialCmsGenericDraftState(),
    cart: createInitialCmsGenericDraftState(),
  });
  const [cmsPageSeoDrafts, setCmsPageSeoDrafts] = useState<
    Record<Exclude<CmsPageSlug, "home">, CmsSeoState>
  >({
    shop: createInitialCmsSeoState(),
    configurator: createInitialCmsSeoState(),
    cart: createInitialCmsSeoState(),
  });
  const [cmsPagePublishedAt, setCmsPagePublishedAt] = useState<
    Record<Exclude<CmsPageSlug, "home">, string | null>
  >({
    shop: null,
    configurator: null,
    cart: null,
  });
  const [cmsHeaderLinks, setCmsHeaderLinks] = useState<CmsLinkRowState[]>([]);
  const [cmsFooterLinks, setCmsFooterLinks] = useState<CmsLinkRowState[]>([]);
  const [cmsHomePublishedAt, setCmsHomePublishedAt] = useState<string | null>(null);
  const [cmsDraftSavedSnapshot, setCmsDraftSavedSnapshot] = useState<CmsDraftSnapshot | null>(null);
  const [cmsDraftDirty, setCmsDraftDirty] = useState(false);
  const [cmsMediaAssets, setCmsMediaAssets] = useState<CmsMediaAssetRow[]>([]);
  const [cmsMediaUploadError, setCmsMediaUploadError] = useState("");
  const [isUploadingCmsMedia, setIsUploadingCmsMedia] = useState(false);
  const [isQuickImageUploading, setIsQuickImageUploading] = useState(false);
  const [quickImageUploadFeedback, setQuickImageUploadFeedback] = useState("");
  const [confirmDialogAction, setConfirmDialogAction] = useState<
    "discard" | "publish" | "delete" | null
  >(null);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<PendingDeleteAction | null>(null);
  const [uploadingCustomBlockId, setUploadingCustomBlockId] = useState<string | null>(null);
  const [customBlockUploadError, setCustomBlockUploadError] = useState("");
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewCommittedValuesRef = useRef<Map<string, PreviewEditableValues>>(new Map());
  const previewMoveHistoryDraftRef = useRef<
    | {
        id: string;
        before: PreviewEditableValues;
        latestX: number;
        latestY: number;
        latestWidth: number;
        latestHeight: number;
      }
    | null
  >(null);
  const previewMoveHistoryTimerRef = useRef<number | null>(null);
  const fullscreenInspectorDragRef = useRef<
    | {
        startClientX: number;
        startClientY: number;
        startLeft: number;
        startTop: number;
        width: number;
        height: number;
      }
    | null
  >(null);
  const fullscreenInspectorResizeRef = useRef<
    | {
        startClientX: number;
        startClientY: number;
        startWidth: number;
        startHeight: number;
        left: number;
        top: number;
      }
    | null
  >(null);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [isDraggingCategoryHero, setIsDraggingCategoryHero] = useState(false);
  const [isUploadingCategoryHero, setIsUploadingCategoryHero] = useState(false);
  const [categoryHeroUploadError, setCategoryHeroUploadError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<NewCategoryState>(createInitialCategoryState);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<NewProductState>(createInitialProductState);
  const [standardOptionIds, setStandardOptionIds] = useState<string[]>(defaultStandardOptionIds);
  const [newStandardOptionId, setNewStandardOptionId] = useState("");
  const [defaultSelectionRows, setDefaultSelectionRows] = useState<DefaultSelectionRow[]>(
    createStandardDefaultSelectionRows(defaultStandardOptionIds),
  );
  const [customOptionsForm, setCustomOptionsForm] = useState<CustomOptionForm[]>([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [ownerCheckError, setOwnerCheckError] = useState("");

  const getColorPickerDraftValue = useCallback(
    (draftKey: string, committedValue: string) => {
      return toColorInputValue(colorPickerDrafts[draftKey] ?? committedValue);
    },
    [colorPickerDrafts],
  );

  const stageColorPickerValue = useCallback((draftKey: string, value: string) => {
    setColorPickerDrafts((previous) => ({
      ...previous,
      [draftKey]: value,
    }));
  }, []);

  const commitColorPickerValue = useCallback(
    (draftKey: string, committedValue: string, apply: (value: string) => void) => {
      const nextValue = colorPickerDrafts[draftKey] ?? committedValue;
      apply(nextValue);

      setColorPickerDrafts((previous) => {
        if (!(draftKey in previous)) {
          return previous;
        }

        const next = { ...previous };
        delete next[draftKey];
        return next;
      });
    },
    [colorPickerDrafts],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(savedEditorColorsStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = parsed
        .filter((value): value is string => typeof value === "string")
        .map((value) => normalizeSavedEditorColor(value));

      setSavedEditorColors(Array.from(new Set(normalized)).slice(0, maxSavedEditorColors));
    } catch {
      // Ignore invalid local storage payload.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(savedEditorColorsStorageKey, JSON.stringify(savedEditorColors));
  }, [savedEditorColors]);

  const saveEditorColor = useCallback((color: string) => {
    const normalized = normalizeSavedEditorColor(color);
    setSavedEditorColors((previous) =>
      [normalized, ...previous.filter((entry) => entry !== normalized)].slice(0, maxSavedEditorColors),
    );
  }, []);

  const positionNewCustomBlockAtViewportCenter = useCallback((blockId: string) => {
    const frame = previewIframeRef.current;
    if (!frame?.contentWindow || !frame.contentDocument) {
      return;
    }

    const editableId = `home.customBlock.${blockId}`;
    const maxAttempts = 8;

    const attemptPosition = (attempt = 0) => {
      const block = frame.contentDocument?.querySelector<HTMLElement>(
        `[data-cms-editable="${editableId}"]`,
      );

      if (block) {
        const rect = block.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const viewportCenterX = window.innerWidth / 2 - frameRect.left;
        const viewportCenterY = window.innerHeight / 2 - frameRect.top;

        const nextX = Math.round(viewportCenterX - (rect.left + rect.width / 2));
        const nextY = Math.round(viewportCenterY - (rect.top + rect.height / 2));

        frame.contentWindow!.postMessage(
          {
            type: "cms-preview:editor:apply",
            payload: {
              id: editableId,
              changes: {
                x: nextX,
                y: nextY,
              },
            },
          },
          window.location.origin,
        );
        return;
      }

      if (attempt < maxAttempts) {
        window.setTimeout(() => attemptPosition(attempt + 1), 120);
      }
    };

    window.setTimeout(() => attemptPosition(), 80);
  }, []);

  const addCmsHomeCustomBlock = useCallback((type: CmsHomeContentBlockType) => {
    const nextBlock = createCmsHomeContentBlock(type);
    setPreviewPath("/");
    setCmsHomeDraft((previous) => {
      const nextCustomBlocks = [...previous.customBlocks, nextBlock];

      setPreviewUndoHistory((previousHistory) => {
        const nextHistory = [
          ...previousHistory,
          {
            id: "home.customBlocks",
            before: createInitialPreviewEditableValues(),
            after: createInitialPreviewEditableValues(),
            customBlocksBefore: previous.customBlocks,
            customBlocksAfter: nextCustomBlocks,
            selectedEditableIdBefore: selectedPreviewEditableId,
            selectedEditableIdAfter: selectedPreviewEditableId,
          },
        ];
        return nextHistory.slice(-previewEditHistoryLimit);
      });
      setPreviewRedoHistory([]);

      return {
        ...previous,
        customBlocks: nextCustomBlocks,
      };
    });

    if (previewFullscreen) {
      positionNewCustomBlockAtViewportCenter(nextBlock.id);
    }
  }, [positionNewCustomBlockAtViewportCenter, previewFullscreen, selectedPreviewEditableId]);

  const removeCmsHomeCustomBlock = useCallback((id: string) => {
    setPreviewPath("/");
    setCmsHomeDraft((previous) => {
      const nextCustomBlocks = previous.customBlocks.filter((block) => block.id !== id);

      setPreviewUndoHistory((previousHistory) => {
        const nextHistory = [
          ...previousHistory,
          {
            id: "home.customBlocks",
            before: createInitialPreviewEditableValues(),
            after: createInitialPreviewEditableValues(),
            customBlocksBefore: previous.customBlocks,
            customBlocksAfter: nextCustomBlocks,
            selectedEditableIdBefore: selectedPreviewEditableId,
            selectedEditableIdAfter: selectedPreviewEditableId,
          },
        ];
        return nextHistory.slice(-previewEditHistoryLimit);
      });
      setPreviewRedoHistory([]);

      return {
        ...previous,
        customBlocks: nextCustomBlocks,
      };
    });
  }, [selectedPreviewEditableId]);

  const updateCmsHomeCustomBlock = useCallback(
    (id: string, key: keyof Omit<CmsHomeContentBlockState, "id" | "type">, value: string) => {
      setPreviewPath("/");
      setCmsHomeDraft((previous) => ({
        ...previous,
        customBlocks: previous.customBlocks.map((block) =>
          block.id === id
            ? {
                ...block,
                [key]: value,
              }
            : block,
        ),
      }));
    },
    [],
  );

  const handleCustomBlockImageUpload = useCallback(
    async (blockId: string, file: File) => {
      if (!session) {
        setCustomBlockUploadError("Please sign in before uploading media.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setCustomBlockUploadError("Only image files can be uploaded.");
        return;
      }

      setPreviewPath("/");
      setCustomBlockUploadError("");
      setUploadingCustomBlockId(blockId);

      try {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
        const uniquePath = `cms/${Date.now()}-${Math.random().toString(16).slice(2)}-${baseName || "asset"}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(cmsMediaBucket)
          .upload(uniquePath, file, { upsert: false });

        if (uploadError) {
          setCustomBlockUploadError(uploadError.message);
          return;
        }

        const insertPayload: Record<string, unknown> = {
          bucket: cmsMediaBucket,
          storage_path: uniquePath,
          mime_type: file.type || null,
          size_bytes: file.size,
          created_by: session.user.id,
        };

        let { error: insertError } = await (supabase as any).from("cms_media_assets").insert(insertPayload);

        if (
          insertError &&
          /created_by/i.test(insertError.message) &&
          /(column|field).*does not exist/i.test(insertError.message)
        ) {
          const { created_by, ...legacyInsertPayload } = insertPayload;
          const fallbackInsert = await (supabase as any)
            .from("cms_media_assets")
            .insert(legacyInsertPayload);
          insertError = fallbackInsert.error;
        }

        if (insertError) {
          setCustomBlockUploadError(insertError.message);
          return;
        }

        const publicUrl = supabase.storage.from(cmsMediaBucket).getPublicUrl(uniquePath).data.publicUrl;
        updateCmsHomeCustomBlock(blockId, "imageUrl", publicUrl);
      } catch {
        setCustomBlockUploadError("Image upload failed unexpectedly.");
      } finally {
        setUploadingCustomBlockId(null);
      }
    },
    [session, supabase, updateCmsHomeCustomBlock],
  );

  const handleDiscardCmsDraftChanges = useCallback((skipConfirm = false) => {
    const hasPreviewEdits = previewUndoHistory.length > 0 || previewRedoHistory.length > 0;

    if (!cmsDraftSavedSnapshot && !hasPreviewEdits) {
      return;
    }

    if (!skipConfirm) {
      setConfirmDialogAction("discard");
      return;
    }

    if (cmsDraftSavedSnapshot) {
      setCmsHomeDraft(cmsDraftSavedSnapshot.homeDraft);
      setCmsSeoDraft(cmsDraftSavedSnapshot.seoDraft);
      setCmsPageDrafts(cmsDraftSavedSnapshot.pageDrafts);
      setCmsPageSeoDrafts(cmsDraftSavedSnapshot.pageSeoDrafts);
      setCmsHeaderLinks(cmsDraftSavedSnapshot.headerLinks);
      setCmsFooterLinks(cmsDraftSavedSnapshot.footerLinks);
      setCmsDraftDirty(false);
    }

    if (previewMoveHistoryTimerRef.current !== null) {
      window.clearTimeout(previewMoveHistoryTimerRef.current);
      previewMoveHistoryTimerRef.current = null;
    }

    previewMoveHistoryDraftRef.current = null;

    if (hasPreviewEdits) {
      const revertSnapshots = new Map<string, PreviewEditableValues>();

      for (const entry of previewUndoHistory) {
        if (
          entry.customBlocksBefore ||
          entry.customBlocksAfter ||
          entry.hiddenEditableIdsBefore ||
          entry.hiddenEditableIdsAfter
        ) {
          continue;
        }

        if (!revertSnapshots.has(entry.id)) {
          revertSnapshots.set(entry.id, entry.before);
        }
      }

      for (const [id, values] of revertSnapshots.entries()) {
        if (previewIframeRef.current?.contentWindow) {
          previewIframeRef.current.contentWindow.postMessage(
            {
              type: "cms-preview:editor:apply",
              payload: {
                id,
                changes: {
                  text: values.text,
                  color: values.color,
                  fontFamily: values.fontFamily,
                  fontSize: values.fontSize,
                  fontWeight: values.fontWeight,
                  backgroundColor: values.backgroundColor,
                  borderRadius: values.borderRadius,
                  imageUrl: values.imageUrl,
                  x: values.x,
                  y: values.y,
                  width: values.width,
                  height: values.height,
                },
              },
            },
            window.location.origin,
          );
        }
      }
    }

    previewCommittedValuesRef.current.clear();
    setPreviewUndoHistory([]);
    setPreviewRedoHistory([]);
    setSelectedPreviewEditableId("");
    setSelectedPreviewCapabilities(null);
    setPreviewEditableValues(createInitialPreviewEditableValues());
    setPreviewFrameVersion((version) => version + 1);

    setCmsError("");
    setCmsSuccess("Discarded unsaved changes and restored the last saved draft.");
  }, [cmsDraftSavedSnapshot, previewRedoHistory, previewUndoHistory]);

  const canDiscardCmsChanges =
    cmsDraftDirty || previewUndoHistory.length > 0 || previewRedoHistory.length > 0;
  const [slugEdited, setSlugEdited] = useState(false);
  const router = useRouter();
  const cmsEditableBindingMap = useMemo(
    () => new Map(cmsEditableBindings.map((binding) => [binding.id, binding])),
    [],
  );

  const selectedCmsBinding = useMemo(
    () => cmsEditableBindingMap.get(selectedPreviewEditableId) ?? null,
    [cmsEditableBindingMap, selectedPreviewEditableId],
  );

  const selectedNavigationBinding = useMemo(
    () => parseNavigationEditableId(selectedPreviewEditableId),
    [selectedPreviewEditableId],
  );

  const selectedNavigationRow = useMemo(() => {
    if (!selectedNavigationBinding) {
      return null;
    }

    const source = selectedNavigationBinding.location === "header" ? cmsHeaderLinks : cmsFooterLinks;
    return source[selectedNavigationBinding.index] ?? null;
  }, [cmsFooterLinks, cmsHeaderLinks, selectedNavigationBinding]);

  const selectedCustomHomeBlock = useMemo(() => {
    const blockId = parseCustomHomeBlockEditableId(selectedPreviewEditableId);
    if (!blockId) {
      return null;
    }

    return cmsHomeDraft.customBlocks.find((block) => block.id === blockId) ?? null;
  }, [cmsHomeDraft.customBlocks, selectedPreviewEditableId]);

  const selectedCustomHomeBlockLabel = useMemo(() => {
    if (!selectedCustomHomeBlock) {
      return null;
    }

    return `Home Custom Block (${selectedCustomHomeBlock.type})`;
  }, [selectedCustomHomeBlock]);

  const getCmsBindingValue = useCallback(
    (binding: CmsEditableBinding, key: "keyEn" | "keyNl") => {
      const fieldName = binding[key];
      if (!fieldName) {
        return "";
      }

      if (binding.section === "home") {
        return cmsHomeDraft[fieldName as keyof CmsHomeDraftState] as string;
      }

      const pageSection = binding.section as Exclude<CmsPageSlug, "home">;
      return cmsPageDrafts[pageSection][fieldName as keyof CmsGenericDraftState] as string;
    },
    [cmsHomeDraft, cmsPageDrafts],
  );

  const setCmsBindingValue = useCallback(
    (binding: CmsEditableBinding, key: "keyEn" | "keyNl", value: string) => {
      const fieldName = binding[key];
      if (!fieldName) {
        return;
      }

      if (binding.section === "home") {
        setCmsHomeDraft((previous) => ({
          ...previous,
          [fieldName]: value,
        }));
        return;
      }

      const pageSection = binding.section as Exclude<CmsPageSlug, "home">;

      setCmsPageDrafts((previous) => ({
        ...previous,
        [pageSection]: {
          ...previous[pageSection],
          [fieldName]: value,
        },
      }));
    },
    [],
  );

  const updateSelectedNavigationRow = useCallback(
    (field: keyof Omit<CmsLinkRowState, "id">, value: string | boolean) => {
      if (!selectedNavigationBinding) {
        return;
      }

      const setter = selectedNavigationBinding.location === "header" ? setCmsHeaderLinks : setCmsFooterLinks;

      setter((previous) =>
        previous.map((row, index) =>
          index === selectedNavigationBinding.index ? { ...row, [field]: value } : row,
        ),
      );
    },
    [selectedNavigationBinding],
  );

  const getCmsMediaPublicUrl = useCallback(
    (asset: CmsMediaAssetRow) => supabase.storage.from(asset.bucket).getPublicUrl(asset.storage_path).data.publicUrl,
    [supabase],
  );

  const syncSelectedImageUrlToDraft = useCallback(
    (value: string) => {
      if (selectedCmsBinding?.kind === "image") {
        setCmsBindingValue(selectedCmsBinding, "keyEn", value);
      }

      if (selectedCustomHomeBlock?.type === "image") {
        updateCmsHomeCustomBlock(selectedCustomHomeBlock.id, "imageUrl", value);
      }
    },
    [selectedCmsBinding, selectedCustomHomeBlock, setCmsBindingValue, updateCmsHomeCustomBlock],
  );

  const hideCmsHomeEditable = useCallback((editableId: string) => {
    setPreviewPath("/");
    setCmsHomeDraft((previous) => {
      if (previous.hiddenEditableIds.includes(editableId)) {
        return previous;
      }

      const nextHiddenEditableIds = [...previous.hiddenEditableIds, editableId];

      setPreviewUndoHistory((previousHistory) => {
        const nextHistory = [
          ...previousHistory,
          {
            id: "home.hiddenEditableIds",
            before: createInitialPreviewEditableValues(),
            after: createInitialPreviewEditableValues(),
            hiddenEditableIdsBefore: previous.hiddenEditableIds,
            hiddenEditableIdsAfter: nextHiddenEditableIds,
            selectedEditableIdBefore: selectedPreviewEditableId,
            selectedEditableIdAfter: "",
          },
        ];
        return nextHistory.slice(-previewEditHistoryLimit);
      });
      setPreviewRedoHistory([]);

      return {
        ...previous,
        hiddenEditableIds: nextHiddenEditableIds,
      };
    });
  }, [selectedPreviewEditableId]);

  useEffect(() => {
    const stored = window.localStorage.getItem(standardOptionStorageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = Array.from(
        new Set(
          parsed
            .filter((entry): entry is string => typeof entry === "string")
            .map((entry) => normalizeOptionId(entry))
            .filter(Boolean),
        ),
      );

      if (normalized.length === 0) {
        return;
      }

      setStandardOptionIds(normalized);
      setDefaultSelectionRows((previousRows) => {
        const presentOptionIds = new Set(
          previousRows.map((row) => row.optionId.trim().toLowerCase()),
        );

        const missingRows = normalized
          .filter((optionId) => !presentOptionIds.has(optionId))
          .map((optionId) => createDefaultSelectionRowForOption(optionId));

        return missingRows.length > 0 ? [...previousRows, ...missingRows] : previousRows;
      });
    } catch {
      window.localStorage.removeItem(standardOptionStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(standardOptionStorageKey, JSON.stringify(standardOptionIds));
  }, [standardOptionIds]);

  useEffect(() => {
    const stored = window.localStorage.getItem(appearanceSchemesStorageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = parsed
        .map((entry): AppearanceScheme | null => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const candidate = entry as Record<string, unknown>;
          const settings = candidate.settings as Record<string, unknown> | undefined;

          if (!settings || typeof settings !== "object") {
            return null;
          }

          const layoutMode = settings.layoutMode;
          const containerWidth = settings.containerWidth;
          const sectionSpacing = settings.sectionSpacing;
          const heroLayout = settings.heroLayout;

          if (
            layoutMode !== "compact" &&
            layoutMode !== "balanced" &&
            layoutMode !== "spacious"
          ) {
            return null;
          }

          if (
            containerWidth !== "narrow" &&
            containerWidth !== "standard" &&
            containerWidth !== "wide"
          ) {
            return null;
          }

          if (
            sectionSpacing !== "tight" &&
            sectionSpacing !== "balanced" &&
            sectionSpacing !== "airy"
          ) {
            return null;
          }

          if (
            heroLayout !== "split" &&
            heroLayout !== "centered" &&
            heroLayout !== "image-first"
          ) {
            return null;
          }

          const fontBody = settings.fontBody;
          const fontHeading = settings.fontHeading;
          const buttonRadius = settings.buttonRadius;

          const normalizedFontBody: FontPreset =
            fontBody === "manrope" ||
            fontBody === "jakarta" ||
            fontBody === "system" ||
            fontBody === "serif"
              ? fontBody
              : "manrope";

          const normalizedFontHeading: FontPreset =
            fontHeading === "manrope" ||
            fontHeading === "jakarta" ||
            fontHeading === "system" ||
            fontHeading === "serif"
              ? fontHeading
              : "jakarta";

          const requiredColorFields = [
            "brandName",
            "logoUrl",
            "logoColor",
            "colorBg",
            "colorText",
            "colorInk",
            "colorMuted",
            "colorNeutral100",
            "colorNeutral200",
            "colorNeutral300",
            "colorWood",
            "colorWoodDark",
            "colorButtonBg",
            "colorButtonBgHover",
            "colorButtonText",
          ];

          for (const field of requiredColorFields) {
            if (typeof settings[field] !== "string") {
              return null;
            }
          }

          return {
            id:
              typeof candidate.id === "string" && candidate.id.length > 0
                ? candidate.id
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name:
              typeof candidate.name === "string" && candidate.name.trim().length > 0
                ? candidate.name.trim()
                : "Saved scheme",
            settings: {
              brandName: settings.brandName as string,
              logoUrl: settings.logoUrl as string,
              logoColor: settings.logoColor as string,
              colorBg: settings.colorBg as string,
              colorText: settings.colorText as string,
              colorInk: settings.colorInk as string,
              colorMuted: settings.colorMuted as string,
              colorNeutral100: settings.colorNeutral100 as string,
              colorNeutral200: settings.colorNeutral200 as string,
              colorNeutral300: settings.colorNeutral300 as string,
              colorWood: settings.colorWood as string,
              colorWoodDark: settings.colorWoodDark as string,
              colorButtonBg: settings.colorButtonBg as string,
              colorButtonBgHover: settings.colorButtonBgHover as string,
              colorButtonText: settings.colorButtonText as string,
              layoutMode,
              containerWidth,
              sectionSpacing,
              heroLayout,
              fontBody: normalizedFontBody,
              fontHeading: normalizedFontHeading,
              buttonRadius:
                typeof buttonRadius === "string" && buttonRadius.trim().length > 0
                  ? buttonRadius
                  : "9999px",
            },
          };
        })
        .filter((entry): entry is AppearanceScheme => Boolean(entry));

      setAppearanceSchemes(normalized);
    } catch {
      window.localStorage.removeItem(appearanceSchemesStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(appearanceSchemesStorageKey, JSON.stringify(appearanceSchemes));
  }, [appearanceSchemes]);

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data?.session ?? null);
      setSessionChecked(true);
    };

    void initializeSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!sessionChecked) {
      return;
    }

    if (!session) {
      router.replace("/admin/login");
    }
  }, [router, session, sessionChecked]);

  const fetchCategories = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingCategories(true);
      setCategoryError("");

      const { data, error: queryError } = await supabase
        .from("categories" as never)
        .select("id, slug, name, name_nl, description, description_nl, hero_image")
        .order("created_at", { ascending: true });

      if (queryError) {
        setCategoryError(queryError.message);
        return;
      }

      const nextRows = (data ?? []) as CategoryRow[];
      setCategoryRows(nextRows);

      if (nextRows.length > 0) {
        setProductForm((previous) => {
          const exists = nextRows.some((row) => row.slug === previous.category);
          return exists ? previous : { ...previous, category: nextRows[0].slug };
        });
      }
    } catch {
      setCategoryError("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  }, [session, supabase]);

  const fetchAppearanceSettings = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingAppearance(true);
      setAppearanceError("");

      const { data, error: queryError } = await (supabase as any)
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (queryError) {
        setAppearanceError(queryError.message);
        return;
      }

      if (!data) {
        return;
      }

      const settings = data as Record<string, unknown>;

      setAppearanceForm({
        brandName: String(settings.brand_name ?? "Atelier Nord"),
        logoUrl: String(settings.logo_url ?? ""),
        logoColor: String(settings.logo_color ?? settings.color_ink ?? "#2b231d"),
        colorBg: String(settings.color_bg ?? "#fbfaf8"),
        colorText: String(settings.color_text ?? settings.color_ink ?? "#2b231d"),
        colorInk: String(settings.color_ink ?? "#2b231d"),
        colorMuted: String(settings.color_muted ?? "#6f655c"),
        colorNeutral100: String(settings.color_neutral_100 ?? "#f2ede7"),
        colorNeutral200: String(settings.color_neutral_200 ?? "#e8e1d8"),
        colorNeutral300: String(settings.color_neutral_300 ?? "#d7cabc"),
        colorWood: String(settings.color_wood ?? "#b88a5b"),
        colorWoodDark: String(settings.color_wood_dark ?? "#7f5534"),
        colorButtonBg: String(settings.color_button_bg ?? settings.color_wood_dark ?? "#7f5534"),
        colorButtonBgHover: String(settings.color_button_bg_hover ?? settings.color_wood ?? "#b88a5b"),
        colorButtonText: String(settings.color_button_text ?? "#ffffff"),
        layoutMode: (settings.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (settings.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (settings.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (settings.hero_layout ?? "split") as HeroLayoutMode,
        fontBody: (settings.font_body ?? "manrope") as FontPreset,
        fontHeading: (settings.font_heading ?? "jakarta") as FontPreset,
        buttonRadius: String(settings.button_radius ?? "9999px"),
      });
      setAppearanceDefaultSnapshot({
        brandName: String(settings.brand_name ?? "Atelier Nord"),
        logoUrl: String(settings.logo_url ?? ""),
        logoColor: String(settings.logo_color ?? settings.color_ink ?? "#2b231d"),
        colorBg: String(settings.color_bg ?? "#fbfaf8"),
        colorText: String(settings.color_text ?? settings.color_ink ?? "#2b231d"),
        colorInk: String(settings.color_ink ?? "#2b231d"),
        colorMuted: String(settings.color_muted ?? "#6f655c"),
        colorNeutral100: String(settings.color_neutral_100 ?? "#f2ede7"),
        colorNeutral200: String(settings.color_neutral_200 ?? "#e8e1d8"),
        colorNeutral300: String(settings.color_neutral_300 ?? "#d7cabc"),
        colorWood: String(settings.color_wood ?? "#b88a5b"),
        colorWoodDark: String(settings.color_wood_dark ?? "#7f5534"),
        colorButtonBg: String(settings.color_button_bg ?? settings.color_wood_dark ?? "#7f5534"),
        colorButtonBgHover: String(settings.color_button_bg_hover ?? settings.color_wood ?? "#b88a5b"),
        colorButtonText: String(settings.color_button_text ?? "#ffffff"),
        layoutMode: (settings.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (settings.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (settings.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (settings.hero_layout ?? "split") as HeroLayoutMode,
        fontBody: (settings.font_body ?? "manrope") as FontPreset,
        fontHeading: (settings.font_heading ?? "jakarta") as FontPreset,
        buttonRadius: String(settings.button_radius ?? "9999px"),
      });
      setAppearanceDirty(false);
      setAppearanceUndoHistory([]);
      setAppearanceRedoHistory([]);
    } catch {
      setAppearanceError("Failed to load appearance settings.");
    } finally {
      setLoadingAppearance(false);
    }
  }, [session, supabase]);

  const saveAppearanceSettings = useCallback(
    async (nextAppearance: AppearanceSettingsState) => {
      try {
        setSavingAppearance(true);
        setAppearanceError("");

        const legacyPayload = {
          id: 1,
          brand_name: nextAppearance.brandName.trim() || "Atelier Nord",
          color_bg: nextAppearance.colorBg,
          color_ink: nextAppearance.colorInk,
          color_muted: nextAppearance.colorMuted,
          color_neutral_100: nextAppearance.colorNeutral100,
          color_neutral_200: nextAppearance.colorNeutral200,
          color_neutral_300: nextAppearance.colorNeutral300,
          color_wood: nextAppearance.colorWood,
          color_wood_dark: nextAppearance.colorWoodDark,
          layout_mode: nextAppearance.layoutMode,
          container_width: nextAppearance.containerWidth,
          section_spacing: nextAppearance.sectionSpacing,
          hero_layout: nextAppearance.heroLayout,
        };

        const extendedPayload = {
          ...legacyPayload,
          logo_url: nextAppearance.logoUrl.trim(),
          logo_color: nextAppearance.logoColor,
          color_text: nextAppearance.colorText,
          color_button_bg: nextAppearance.colorButtonBg,
          color_button_bg_hover: nextAppearance.colorButtonBgHover,
          color_button_text: nextAppearance.colorButtonText,
          font_body: nextAppearance.fontBody,
          font_heading: nextAppearance.fontHeading,
          button_radius: nextAppearance.buttonRadius,
        };

        let { error: upsertError } = await (supabase as any)
          .from("site_settings")
          .upsert(extendedPayload);

        if (upsertError && /column .* does not exist/i.test(upsertError.message ?? "")) {
          const retry = await (supabase as any).from("site_settings").upsert(legacyPayload);
          upsertError = retry.error;
        }

        if (upsertError) {
          setAppearanceError(upsertError.message);
          return;
        }

        setAppearanceDirty(false);
        setAppearanceDefaultSnapshot({ ...nextAppearance });
        setAppearanceSuccess("Appearance settings saved.");
      } catch {
        setAppearanceError("Failed to save appearance settings.");
      } finally {
        setSavingAppearance(false);
      }
    },
    [supabase],
  );

  const updateAppearanceForm = useCallback(
    (updater: React.SetStateAction<AppearanceSettingsState>) => {
      setAppearanceForm((previous) => {
        const next = typeof updater === "function" ? updater(previous) : updater;

        if (JSON.stringify(previous) !== JSON.stringify(next)) {
          setAppearanceUndoHistory((previousHistory) => {
            const nextHistory = [...previousHistory, previous];
            return nextHistory.slice(-appearanceUndoHistoryLimit);
          });
          setAppearanceRedoHistory([]);
          setAppearanceDirty(true);
          setAppearanceSuccess("");
        }

        return next;
      });
    },
    [],
  );

  const updateAppearanceField = useCallback(
    <K extends keyof AppearanceSettingsState>(field: K, value: AppearanceSettingsState[K]) => {
      updateAppearanceForm((previous) => ({ ...previous, [field]: value }));
    },
    [updateAppearanceForm],
  );

  const handleUndoAppearanceChange = () => {
    if (appearanceUndoHistory.length === 0) {
      return;
    }

    const previousSnapshot = appearanceUndoHistory[appearanceUndoHistory.length - 1];
    setAppearanceUndoHistory((previousHistory) => previousHistory.slice(0, -1));
    setAppearanceRedoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, appearanceForm];
      return nextHistory.slice(-appearanceUndoHistoryLimit);
    });
    setAppearanceForm(previousSnapshot);
    setAppearanceDirty(true);
    setAppearanceSuccess("");
    setAppearanceError("");
  };

  const handleRedoAppearanceChange = () => {
    if (appearanceRedoHistory.length === 0) {
      return;
    }

    const nextSnapshot = appearanceRedoHistory[appearanceRedoHistory.length - 1];
    setAppearanceRedoHistory((previousHistory) => previousHistory.slice(0, -1));
    setAppearanceUndoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, appearanceForm];
      return nextHistory.slice(-appearanceUndoHistoryLimit);
    });
    setAppearanceForm(nextSnapshot);
    setAppearanceDirty(true);
    setAppearanceSuccess("");
    setAppearanceError("");
  };

  const handleSaveAppearanceScheme = () => {
    const schemeName = newAppearanceSchemeName.trim();

    if (!schemeName) {
      setAppearanceError("Enter a scheme name before saving.");
      return;
    }

    setAppearanceSchemes((previous) => {
      const withoutSameName = previous.filter(
        (scheme) => scheme.name.toLowerCase() !== schemeName.toLowerCase(),
      );

      return [
        ...withoutSameName,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: schemeName,
          settings: { ...appearanceForm },
        },
      ];
    });

    setNewAppearanceSchemeName("");
    setAppearanceError("");
    setAppearanceSuccess(`Saved scheme \"${schemeName}\".`);
  };

  const handleApplyAppearanceScheme = (scheme: AppearanceScheme) => {
    updateAppearanceForm({ ...scheme.settings });
    setAppearanceError("");
    setAppearanceSuccess(`Applied scheme \"${scheme.name}\". Click Save Appearance to publish.`);
  };

  const handleDeleteAppearanceScheme = (schemeId: string) => {
    setAppearanceSchemes((previous) => previous.filter((scheme) => scheme.id !== schemeId));
  };

  const handleRestoreAppearanceDefault = () => {
    if (!appearanceDefaultSnapshot) {
      return;
    }

    updateAppearanceForm({ ...appearanceDefaultSnapshot });
    setAppearanceError("");
    setAppearanceSuccess("Restored default appearance from the currently saved website colors.");
  };

  const fetchCmsWorkspace = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingCms(true);
      setCmsError("");

      const [
        { data: pageData, error: pageError },
        { data: navigationData, error: navigationError },
        { data: mediaData, error: mediaError },
      ] = await Promise.all([
        (supabase as any)
          .from("cms_pages")
          .select("slug, title, draft_content, draft_seo, published_at")
          .in("slug", cmsManagedPageSlugs),
        (supabase as any)
          .from("cms_navigation")
          .select("location, draft_items")
          .in("location", ["header", "footer"]),
        (supabase as any)
          .from("cms_media_assets")
          .select("id, bucket, storage_path, mime_type, size_bytes, alt, alt_nl, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      if (mediaError) {
        setCmsError(mediaError.message);
        return;
      }

      const pageRows =
        ((pageData ?? []) as Array<{
          slug: CmsPageSlug;
          draft_content: unknown;
          draft_seo: unknown;
          published_at: string | null;
        }>) ?? [];

      const homePage = pageRows.find((row) => row.slug === cmsHomeSlug);
      const nextHomeDraft = parseCmsHomeDraft(homePage?.draft_content);
      const nextSeoDraft = parseCmsSeoDraft(homePage?.draft_seo);
      setCmsHomePublishedAt(homePage?.published_at ?? null);

      const nextPageDrafts = {
        shop: parseCmsGenericDraft(pageRows.find((row) => row.slug === "shop")?.draft_content),
        configurator: parseCmsGenericDraft(
          pageRows.find((row) => row.slug === "configurator")?.draft_content,
        ),
        cart: parseCmsGenericDraft(pageRows.find((row) => row.slug === "cart")?.draft_content),
      };

      const nextPageSeoDrafts = {
        shop: parseCmsSeoDraft(pageRows.find((row) => row.slug === "shop")?.draft_seo),
        configurator: parseCmsSeoDraft(pageRows.find((row) => row.slug === "configurator")?.draft_seo),
        cart: parseCmsSeoDraft(pageRows.find((row) => row.slug === "cart")?.draft_seo),
      };

      setCmsPagePublishedAt({
        shop: pageRows.find((row) => row.slug === "shop")?.published_at ?? null,
        configurator: pageRows.find((row) => row.slug === "configurator")?.published_at ?? null,
        cart: pageRows.find((row) => row.slug === "cart")?.published_at ?? null,
      });

      const rows = (navigationData ?? []) as Array<{ location: "header" | "footer"; draft_items: unknown }>;
      const header = rows.find((row) => row.location === "header");
      const footer = rows.find((row) => row.location === "footer");

      const nextHeaderLinks = parseCmsLinkRows(header?.draft_items);
      const nextFooterLinks = parseCmsLinkRows(footer?.draft_items);

      setCmsHomeDraft(nextHomeDraft);
      setCmsSeoDraft(nextSeoDraft);
      setCmsPageDrafts(nextPageDrafts);
      setCmsPageSeoDrafts(nextPageSeoDrafts);
      setCmsHeaderLinks(nextHeaderLinks);
      setCmsFooterLinks(nextFooterLinks);
      setCmsDraftSavedSnapshot(
        createCmsDraftSnapshot(
          nextHomeDraft,
          nextSeoDraft,
          nextPageDrafts,
          nextPageSeoDrafts,
          nextHeaderLinks,
          nextFooterLinks,
        ),
      );
      setCmsDraftDirty(false);
      previewCommittedValuesRef.current.clear();
      setPreviewUndoHistory([]);
      setPreviewRedoHistory([]);

      setCmsMediaAssets((mediaData ?? []) as CmsMediaAssetRow[]);
    } catch {
      setCmsError("Failed to load CMS workspace.");
    } finally {
      setLoadingCms(false);
    }
  }, [session, supabase]);

  const handleSaveCmsDraft = useCallback(async () => {
    try {
      setSavingCmsDraft(true);
      setCmsError("");
      setCmsSuccess("");

      const pagePayload = [
        {
          slug: "home",
          title: "Home",
          draft_content: cmsHomeDraft,
          draft_seo: cmsSeoDraft,
        },
        {
          slug: "shop",
          title: "Shop",
          draft_content: cmsPageDrafts.shop,
          draft_seo: cmsPageSeoDrafts.shop,
        },
        {
          slug: "configurator",
          title: "Configurator",
          draft_content: cmsPageDrafts.configurator,
          draft_seo: cmsPageSeoDrafts.configurator,
        },
        {
          slug: "cart",
          title: "Cart",
          draft_content: cmsPageDrafts.cart,
          draft_seo: cmsPageSeoDrafts.cart,
        },
      ];

      const { error: pageError } = await (supabase as any)
        .from("cms_pages")
        .upsert(pagePayload, { onConflict: "slug" });

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      const headerPayload = serializeCmsLinkRows(cmsHeaderLinks);
      const footerPayload = serializeCmsLinkRows(cmsFooterLinks);

      const { error: navigationError } = await (supabase as any).from("cms_navigation").upsert(
        [
          {
            location: "header",
            draft_items: headerPayload,
          },
          {
            location: "footer",
            draft_items: footerPayload,
          },
        ],
        { onConflict: "location" },
      );

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      setCmsDraftSavedSnapshot(
        createCmsDraftSnapshot(
          cmsHomeDraft,
          cmsSeoDraft,
          cmsPageDrafts,
          cmsPageSeoDrafts,
          cmsHeaderLinks,
          cmsFooterLinks,
        ),
      );
      setCmsDraftDirty(false);
      previewCommittedValuesRef.current.clear();
      setPreviewUndoHistory([]);
      setPreviewRedoHistory([]);
      setCmsSuccess("CMS draft saved.");
    } catch {
      setCmsError("Failed to save CMS draft.");
    } finally {
      setSavingCmsDraft(false);
    }
  }, [
    cmsFooterLinks,
    cmsHeaderLinks,
    cmsHomeDraft,
    cmsPageDrafts.cart,
    cmsPageDrafts.configurator,
    cmsPageDrafts.shop,
    cmsPageSeoDrafts.cart,
    cmsPageSeoDrafts.configurator,
    cmsPageSeoDrafts.shop,
    cmsSeoDraft,
    supabase,
  ]);

  const handlePublishCms = useCallback(async (skipConfirm = false) => {

    if (!skipConfirm) {
      setConfirmDialogAction("publish");
      return;
    }

    try {
      setPublishingCms(true);
      setCmsError("");
      setCmsSuccess("");

      const publishedAt = new Date().toISOString();

      const pagePayload = [
        {
          slug: "home",
          title: "Home",
          draft_content: cmsHomeDraft,
          published_content: cmsHomeDraft,
          draft_seo: cmsSeoDraft,
          published_seo: cmsSeoDraft,
          published_at: publishedAt,
        },
        {
          slug: "shop",
          title: "Shop",
          draft_content: cmsPageDrafts.shop,
          published_content: cmsPageDrafts.shop,
          draft_seo: cmsPageSeoDrafts.shop,
          published_seo: cmsPageSeoDrafts.shop,
          published_at: publishedAt,
        },
        {
          slug: "configurator",
          title: "Configurator",
          draft_content: cmsPageDrafts.configurator,
          published_content: cmsPageDrafts.configurator,
          draft_seo: cmsPageSeoDrafts.configurator,
          published_seo: cmsPageSeoDrafts.configurator,
          published_at: publishedAt,
        },
        {
          slug: "cart",
          title: "Cart",
          draft_content: cmsPageDrafts.cart,
          published_content: cmsPageDrafts.cart,
          draft_seo: cmsPageSeoDrafts.cart,
          published_seo: cmsPageSeoDrafts.cart,
          published_at: publishedAt,
        },
      ];

      const { error: pageError } = await (supabase as any)
        .from("cms_pages")
        .upsert(pagePayload, { onConflict: "slug" });

      if (pageError) {
        setCmsError(pageError.message);
        return;
      }

      const { error: navigationError } = await (supabase as any).from("cms_navigation").upsert(
        [
          {
            location: "header",
            draft_items: serializeCmsLinkRows(cmsHeaderLinks),
            published_items: serializeCmsLinkRows(cmsHeaderLinks),
          },
          {
            location: "footer",
            draft_items: serializeCmsLinkRows(cmsFooterLinks),
            published_items: serializeCmsLinkRows(cmsFooterLinks),
          },
        ],
        { onConflict: "location" },
      );

      if (navigationError) {
        setCmsError(navigationError.message);
        return;
      }

      setCmsHomePublishedAt(publishedAt);
      setCmsPagePublishedAt({
        shop: publishedAt,
        configurator: publishedAt,
        cart: publishedAt,
      });
      setCmsDraftSavedSnapshot(
        createCmsDraftSnapshot(
          cmsHomeDraft,
          cmsSeoDraft,
          cmsPageDrafts,
          cmsPageSeoDrafts,
          cmsHeaderLinks,
          cmsFooterLinks,
        ),
      );
      setCmsDraftDirty(false);
      previewCommittedValuesRef.current.clear();
      setPreviewUndoHistory([]);
      setPreviewRedoHistory([]);
      setCmsSuccess("CMS content published.");
    } catch {
      setCmsError("Failed to publish CMS content.");
    } finally {
      setPublishingCms(false);
    }
  }, [
    cmsFooterLinks,
    cmsHeaderLinks,
    cmsHomeDraft,
    cmsPageDrafts.cart,
    cmsPageDrafts.configurator,
    cmsPageDrafts.shop,
    cmsPageSeoDrafts.cart,
    cmsPageSeoDrafts.configurator,
    cmsPageSeoDrafts.shop,
    cmsSeoDraft,
    supabase,
  ]);

  const updateCmsLink = useCallback(
    (
      location: "header" | "footer",
      rowId: string,
      field: keyof Omit<CmsLinkRowState, "id">,
      value: string | boolean,
    ) => {
      const updater = (rows: CmsLinkRowState[]) =>
        rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));

      if (location === "header") {
        setCmsHeaderLinks(updater);
      } else {
        setCmsFooterLinks(updater);
      }
    },
    [],
  );

  const addCmsLink = useCallback((location: "header" | "footer") => {
    if (location === "header") {
      setCmsHeaderLinks((previous) => [...previous, createCmsLinkRow()]);
      return;
    }

    setCmsFooterLinks((previous) => [...previous, createCmsLinkRow()]);
  }, []);

  const removeCmsLink = useCallback((location: "header" | "footer", rowId: string) => {
    if (location === "header") {
      setCmsHeaderLinks((previous) => previous.filter((row) => row.id !== rowId));
      return;
    }

    setCmsFooterLinks((previous) => previous.filter((row) => row.id !== rowId));
  }, []);

  const updateCmsPageSeoField = useCallback(
    (slug: Exclude<CmsPageSlug, "home">, field: keyof CmsSeoState, value: string) => {
      setCmsPageSeoDrafts((previous) => ({
        ...previous,
        [slug]: {
          ...previous[slug],
          [field]: value,
        },
      }));
    },
    [],
  );

  const handleCmsMediaFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!session) {
        return;
      }

      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));

      if (list.length === 0) {
        setCmsMediaUploadError("No valid image files selected for CMS media.");
        return;
      }

      setCmsMediaUploadError("");
      setIsUploadingCmsMedia(true);

      try {
        const uploadErrors: string[] = [];

        for (const file of list) {
          const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
          const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
          const uniquePath = `cms/${Date.now()}-${Math.random().toString(16).slice(2)}-${baseName || "asset"}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(cmsMediaBucket)
            .upload(uniquePath, file, { upsert: false });

          if (uploadError) {
            uploadErrors.push(`${file.name}: ${uploadError.message}`);
            continue;
          }

          const insertPayload: Record<string, unknown> = {
            bucket: cmsMediaBucket,
            storage_path: uniquePath,
            mime_type: file.type || null,
            size_bytes: file.size,
            created_by: session.user.id,
          };

          let { error: insertError } = await (supabase as any).from("cms_media_assets").insert(insertPayload);

          // Older databases may not have the created_by column yet.
          if (
            insertError &&
            /created_by/i.test(insertError.message) &&
            /(column|field).*does not exist/i.test(insertError.message)
          ) {
            const { created_by, ...legacyInsertPayload } = insertPayload;
            const fallbackInsert = await (supabase as any)
              .from("cms_media_assets")
              .insert(legacyInsertPayload);
            insertError = fallbackInsert.error;
          }

          if (insertError) {
            uploadErrors.push(`${file.name}: ${insertError.message}`);
          }
        }

        if (uploadErrors.length > 0) {
          setCmsMediaUploadError(uploadErrors.join(" | "));
        }

        await fetchCmsWorkspace();
      } finally {
        setIsUploadingCmsMedia(false);
      }
    },
    [fetchCmsWorkspace, session, supabase],
  );

  const handleCmsMediaInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        await handleCmsMediaFiles(event.target.files);
      }

      event.target.value = "";
    },
    [handleCmsMediaFiles],
  );

  const handleUpdateCmsMediaAlt = useCallback(
    async (assetId: string, field: "alt" | "alt_nl", value: string) => {
      const { error: updateError } = await (supabase as any)
        .from("cms_media_assets")
        .update({ [field]: value || null })
        .eq("id", assetId);

      if (updateError) {
        setCmsMediaUploadError(updateError.message);
        return;
      }

      setCmsMediaAssets((previous) =>
        previous.map((asset) => (asset.id === assetId ? { ...asset, [field]: value } : asset)),
      );
    },
    [supabase],
  );

  const fetchProducts = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setLoadingProducts(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          "id, name, name_nl, slug, category, base_price, subtitle, subtitle_nl, description, description_nl, lead_time, lead_time_nl, images, featured, story, story_nl, default_selections, custom_options",
        )
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setProducts((data ?? []) as ProductRow[]);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [session, supabase]);

  useEffect(() => {
    if (session) {
      void fetchCategories();
      void fetchProducts();
      void fetchAppearanceSettings();
      void fetchCmsWorkspace();
    }
  }, [session, fetchAppearanceSettings, fetchCategories, fetchCmsWorkspace, fetchProducts]);

  useEffect(() => {
    if (!cmsDraftSavedSnapshot) {
      return;
    }

    const currentSnapshot = createCmsDraftSnapshot(
      cmsHomeDraft,
      cmsSeoDraft,
      cmsPageDrafts,
      cmsPageSeoDrafts,
      cmsHeaderLinks,
      cmsFooterLinks,
    );

    setCmsDraftDirty(!areCmsDraftSnapshotsEqual(currentSnapshot, cmsDraftSavedSnapshot));
  }, [
    cmsDraftSavedSnapshot,
    cmsFooterLinks,
    cmsHeaderLinks,
    cmsHomeDraft,
    cmsPageDrafts,
    cmsPageSeoDrafts,
    cmsSeoDraft,
  ]);

  const handleSaveAppearance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveAppearanceSettings(appearanceForm);
  };

  const handleOpenPreviewInNewTab = () => {
    window.open(previewPath, "_blank", "noopener,noreferrer");
  };

  const postPreviewEditorToggle = useCallback(() => {
    if (!previewIframeRef.current?.contentWindow) {
      return;
    }

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:editor:toggle",
        payload: { enabled: visualEditorEnabled },
      },
      window.location.origin,
    );
  }, [visualEditorEnabled]);

  const postPreviewGridToggle = useCallback(() => {
    if (!previewIframeRef.current?.contentWindow) {
      return;
    }

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:editor:grid-toggle",
        payload: { enabled: previewGridEnabled },
      },
      window.location.origin,
    );
  }, [previewGridEnabled]);

  const applyPreviewEditableChanges = useCallback(
    (
      changes: Partial<{
        text: string;
        color: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        backgroundColor: string;
        borderRadius: string;
        imageUrl: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }>,
      options?: {
        skipHistory?: boolean;
        targetId?: string;
      },
    ) => {
      const targetId = options?.targetId ?? selectedPreviewEditableId;

      if (!targetId || !previewIframeRef.current?.contentWindow) {
        return;
      }

      const committedValues =
        previewCommittedValuesRef.current.get(targetId) ?? previewEditableValues;
      const beforeSnapshot: PreviewEditableValues = {
        ...committedValues,
      };
      const afterSnapshot: PreviewEditableValues = {
        ...beforeSnapshot,
        ...changes,
      };

      if (!options?.skipHistory) {
        if (JSON.stringify(beforeSnapshot) !== JSON.stringify(afterSnapshot)) {
          setPreviewUndoHistory((previousHistory) => {
            const nextHistory = [
              ...previousHistory,
              {
                id: targetId,
                before: beforeSnapshot,
                after: afterSnapshot,
              },
            ];
            return nextHistory.slice(-previewEditHistoryLimit);
          });
          setPreviewRedoHistory([]);
        }
      }

      previewCommittedValuesRef.current.set(targetId, afterSnapshot);

      previewIframeRef.current.contentWindow.postMessage(
        {
          type: "cms-preview:editor:apply",
          payload: {
            id: targetId,
            changes,
          },
        },
        window.location.origin,
      );
    },
    [previewEditableValues, selectedPreviewEditableId],
  );

  const handleDeleteSelectedTextTarget = useCallback(
    (targetEditableId?: string) => {
      const editableId = targetEditableId ?? selectedPreviewEditableId;
      if (!editableId) {
        return false;
      }

      const customBlockId = parseCustomHomeBlockEditableId(editableId);
      const customBlock = customBlockId
        ? (cmsHomeDraft.customBlocks.find((block) => block.id === customBlockId) ?? null)
        : null;

      if (customBlock) {
        setPendingDeleteAction({
          mode: "custom-block",
          editableId,
          label: `this ${customBlock.type} block`,
          blockId: customBlock.id,
        });
        setConfirmDialogAction("delete");
        return true;
      }

      const binding = cmsEditableBindingMap.get(editableId) ?? null;

      if (binding && binding.section === "home") {
        setPendingDeleteAction({
          mode: "home-binding",
          editableId: binding.id,
          label: binding.label,
        });
        setConfirmDialogAction("delete");
        return true;
      }

      if (binding?.kind === "text") {
        setPendingDeleteAction({
          mode: "clear-text",
          editableId,
          label: binding.label || "this text",
        });
        setConfirmDialogAction("delete");
        return true;
      }

      return false;
    },
    [
      applyPreviewEditableChanges,
      cmsEditableBindingMap,
      cmsHomeDraft.customBlocks,
      hideCmsHomeEditable,
      removeCmsHomeCustomBlock,
      selectedPreviewEditableId,
      setCmsBindingValue,
    ],
  );

  const executePendingDeleteAction = useCallback(() => {
    if (!pendingDeleteAction) {
      return;
    }

    if (pendingDeleteAction.mode === "custom-block") {
      if (pendingDeleteAction.blockId) {
        removeCmsHomeCustomBlock(pendingDeleteAction.blockId);
      }
      return;
    }

    if (pendingDeleteAction.mode === "home-binding") {
      hideCmsHomeEditable(pendingDeleteAction.editableId);

      if (previewIframeRef.current?.contentWindow) {
        previewIframeRef.current.contentWindow.postMessage(
          {
            type: "cms-preview:editor:remove",
            payload: {
              id: pendingDeleteAction.editableId,
            },
          },
          window.location.origin,
        );
      }

      setSelectedPreviewEditableId("");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
      previewCommittedValuesRef.current.clear();
      return;
    }

    const binding = cmsEditableBindingMap.get(pendingDeleteAction.editableId);
    if (!binding || binding.kind !== "text") {
      return;
    }

    setCmsBindingValue(binding, "keyEn", "");
    if (binding.keyNl) {
      setCmsBindingValue(binding, "keyNl", "");
    }

    if (pendingDeleteAction.editableId === selectedPreviewEditableId) {
      setPreviewEditableValues((previous) => ({ ...previous, text: "" }));
    }

    applyPreviewEditableChanges(
      { text: "" },
      {
        targetId: pendingDeleteAction.editableId,
      },
    );
  }, [
    applyPreviewEditableChanges,
    cmsEditableBindingMap,
    hideCmsHomeEditable,
    pendingDeleteAction,
    removeCmsHomeCustomBlock,
    selectedPreviewEditableId,
    setCmsBindingValue,
  ]);

  const handleUndoPreviewChange = useCallback(() => {
    if (previewUndoHistory.length === 0) {
      return;
    }

    const previousEntry = previewUndoHistory[previewUndoHistory.length - 1];
    setPreviewUndoHistory((previousHistory) => previousHistory.slice(0, -1));

    if (previousEntry.hiddenEditableIdsBefore && previousEntry.hiddenEditableIdsAfter) {
      setPreviewRedoHistory((previousHistory) => {
        const nextHistory = [...previousHistory, previousEntry];
        return nextHistory.slice(-previewEditHistoryLimit);
      });

      setPreviewPath("/");
      setCmsHomeDraft((previous) => ({
        ...previous,
        hiddenEditableIds: previousEntry.hiddenEditableIdsBefore ?? previous.hiddenEditableIds,
      }));
      setSelectedPreviewEditableId(previousEntry.selectedEditableIdBefore ?? "");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
      previewCommittedValuesRef.current.clear();
      setPreviewFrameVersion((version) => version + 1);
      return;
    }

    if (previousEntry.customBlocksBefore && previousEntry.customBlocksAfter) {
      const layoutAfter: Record<string, { x: number; y: number; width: number; height: number }> = {};
      const frame = previewIframeRef.current;

      if (frame?.contentDocument) {
        for (const block of previousEntry.customBlocksAfter) {
          const editableId = `home.customBlock.${block.id}`;
          const element = frame.contentDocument.querySelector<HTMLElement>(
            `[data-cms-editable="${editableId}"]`,
          );

          if (!element) {
            continue;
          }

          const rect = element.getBoundingClientRect();
          layoutAfter[block.id] = {
            x: Number(element.dataset.cmsX ?? "0"),
            y: Number(element.dataset.cmsY ?? "0"),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        }
      }

      const structuralRedoEntry: PreviewEditHistoryEntry = {
        ...previousEntry,
        ...(Object.keys(layoutAfter).length > 0 ? { customBlockLayoutAfter: layoutAfter } : {}),
      };

      setPreviewRedoHistory((previousHistory) => {
        const nextHistory = [...previousHistory, structuralRedoEntry];
        return nextHistory.slice(-previewEditHistoryLimit);
      });

      setPreviewPath("/");
      setCmsHomeDraft((previous) => ({
        ...previous,
        customBlocks: previousEntry.customBlocksBefore ?? previous.customBlocks,
      }));
      setSelectedPreviewEditableId(previousEntry.selectedEditableIdBefore ?? "");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
      previewCommittedValuesRef.current.clear();
      return;
    }

    setPreviewRedoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, previousEntry];
      return nextHistory.slice(-previewEditHistoryLimit);
    });

    setVisualEditorEnabled(true);
    setSelectedPreviewEditableId(previousEntry.id);
    setPreviewEditableValues(previousEntry.before);
    applyPreviewEditableChanges(
      {
        text: previousEntry.before.text,
        color: previousEntry.before.color,
        fontFamily: previousEntry.before.fontFamily,
        fontSize: previousEntry.before.fontSize,
        fontWeight: previousEntry.before.fontWeight,
        backgroundColor: previousEntry.before.backgroundColor,
        borderRadius: previousEntry.before.borderRadius,
        imageUrl: previousEntry.before.imageUrl,
        x: previousEntry.before.x,
        y: previousEntry.before.y,
        width: previousEntry.before.width,
        height: previousEntry.before.height,
      },
      {
        skipHistory: true,
        targetId: previousEntry.id,
      },
    );
  }, [applyPreviewEditableChanges, previewUndoHistory]);

  const handleRedoPreviewChange = useCallback(() => {
    if (previewRedoHistory.length === 0) {
      return;
    }

    const nextEntry = previewRedoHistory[previewRedoHistory.length - 1];
    setPreviewRedoHistory((previousHistory) => previousHistory.slice(0, -1));
    setPreviewUndoHistory((previousHistory) => {
      const nextHistory = [...previousHistory, nextEntry];
      return nextHistory.slice(-previewEditHistoryLimit);
    });

    if (nextEntry.hiddenEditableIdsBefore && nextEntry.hiddenEditableIdsAfter) {
      setPreviewPath("/");
      setCmsHomeDraft((previous) => ({
        ...previous,
        hiddenEditableIds: nextEntry.hiddenEditableIdsAfter ?? previous.hiddenEditableIds,
      }));
      setSelectedPreviewEditableId(nextEntry.selectedEditableIdAfter ?? "");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
      previewCommittedValuesRef.current.clear();
      setPreviewFrameVersion((version) => version + 1);
      return;
    }

    if (nextEntry.customBlocksBefore && nextEntry.customBlocksAfter) {
      setPreviewPath("/");
      setCmsHomeDraft((previous) => ({
        ...previous,
        customBlocks: nextEntry.customBlocksAfter ?? previous.customBlocks,
      }));

      const frame = previewIframeRef.current;
      const layoutAfter = nextEntry.customBlockLayoutAfter;
      if (frame?.contentWindow && layoutAfter && Object.keys(layoutAfter).length > 0) {
        const maxAttempts = 8;

        const attemptApplyLayout = (attempt = 0) => {
          let hasPending = false;

          for (const [blockId, layout] of Object.entries(layoutAfter)) {
            const editableId = `home.customBlock.${blockId}`;
            const element = frame.contentDocument?.querySelector<HTMLElement>(
              `[data-cms-editable="${editableId}"]`,
            );

            if (!element) {
              hasPending = true;
              continue;
            }

            frame.contentWindow!.postMessage(
              {
                type: "cms-preview:editor:apply",
                payload: {
                  id: editableId,
                  changes: {
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height,
                  },
                },
              },
              window.location.origin,
            );
          }

          if (hasPending && attempt < maxAttempts) {
            window.setTimeout(() => attemptApplyLayout(attempt + 1), 120);
          }
        };

        window.setTimeout(() => attemptApplyLayout(), 80);
      }

      setSelectedPreviewEditableId(nextEntry.selectedEditableIdAfter ?? "");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
      previewCommittedValuesRef.current.clear();
      return;
    }

    setVisualEditorEnabled(true);
    setSelectedPreviewEditableId(nextEntry.id);
    setPreviewEditableValues(nextEntry.after);
    applyPreviewEditableChanges(
      {
        text: nextEntry.after.text,
        color: nextEntry.after.color,
        fontFamily: nextEntry.after.fontFamily,
        fontSize: nextEntry.after.fontSize,
        fontWeight: nextEntry.after.fontWeight,
        backgroundColor: nextEntry.after.backgroundColor,
        borderRadius: nextEntry.after.borderRadius,
        imageUrl: nextEntry.after.imageUrl,
        x: nextEntry.after.x,
        y: nextEntry.after.y,
        width: nextEntry.after.width,
        height: nextEntry.after.height,
      },
      {
        skipHistory: true,
        targetId: nextEntry.id,
      },
    );
  }, [applyPreviewEditableChanges, previewRedoHistory]);

  const handleQuickEditorImageUpload = useCallback(
    async (file: File) => {
      setQuickImageUploadFeedback(`Selected: ${file.name}`);

      if (!session) {
        setCmsMediaUploadError("Please sign in before uploading media.");
        setQuickImageUploadFeedback("Upload failed: please sign in before uploading media.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setCmsMediaUploadError("Only image files can be uploaded in Quick Editor.");
        setQuickImageUploadFeedback("Upload failed: only image files are allowed.");
        return;
      }

      setCmsMediaUploadError("");
      setQuickImageUploadFeedback(`Uploading ${file.name}...`);
      setIsQuickImageUploading(true);

      try {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
        const uniquePath = `cms/${Date.now()}-${Math.random().toString(16).slice(2)}-${baseName || "asset"}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(cmsMediaBucket)
          .upload(uniquePath, file, { upsert: false });

        if (uploadError) {
          setCmsMediaUploadError(uploadError.message);
          setQuickImageUploadFeedback(`Upload failed: ${uploadError.message}`);
          return;
        }

        const insertPayload: Record<string, unknown> = {
          bucket: cmsMediaBucket,
          storage_path: uniquePath,
          mime_type: file.type || null,
          size_bytes: file.size,
          created_by: session.user.id,
        };

        let { error: insertError } = await (supabase as any).from("cms_media_assets").insert(insertPayload);

        // Older databases may not have the created_by column yet.
        if (
          insertError &&
          /created_by/i.test(insertError.message) &&
          /(column|field).*does not exist/i.test(insertError.message)
        ) {
          const { created_by, ...legacyInsertPayload } = insertPayload;
          const fallbackInsert = await (supabase as any)
            .from("cms_media_assets")
            .insert(legacyInsertPayload);
          insertError = fallbackInsert.error;
        }

        if (insertError) {
          setCmsMediaUploadError(insertError.message);
          setQuickImageUploadFeedback(`Upload failed: ${insertError.message}`);
          return;
        }

        const publicUrl = supabase.storage.from(cmsMediaBucket).getPublicUrl(uniquePath).data.publicUrl;

        setPreviewEditableValues((previous) => ({
          ...previous,
          imageUrl: publicUrl,
        }));
        applyPreviewEditableChanges({ imageUrl: publicUrl });

        syncSelectedImageUrlToDraft(publicUrl);

        await fetchCmsWorkspace();
        setQuickImageUploadFeedback("Upload complete: image replaced successfully.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Image upload failed unexpectedly.";
        setCmsMediaUploadError(message);
        setQuickImageUploadFeedback(`Upload failed: ${message}`);
      } finally {
        setIsQuickImageUploading(false);
      }
    },
    [
      applyPreviewEditableChanges,
      fetchCmsWorkspace,
      session,
      syncSelectedImageUrlToDraft,
      supabase,
    ],
  );

  const handleQuickEditorImageInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleQuickEditorImageUpload(file);
      }

      event.target.value = "";
    },
    [handleQuickEditorImageUpload],
  );

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const modifierPressed = event.ctrlKey || event.metaKey;

      if (key === "delete" || key === "backspace") {
        if (handleDeleteSelectedTextTarget()) {
          event.preventDefault();
          return;
        }
      }

      if (!modifierPressed) {
        return;
      }

      if (key === "s") {
        if (activeAdminTab === "appearance") {
          event.preventDefault();
          void handleSaveCmsDraft();
        }
        return;
      }

      const isUndo = key === "z" && !event.shiftKey;
      const isRedo = (key === "z" && event.shiftKey) || key === "y";

      if (isUndo) {
        if (activeAdminTab === "appearance") {
          event.preventDefault();
          handleUndoAppearanceChange();
          return;
        }

        if (!visualEditorEnabled) {
          return;
        }

        event.preventDefault();
        handleUndoPreviewChange();
        return;
      }

      if (isRedo) {
        if (activeAdminTab === "appearance") {
          event.preventDefault();
          handleRedoAppearanceChange();
          return;
        }

        if (!visualEditorEnabled) {
          return;
        }

        event.preventDefault();
        handleRedoPreviewChange();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeAdminTab,
    handleSaveCmsDraft,
    handleRedoAppearanceChange,
    handleRedoPreviewChange,
    handleUndoAppearanceChange,
    handleUndoPreviewChange,
    handleDeleteSelectedTextTarget,
    visualEditorEnabled,
  ]);

  const postPreviewDraft = useCallback(() => {
    if (!previewIframeRef.current?.contentWindow) {
      return;
    }

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:update",
        payload: appearanceForm,
      },
      window.location.origin,
    );

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:editor:toggle",
        payload: { enabled: visualEditorEnabled },
      },
      window.location.origin,
    );

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:editor:grid-toggle",
        payload: { enabled: previewGridEnabled },
      },
      window.location.origin,
    );

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:home-custom-blocks",
        payload: {
          blocks: cmsHomeDraft.customBlocks.map((block) => ({
            id: block.id,
            type: block.type,
            text: block.text,
            imageUrl: block.imageUrl,
            alt: block.alt,
            backgroundColor: block.backgroundColor,
            backgroundShape: block.backgroundShape,
          })),
        },
      },
      window.location.origin,
    );

    previewIframeRef.current.contentWindow.postMessage(
      {
        type: "cms-preview:hidden-editables",
        payload: {
          ids: cmsHomeDraft.hiddenEditableIds,
        },
      },
      window.location.origin,
    );
  }, [
    appearanceForm,
    cmsHomeDraft.customBlocks,
    cmsHomeDraft.hiddenEditableIds,
    previewGridEnabled,
    visualEditorEnabled,
  ]);

  useEffect(() => {
    if (activeAdminTab === "appearance") {
      postPreviewDraft();
    }
  }, [activeAdminTab, postPreviewDraft]);

  useEffect(() => {
    postPreviewEditorToggle();
  }, [postPreviewEditorToggle]);

  useEffect(() => {
    postPreviewGridToggle();
  }, [postPreviewGridToggle]);

  useEffect(() => {
    if (!visualEditorEnabled || !selectedPreviewEditableId || !previewIframeRef.current?.contentWindow) {
      return;
    }

    const timeout = window.setTimeout(() => {
      previewIframeRef.current?.contentWindow?.postMessage(
        {
          type: "cms-preview:editor:select",
          payload: { id: selectedPreviewEditableId },
        },
        window.location.origin,
      );
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [previewPath, selectedPreviewEditableId, visualEditorEnabled]);

  useEffect(() => {
    if (!visualEditorEnabled) {
      setSelectedPreviewEditableId("");
      setSelectedPreviewCapabilities(null);
      setPreviewEditableValues(createInitialPreviewEditableValues());
    }
  }, [visualEditorEnabled]);

  useEffect(() => {
    if (!previewFullscreen) {
      setHomeBlocksMenuOpen(false);
      return;
    }

    const margin = 16;
    const defaultWidth = 420;
    const defaultHeight = Math.min(560, window.innerHeight - 120);
    setPreviewFullscreenInspectorSize({
      width: defaultWidth,
      height: defaultHeight,
    });
    setPreviewFullscreenInspectorPosition({
      left: Math.max(margin, window.innerWidth - defaultWidth - margin * 2),
      top: 72,
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewFullscreen]);

  useEffect(() => {
    if (!previewFullscreen) {
      return;
    }

    const margin = 16;
    const minWidth = 320;
    const minHeight = 220;

    const handlePointerMove = (event: PointerEvent) => {
      if (fullscreenInspectorDragRef.current) {
        const drag = fullscreenInspectorDragRef.current;
        const nextLeft = drag.startLeft + (event.clientX - drag.startClientX);
        const nextTop = drag.startTop + (event.clientY - drag.startClientY);

        const maxLeft = window.innerWidth - drag.width - margin;
        const maxTop = window.innerHeight - drag.height - margin;

        setPreviewFullscreenInspectorPosition({
          left: Math.min(Math.max(margin, nextLeft), Math.max(margin, maxLeft)),
          top: Math.min(Math.max(margin, nextTop), Math.max(margin, maxTop)),
        });
      }

      if (fullscreenInspectorResizeRef.current) {
        const resize = fullscreenInspectorResizeRef.current;
        const nextWidth = resize.startWidth + (event.clientX - resize.startClientX);
        const nextHeight = resize.startHeight + (event.clientY - resize.startClientY);
        const maxWidth = window.innerWidth - resize.left - margin;
        const maxHeight = window.innerHeight - resize.top - margin;

        setPreviewFullscreenInspectorSize({
          width: Math.min(Math.max(minWidth, nextWidth), Math.max(minWidth, maxWidth)),
          height: Math.min(Math.max(minHeight, nextHeight), Math.max(minHeight, maxHeight)),
        });
      }
    };

    const handlePointerUp = () => {
      fullscreenInspectorDragRef.current = null;
      fullscreenInspectorResizeRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [previewFullscreen]);

  const handleFullscreenInspectorDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    fullscreenInspectorDragRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: previewFullscreenInspectorPosition.left,
      startTop: previewFullscreenInspectorPosition.top,
      width: previewFullscreenInspectorSize.width,
      height: previewFullscreenInspectorSize.height,
    };
  };

  const handleFullscreenInspectorResizeStart = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    fullscreenInspectorResizeRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startWidth: previewFullscreenInspectorSize.width,
      startHeight: previewFullscreenInspectorSize.height,
      left: previewFullscreenInspectorPosition.left,
      top: previewFullscreenInspectorPosition.top,
    };
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data) {
        return;
      }

      const message = event.data as
        | {
            type: "cms-preview:selected";
            payload: {
              id: string;
              tagName: string;
              capabilities: PreviewEditableCapabilities;
              values: PreviewEditableValues;
            };
          }
        | {
            type: "cms-preview:position";
            payload: {
              id: string;
              x: number;
              y: number;
              width?: number;
              height?: number;
            };
          }
        | {
            type: "cms-preview:editor:delete-selected";
            payload: {
              id: string;
            };
          };

      if (message.type === "cms-preview:selected") {
        previewCommittedValuesRef.current.set(message.payload.id, message.payload.values);
        setSelectedPreviewEditableId(message.payload.id);
        setSelectedPreviewTagName(message.payload.tagName);
        setSelectedPreviewCapabilities(message.payload.capabilities);
        setPreviewEditableValues(message.payload.values);
        return;
      }

      if (message.type === "cms-preview:position" && message.payload.id === selectedPreviewEditableId) {
        const committed =
          previewCommittedValuesRef.current.get(message.payload.id) ?? createInitialPreviewEditableValues();

        if (
          !previewMoveHistoryDraftRef.current ||
          previewMoveHistoryDraftRef.current.id !== message.payload.id
        ) {
          previewMoveHistoryDraftRef.current = {
            id: message.payload.id,
            before: { ...committed },
            latestX: message.payload.x,
            latestY: message.payload.y,
            latestWidth: message.payload.width ?? committed.width,
            latestHeight: message.payload.height ?? committed.height,
          };
        } else {
          previewMoveHistoryDraftRef.current.latestX = message.payload.x;
          previewMoveHistoryDraftRef.current.latestY = message.payload.y;
          previewMoveHistoryDraftRef.current.latestWidth =
            message.payload.width ?? previewMoveHistoryDraftRef.current.latestWidth;
          previewMoveHistoryDraftRef.current.latestHeight =
            message.payload.height ?? previewMoveHistoryDraftRef.current.latestHeight;
        }

        if (previewMoveHistoryTimerRef.current !== null) {
          window.clearTimeout(previewMoveHistoryTimerRef.current);
        }

        previewMoveHistoryTimerRef.current = window.setTimeout(() => {
          const draft = previewMoveHistoryDraftRef.current;
          if (!draft) {
            return;
          }

          const afterSnapshot: PreviewEditableValues = {
            ...draft.before,
            x: draft.latestX,
            y: draft.latestY,
            width: draft.latestWidth,
            height: draft.latestHeight,
          };

          if (
            draft.before.x !== afterSnapshot.x ||
            draft.before.y !== afterSnapshot.y ||
            draft.before.width !== afterSnapshot.width ||
            draft.before.height !== afterSnapshot.height
          ) {
            setPreviewUndoHistory((previousHistory) => {
              const nextHistory = [
                ...previousHistory,
                {
                  id: draft.id,
                  before: draft.before,
                  after: afterSnapshot,
                },
              ];
              return nextHistory.slice(-previewEditHistoryLimit);
            });
            setPreviewRedoHistory([]);
          }

          previewCommittedValuesRef.current.set(draft.id, afterSnapshot);
          previewMoveHistoryDraftRef.current = null;
          previewMoveHistoryTimerRef.current = null;
        }, 180);

        setPreviewEditableValues((previous) => ({
          ...previous,
          x: message.payload.x,
          y: message.payload.y,
          width: message.payload.width ?? previous.width,
          height: message.payload.height ?? previous.height,
        }));
        return;
      }

      if (message.type === "cms-preview:editor:delete-selected") {
        handleDeleteSelectedTextTarget(message.payload.id);
      }
    };

    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
      if (previewMoveHistoryTimerRef.current !== null) {
        window.clearTimeout(previewMoveHistoryTimerRef.current);
      }
      previewMoveHistoryTimerRef.current = null;
      previewMoveHistoryDraftRef.current = null;
    };
  }, [handleDeleteSelectedTextTarget, selectedPreviewEditableId]);

  useEffect(() => {
    if (!selectedPreviewEditableId) {
      setSelectedPreviewTagName("");
    }
  }, [selectedPreviewEditableId]);

  useEffect(() => {
    if (!selectedCmsBinding && !selectedNavigationRow && !selectedCustomHomeBlock) {
      return;
    }

    setPreviewEditableValues((previous) => ({
      ...previous,
      ...(selectedCmsBinding?.kind === "text"
        ? { text: getCmsBindingValue(selectedCmsBinding, "keyEn") }
        : {}),
      ...(selectedCmsBinding?.kind === "image"
        ? { imageUrl: getCmsBindingValue(selectedCmsBinding, "keyEn") }
        : {}),
      ...(selectedNavigationRow ? { text: selectedNavigationRow.label } : {}),
      ...(selectedCustomHomeBlock?.type === "text" ? { text: selectedCustomHomeBlock.text } : {}),
      ...(selectedCustomHomeBlock?.type === "image" ? { imageUrl: selectedCustomHomeBlock.imageUrl } : {}),
    }));
  }, [getCmsBindingValue, selectedCmsBinding, selectedCustomHomeBlock, selectedNavigationRow]);

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = categoryForm.name.trim();
    const nameNl = categoryForm.nameNl.trim();
    const slug = slugify(categoryForm.slug || categoryForm.name);
    const description = categoryForm.description.trim();
    const descriptionNl = categoryForm.descriptionNl.trim();

    if (!name || !slug) {
      setCategoryError("Category name and slug are required.");
      return;
    }

    const duplicateSlug = categoryRows.find(
      (category) => category.slug === slug && category.id !== editingCategoryId,
    );

    if (duplicateSlug) {
      setCategoryError(
        `A category with slug "${slug}" already exists. Please choose a different slug.`,
      );
      return;
    }

    try {
      setManagingCategories(true);
      setCategoryError("");

      if (editingCategoryId) {
        const { error: updateError } = await (supabase as any)
          .from("categories")
          .update({
            name,
            name_nl: nameNl || null,
            slug,
            description,
            description_nl: descriptionNl || null,
            hero_image: categoryForm.heroImage.trim(),
          })
          .eq("id", editingCategoryId);

        if (updateError) {
          setCategoryError(updateError.message);
          return;
        }
      } else {
        const { error: insertError } = await (supabase as any).from("categories").insert({
          name,
          name_nl: nameNl || null,
          slug,
          description,
          description_nl: descriptionNl || null,
          hero_image: categoryForm.heroImage.trim(),
        });

        if (insertError) {
          setCategoryError(insertError.message);
          return;
        }
      }

      setEditingCategoryId(null);
      setCategoryForm(createInitialCategoryState());
      await fetchCategories();
      setProductForm((previous) => ({ ...previous, category: slug }));
    } catch {
      setCategoryError("Failed to create category.");
    } finally {
      setManagingCategories(false);
    }
  };

  const handleDeleteCategory = async (category: CategoryRow) => {
    const inUse = products.some((product) => product.category === category.slug);

    if (inUse) {
      setCategoryError("Cannot delete a category that is still used by one or more products.");
      return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    try {
      setManagingCategories(true);
      setCategoryError("");

      const { error: deleteError } = await (supabase as any)
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        setCategoryError(deleteError.message);
        return;
      }

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setCategoryForm(createInitialCategoryState());
      }

      await fetchCategories();
    } catch {
      setCategoryError("Failed to delete category.");
    } finally {
      setManagingCategories(false);
    }
  };

  const handleEditCategory = (category: CategoryRow) => {
    setEditingCategoryId(category.id);
    setCategoryError("");
    setCategoryHeroUploadError("");
    setCategoryForm({
      name: category.name,
      nameNl: category.name_nl ?? "",
      slug: category.slug,
      description: category.description,
      descriptionNl: category.description_nl ?? "",
      heroImage: category.hero_image,
    });
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryError("");
    setCategoryHeroUploadError("");
    setCategoryForm(createInitialCategoryState());
  };

  const handleCategoryHeroFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setCategoryHeroUploadError("Please drop an image file (JPG, PNG, WEBP, or GIF).");
      return;
    }

    setCategoryHeroUploadError("");
    setIsUploadingCategoryHero(true);

    try {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
      const uniquePath = `categories/${Date.now()}-${Math.random().toString(16).slice(2)}-${fileName || "hero"}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(productImageBucket)
        .upload(uniquePath, file, { upsert: false });

      if (uploadError) {
        setCategoryHeroUploadError(`${uploadError.message} (Bucket: "${productImageBucket}")`);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(productImageBucket)
        .getPublicUrl(uniquePath);

      if (!publicData?.publicUrl) {
        setCategoryHeroUploadError("Image uploaded, but no public URL was returned.");
        return;
      }

      setCategoryForm((previous) => ({
        ...previous,
        heroImage: publicData.publicUrl,
      }));
    } finally {
      setIsUploadingCategoryHero(false);
    }
  };

  const handleCategoryHeroInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleCategoryHeroFile(file);
    }
    event.target.value = "";
  };

  const handleCategoryHeroDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingCategoryHero(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleCategoryHeroFile(file);
    }
  };

  useEffect(() => {
    if (!session) {
      setIsOwner(null);
      setOwnerCheckError("");
      return;
    }

    let active = true;

    const checkOwnerMembership = async () => {
      setOwnerCheckError("");

      const { data, error: membershipError } = await supabase
        .from("admin_users" as never)
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (membershipError) {
        setIsOwner(false);
        setOwnerCheckError(membershipError.message);
        return;
      }

      setIsOwner(Boolean((data as { user_id?: string } | null)?.user_id));
    };

    void checkOwnerMembership();

    return () => {
      active = false;
    };
  }, [session, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setError("");
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id);

      if (!deleteError) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        setError(deleteError.message);
      }
    } catch {
      setError("Error deleting product");
    }
  };

  const updateDefaultSelectionRow = (
    id: string,
    field: "optionId" | "choiceId",
    value: string,
  ) => {
    setDefaultSelectionRows((previousRows) =>
      previousRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addDefaultSelectionRow = () => {
    setDefaultSelectionRows((previousRows) => [...previousRows, createDefaultSelectionRow()]);
  };

  const removeDefaultSelectionRow = (id: string) => {
    setDefaultSelectionRows((previousRows) => {
      const nextRows = previousRows.filter((row) => row.id !== id);
      return nextRows.length > 0 ? nextRows : [createDefaultSelectionRow()];
    });
  };

  const addStandardOptionRow = (optionId: string) => {
    setDefaultSelectionRows((previousRows) => {
      const exists = previousRows.some(
        (row) => row.optionId.trim().toLowerCase() === optionId.toLowerCase(),
      );

      if (exists) {
        return previousRows;
      }

      return [...previousRows, createDefaultSelectionRowForOption(optionId)];
    });
  };

  const restoreStandardOptionRows = () => {
    setDefaultSelectionRows((previousRows) => {
      const presentOptionIds = new Set(
        previousRows.map((row) => row.optionId.trim().toLowerCase()),
      );

      const missingStandardRows = standardOptionIds
        .filter((optionId) => !presentOptionIds.has(optionId))
        .map((optionId) => createDefaultSelectionRowForOption(optionId));

      return missingStandardRows.length > 0
        ? [...previousRows, ...missingStandardRows]
        : previousRows;
    });
  };

  const addStandardOptionId = () => {
    const normalized = normalizeOptionId(newStandardOptionId);

    if (!normalized) {
      return;
    }

    setStandardOptionIds((previousIds) => {
      if (previousIds.includes(normalized)) {
        return previousIds;
      }

      return [...previousIds, normalized];
    });

    addStandardOptionRow(normalized);
    setNewStandardOptionId("");
  };

  const removeStandardOptionId = (optionId: string) => {
    setStandardOptionIds((previousIds) => previousIds.filter((id) => id !== optionId));
  };

  const resetEditorState = () => {
    setEditingProductId(null);
    setProductForm(createInitialProductState());
    setDefaultSelectionRows(createStandardDefaultSelectionRows(standardOptionIds));
    setCustomOptionsForm([]);
    setSlugEdited(false);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleEditProduct = (product: ProductRow) => {
    const normalizedCategory =
      categoryRows.find((row) => row.slug === product.category)?.slug ??
      categoryRows[0]?.slug ??
      "tables";

    const imageList = Array.isArray(product.images)
      ? product.images.filter((entry): entry is string => typeof entry === "string")
      : [];

    const defaultSelectionsRaw =
      product.default_selections && typeof product.default_selections === "object"
        ? (product.default_selections as Record<string, unknown>)
        : {};

    const defaultSelectionEntries = Object.entries(defaultSelectionsRaw).map(([key, value]) => [
      key,
      typeof value === "string" ? value : String(value),
    ]);

    const customOptionsRaw = Array.isArray(product.custom_options)
      ? (product.custom_options as Array<Record<string, unknown>>)
      : [];

    const mappedCustomOptions: CustomOptionForm[] = customOptionsRaw
      .map((option) => {
        const id = typeof option.id === "string" ? option.id : "";
        const label = typeof option.label === "string" ? option.label : "";
        const labelNl = typeof option.labelNl === "string" ? option.labelNl : "";
        const helperText = typeof option.helperText === "string" ? option.helperText : "";
        const helperTextNl =
          typeof option.helperTextNl === "string" ? option.helperTextNl : "";
        const type =
          option.type === "dropdown" || option.type === "toggle" || option.type === "swatch"
            ? option.type
            : "dropdown";
        const choicesRaw = Array.isArray(option.choices)
          ? (option.choices as Array<Record<string, unknown>>)
          : [];
        const choices = choicesRaw
          .map((choice) => ({
            formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            id: typeof choice.id === "string" ? choice.id : "",
            label: typeof choice.label === "string" ? choice.label : "",
            labelNl: typeof choice.labelNl === "string" ? choice.labelNl : "",
            priceModifier: toDecimalInputValue(
              typeof choice.priceModifier === "number" || typeof choice.priceModifier === "string"
                ? choice.priceModifier
                : null,
              "0",
            ),
            swatchHex: typeof choice.swatchHex === "string" ? choice.swatchHex : "",
          }))
          .filter((choice) => choice.id || choice.label);

        return {
          formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          id,
          label,
          labelNl,
          helperText,
          helperTextNl,
          type: type as OptionInputType,
          choices: choices.length > 0 ? choices : [createCustomChoiceForm()],
        };
      })
      .filter((option) => option.id || option.label || option.choices.some((choice) => choice.id));

    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      nameNl: product.name_nl ?? "",
      slug: product.slug,
      category: normalizedCategory,
      basePrice: toDecimalInputValue(product.base_price),
      subtitle: product.subtitle,
      subtitleNl: product.subtitle_nl ?? "",
      description: product.description,
      descriptionNl: product.description_nl ?? "",
      leadTime: product.lead_time,
      leadTimeNl: product.lead_time_nl ?? "",
      images: imageList.join("\n"),
      featured: Boolean(product.featured),
      story: product.story ?? "",
      storyNl: product.story_nl ?? "",
    });
    setDefaultSelectionRows(
      defaultSelectionEntries.length > 0
        ? defaultSelectionEntries.map(([optionId, choiceId]) => ({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            optionId,
            choiceId,
          }))
        : createStandardDefaultSelectionRows(standardOptionIds),
    );
    setCustomOptionsForm(mappedCustomOptions);
    setSlugEdited(true);
    setCreateError("");
    setCreateSuccess("");
  };

  const updateCustomOptionField = (
    optionFormId: string,
    field: "id" | "label" | "labelNl" | "helperText" | "helperTextNl" | "type",
    value: string,
  ) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) =>
        option.formId === optionFormId
          ? {
              ...option,
              [field]: field === "type" ? (value as OptionInputType) : value,
            }
          : option,
      ),
    );
  };

  const addCustomOption = () => {
    setCustomOptionsForm((previous) => [...previous, createCustomOptionForm()]);
  };

  const removeCustomOption = (optionFormId: string) => {
    setCustomOptionsForm((previous) => previous.filter((option) => option.formId !== optionFormId));
  };

  const updateCustomChoiceField = (
    optionFormId: string,
    choiceFormId: string,
    field: "id" | "label" | "labelNl" | "priceModifier" | "swatchHex",
    value: string,
  ) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) => {
        if (option.formId !== optionFormId) {
          return option;
        }

        return {
          ...option,
          choices: option.choices.map((choice) =>
            choice.formId === choiceFormId ? { ...choice, [field]: value } : choice,
          ),
        };
      }),
    );
  };

  const addCustomChoice = (optionFormId: string) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) =>
        option.formId === optionFormId
          ? { ...option, choices: [...option.choices, createCustomChoiceForm()] }
          : option,
      ),
    );
  };

  const removeCustomChoice = (optionFormId: string, choiceFormId: string) => {
    setCustomOptionsForm((previous) =>
      previous.map((option) => {
        if (option.formId !== optionFormId) {
          return option;
        }

        const nextChoices = option.choices.filter((choice) => choice.formId !== choiceFormId);

        return {
          ...option,
          choices: nextChoices.length > 0 ? nextChoices : [createCustomChoiceForm()],
        };
      }),
    );
  };

  const appendImageUrls = (urls: string[]) => {
    if (urls.length === 0) {
      return;
    }

    setProductForm((previous) => {
      const existing = previous.images
        .split(/\r?\n|,/) 
        .map((entry) => entry.trim())
        .filter(Boolean);

      const merged = [...existing, ...urls];

      return {
        ...previous,
        images: merged.join("\n"),
      };
    });
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (list.length === 0) {
      setImageUploadError("No image files detected. Please drop JPG, PNG, WEBP, or GIF files.");
      return;
    }

    setImageUploadError("");
    setIsUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];
      const failedUploads: string[] = [];

      for (const file of list) {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
        const uniquePath = `products/${Date.now()}-${Math.random().toString(16).slice(2)}-${fileName || "image"}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(productImageBucket)
          .upload(uniquePath, file, { upsert: false });

        if (uploadError) {
          failedUploads.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from(productImageBucket)
          .getPublicUrl(uniquePath);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        } else {
          failedUploads.push(`${file.name}: uploaded but public URL could not be generated.`);
        }
      }

      appendImageUrls(uploadedUrls);

      if (failedUploads.length > 0) {
        setImageUploadError(
          `Some uploads failed. ${failedUploads.join(" | ")} (Bucket: \"${productImageBucket}\")`,
        );
      }
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await handleImageFiles(event.target.files);
    }

    event.target.value = "";
  };

  const handleImageDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImages(false);

    if (event.dataTransfer.files) {
      await handleImageFiles(event.dataTransfer.files);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOwner === false) {
      setCreateError(
        "This user is not allowed to create products. Add this user id to public.admin_users in Supabase.",
      );
      setCreateSuccess("");
      return;
    }

    const basePriceNumber = parseDecimalInput(productForm.basePrice);
    if (basePriceNumber === null || basePriceNumber <= 0) {
      setCreateError("Base price must be a valid number greater than 0 (e.g. 1499,50).");
      setCreateSuccess("");
      return;
    }

    const name = productForm.name.trim();
    const nameNl = productForm.nameNl.trim();
    const slug = slugify(productForm.slug);
    const subtitle = productForm.subtitle.trim();
    const subtitleNl = productForm.subtitleNl.trim();
    const description = productForm.description.trim();
    const descriptionNl = productForm.descriptionNl.trim();
    const leadTime = productForm.leadTime.trim();
    const leadTimeNl = productForm.leadTimeNl.trim();

    if (!name || !slug || !subtitle || !description || !leadTime) {
      setCreateError("Please fill all required product fields.");
      setCreateSuccess("");
      return;
    }

    const images = productForm.images
      .split(/\r?\n|,/) 
      .map((entry) => entry.trim())
      .filter(Boolean);

    const defaultSelections = Object.fromEntries(
      defaultSelectionRows
        .map((row) => [row.optionId.trim(), row.choiceId.trim()] as const)
        .filter(([optionId, choiceId]) => optionId.length > 0 && choiceId.length > 0),
    );

    const customOptionsPayload: Array<{
      id: string;
      label: string;
      labelNl?: string;
      helperText?: string;
      helperTextNl?: string;
      type: OptionInputType;
      choices: Array<{
        id: string;
        label: string;
        labelNl?: string;
        priceModifier: number;
        swatchHex?: string;
      }>;
    }> = [];

    for (const option of customOptionsForm) {
      const normalizedId = normalizeOptionId(option.id);
      const label = option.label.trim();
      const labelNl = option.labelNl.trim();
      const helperText = option.helperText.trim();
      const helperTextNl = option.helperTextNl.trim();

      const hasAnyData =
        normalizedId.length > 0 ||
        label.length > 0 ||
        labelNl.length > 0 ||
        helperText.length > 0 ||
        helperTextNl.length > 0 ||
        option.choices.some(
          (choice) =>
            choice.id.trim().length > 0 ||
            choice.label.trim().length > 0 ||
            choice.labelNl.trim().length > 0 ||
            choice.swatchHex.trim().length > 0 ||
            choice.priceModifier.trim().length > 0,
        );

      if (!hasAnyData) {
        continue;
      }

      const choices = option.choices
        .map((choice) => {
          const choiceId = normalizeOptionId(choice.id);
          const choiceLabel = choice.label.trim();
          const choiceLabelNl = choice.labelNl.trim();

          if (!choiceId || !choiceLabel) {
            return null;
          }

          return {
            id: choiceId,
            label: choiceLabel,
            ...(choiceLabelNl ? { labelNl: choiceLabelNl } : {}),
            priceModifier: parseDecimalInput(choice.priceModifier) ?? 0,
            ...(choice.swatchHex.trim() ? { swatchHex: choice.swatchHex.trim() } : {}),
          };
        })
        .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice));

      if (!normalizedId || !label || choices.length === 0) {
        setCreateError(
          "Each custom option needs an option id, label, and at least one complete choice (id + label).",
        );
        setCreateSuccess("");
        return;
      }

      customOptionsPayload.push({
        id: normalizedId,
        label,
        ...(labelNl ? { labelNl } : {}),
        ...(helperText ? { helperText } : {}),
        ...(helperTextNl ? { helperTextNl } : {}),
        type: option.type,
        choices,
      });
    }

    try {
      setCreatingProduct(true);
      setCreateError("");
      setCreateSuccess("");

      const productPayload = {
        slug,
        name,
        name_nl: nameNl || null,
        subtitle,
        subtitle_nl: subtitleNl || null,
        description,
        description_nl: descriptionNl || null,
        category: productForm.category,
        base_price: basePriceNumber,
        lead_time: leadTime,
        lead_time_nl: leadTimeNl || null,
        images,
        featured: productForm.featured,
        story: productForm.story.trim() || null,
        story_nl: productForm.storyNl.trim() || null,
        default_selections: defaultSelections,
        custom_options: customOptionsPayload,
      };

      if (editingProductId) {
        const { error: updateError } = await (supabase as any)
          .from("products")
          .update(productPayload)
          .eq("id", editingProductId);

        if (updateError) {
          setCreateError(updateError.message);
          return;
        }

        setCreateSuccess("Product updated successfully.");
      } else {
        const { error: insertError } = await (supabase as any)
          .from("products")
          .insert(productPayload);

        if (insertError) {
          setCreateError(insertError.message);
          return;
        }

        setCreateSuccess("Product created successfully.");
      }

      setProductForm(createInitialProductState());
      setDefaultSelectionRows(createStandardDefaultSelectionRows(standardOptionIds));
      setCustomOptionsForm([]);
      setSlugEdited(false);
      setEditingProductId(null);
      await fetchProducts();
    } catch {
      setCreateError("Failed to create product.");
    } finally {
      setCreatingProduct(false);
    }
  };

  if (!sessionChecked) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-[var(--color-ink)]">Product Manager</h1>
            <p className="mt-2 text-[var(--color-muted)]">Manage products stored in Supabase</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeAdminTab === "catalog" ? "primary" : "secondary"}
            onClick={() => setActiveAdminTab("catalog")}
          >
            Catalog
          </Button>
          <Button
            type="button"
            variant={activeAdminTab === "appearance" ? "primary" : "secondary"}
            onClick={() => setActiveAdminTab("appearance")}
          >
            Appearance
          </Button>
        </div>

        {activeAdminTab === "appearance" ? (
          <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Website Appearance Studio</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Live consumer preview with manual publish. Open Controls to edit settings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                  value={previewPath}
                  onChange={(event) => setPreviewPath(event.target.value)}
                >
                  <option value="/">Home</option>
                  <option value="/shop">Shop</option>
                  <option value="/shop/tables">Category: Tables</option>
                  <option value="/configurator">Configurator</option>
                  <option value="/cart">Cart</option>
                </select>
                <Button type="button" variant="secondary" onClick={() => setAppearanceDrawerOpen(true)}>
                  Open Controls
                </Button>
                <Button type="button" variant="secondary" onClick={handleOpenPreviewInNewTab}>
                  Open Preview Tab
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setAppearanceDrawerOpen(false);
                    setPreviewFullscreenInspectorOpen(true);
                    setPreviewFullscreen((previous) => {
                      const next = !previous;
                      if (next) {
                        setVisualEditorEnabled(true);
                      }
                      return next;
                    });
                  }}
                >
                  {previewFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">Visual Overlay Editor</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Toggle edit mode, click an outlined element in preview, then edit style/content live.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      cmsDraftDirty
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {cmsDraftDirty ? "Unsaved changes" : "All changes saved"}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUndoPreviewChange}
                    disabled={previewUndoHistory.length === 0}
                    aria-label="Undo"
                    title="Undo"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M9 7 5 11l4 4" />
                      <path d="M5 11h8a6 6 0 0 1 0 12h-1" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRedoPreviewChange}
                    disabled={previewRedoHistory.length === 0}
                    aria-label="Redo"
                    title="Redo"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m15 7 4 4-4 4" />
                      <path d="M19 11h-8a6 6 0 0 0 0 12h1" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant={visualEditorEnabled ? "primary" : "secondary"}
                    onClick={() => setVisualEditorEnabled((previous) => !previous)}
                  >
                    {visualEditorEnabled ? "Disable Overlay" : "Enable Overlay"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSaveCmsDraft()}
                    disabled={loadingCms || savingCmsDraft || publishingCms}
                  >
                    {savingCmsDraft ? "Saving Draft..." : "Save Draft"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDiscardCmsDraftChanges()}
                    disabled={!canDiscardCmsChanges || loadingCms || savingCmsDraft || publishingCms}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handlePublishCms()}
                    disabled={loadingCms || savingCmsDraft || publishingCms}
                  >
                    {publishingCms ? "Publishing..." : "Publish"}
                  </Button>
                </div>
              </div>

              {cmsError ? (
                <p className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{cmsError}</p>
              ) : null}

              {cmsSuccess ? (
                <p className="mt-3 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">{cmsSuccess}</p>
              ) : null}

              <div className="mt-4 rounded-xl border border-black/10 bg-[var(--color-neutral-100)]/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Selected target
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                  {selectedCmsBinding?.label || selectedNavigationBinding?.label || selectedCustomHomeBlockLabel || selectedPreviewEditableId || "Nothing selected yet"}
                </p>

                {selectedPreviewEditableId && selectedPreviewCapabilities ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedPreviewCapabilities.text ? (
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          Text (Live Preview)
                        </label>
                        <textarea
                          className={fieldClassName}
                          rows={3}
                          value={previewEditableValues.text}
                          onChange={(event) =>
                            setPreviewEditableValues((previous) => ({
                              ...previous,
                              text: event.target.value,
                            }))
                          }
                          onBlur={() => applyPreviewEditableChanges({ text: previewEditableValues.text })}
                        />
                      </div>
                    ) : null}

                    {selectedNavigationBinding && selectedNavigationRow ? (
                      <>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Navigation Label EN
                          </label>
                          <input
                            className={fieldClassName}
                            value={selectedNavigationRow.label}
                            onChange={(event) => {
                              const value = event.target.value;
                              updateSelectedNavigationRow("label", value);
                              setPreviewEditableValues((previous) => ({ ...previous, text: value }));
                              applyPreviewEditableChanges({ text: value });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Navigation Label NL
                          </label>
                          <input
                            className={fieldClassName}
                            value={selectedNavigationRow.labelNl}
                            onChange={(event) => updateSelectedNavigationRow("labelNl", event.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Link URL
                          </label>
                          <input
                            className={fieldClassName}
                            value={selectedNavigationRow.href}
                            onChange={(event) => updateSelectedNavigationRow("href", event.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            <input
                              type="checkbox"
                              checked={selectedNavigationRow.external}
                              onChange={(event) => updateSelectedNavigationRow("external", event.target.checked)}
                            />
                            External Link
                          </label>
                        </div>
                      </>
                    ) : null}

                    {selectedCmsBinding?.kind === "text" || selectedCustomHomeBlock?.type === "text" ? (
                      <>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Draft English
                          </label>
                          <input
                            className={fieldClassName}
                            value={
                              selectedCmsBinding?.kind === "text"
                                ? getCmsBindingValue(selectedCmsBinding, "keyEn")
                                : selectedCustomHomeBlock?.text ?? ""
                            }
                            onChange={(event) => {
                              const value = event.target.value;
                              if (selectedCmsBinding?.kind === "text") {
                                setCmsBindingValue(selectedCmsBinding, "keyEn", value);
                              }

                              if (selectedCustomHomeBlock?.type === "text") {
                                updateCmsHomeCustomBlock(selectedCustomHomeBlock.id, "text", value);
                              }

                              setPreviewEditableValues((previous) => ({ ...previous, text: value }));
                              applyPreviewEditableChanges({ text: value });
                            }}
                          />
                        </div>
                        {selectedCmsBinding?.keyNl ? (
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                              Draft Nederlands
                            </label>
                            <input
                              className={fieldClassName}
                              value={getCmsBindingValue(selectedCmsBinding, "keyNl")}
                              onChange={(event) => {
                                setCmsBindingValue(selectedCmsBinding, "keyNl", event.target.value);
                              }}
                            />
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {selectedPreviewCapabilities.color ? (
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          {selectedPreviewTagName === "BUTTON" ? "Button text color" : "Text color"}
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            className="h-10 w-14 rounded-xl border border-black/10 bg-white p-1"
                            value={toColorInputValue(previewEditableValues.color)}
                            onChange={(event) => {
                              const value = event.target.value;
                              setPreviewEditableValues((previous) => ({ ...previous, color: value }));
                            }}
                            onPointerUp={() =>
                              applyColorFieldChange("color", previewEditableValues.color, applyPreviewEditableChanges)
                            }
                            onBlur={() =>
                              applyColorFieldChange("color", previewEditableValues.color, applyPreviewEditableChanges)
                            }
                          />
                          <button
                            type="button"
                            className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]"
                            onClick={() => saveEditorColor(previewEditableValues.color)}
                          >
                            Save
                          </button>
                          <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
                            {savedEditorColors.map((savedColor) => (
                              <button
                                key={`quick-text-${savedColor}`}
                                type="button"
                                title={savedColor}
                                className="h-6 w-6 rounded-md border border-black/15"
                                style={{ backgroundColor: savedColor }}
                                onClick={() => {
                                  setPreviewEditableValues((previous) => ({ ...previous, color: savedColor }));
                                  applyPreviewEditableChanges({ color: savedColor });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {selectedPreviewCapabilities.background ? (
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          {selectedPreviewTagName === "BUTTON" ? "Button color" : "Background color"}
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            className="h-10 w-14 rounded-xl border border-black/10 bg-white p-1"
                            value={toColorInputValue(
                              isTransparentBackgroundColor(previewEditableValues.backgroundColor)
                                ? "#ffffff"
                                : previewEditableValues.backgroundColor,
                            )}
                            disabled={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                            onChange={(event) => {
                              const value = event.target.value;
                              setPreviewEditableValues((previous) => ({ ...previous, backgroundColor: value }));
                            }}
                            onPointerUp={() =>
                              applyColorFieldChange(
                                "backgroundColor",
                                previewEditableValues.backgroundColor,
                                applyPreviewEditableChanges,
                              )
                            }
                            onBlur={() =>
                              applyColorFieldChange(
                                "backgroundColor",
                                previewEditableValues.backgroundColor,
                                applyPreviewEditableChanges,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]"
                            onClick={() => saveEditorColor(previewEditableValues.backgroundColor)}
                            disabled={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                          >
                            Save
                          </button>
                          <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
                            {savedEditorColors.map((savedColor) => (
                              <button
                                key={`quick-bg-${savedColor}`}
                                type="button"
                                title={savedColor}
                                className="h-6 w-6 rounded-md border border-black/15"
                                style={{ backgroundColor: savedColor }}
                                onClick={() => {
                                  setPreviewEditableValues((previous) => ({
                                    ...previous,
                                    backgroundColor: savedColor,
                                  }));
                                  applyPreviewEditableChanges({ backgroundColor: savedColor });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <input
                            type="checkbox"
                            checked={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                            onChange={(event) => {
                              const value = event.target.checked ? "transparent" : "#ffffff";
                              setPreviewEditableValues((previous) => ({ ...previous, backgroundColor: value }));
                              applyPreviewEditableChanges({ backgroundColor: value });
                            }}
                          />
                          Invisible background
                        </label>
                      </div>
                    ) : null}

                    {selectedPreviewCapabilities.shape ? (
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          Border radius (e.g. 24px)
                        </label>
                        <input
                          className={fieldClassName}
                          value={previewEditableValues.borderRadius}
                          onChange={(event) =>
                            setPreviewEditableValues((previous) => ({
                              ...previous,
                              borderRadius: event.target.value,
                            }))
                          }
                          onBlur={() =>
                            applyPreviewEditableChanges({ borderRadius: previewEditableValues.borderRadius })
                          }
                        />
                      </div>
                    ) : null}

                    {selectedPreviewCapabilities.image ? (
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          Image URL
                        </label>
                        <input
                          className={fieldClassName}
                          value={previewEditableValues.imageUrl}
                          onChange={(event) =>
                            setPreviewEditableValues((previous) => ({
                              ...previous,
                              imageUrl: event.target.value,
                            }))
                          }
                          onBlur={() => {
                            applyPreviewEditableChanges({ imageUrl: previewEditableValues.imageUrl });
                            syncSelectedImageUrlToDraft(previewEditableValues.imageUrl);
                          }}
                        />

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Pick from CMS Media
                          </p>
                          {cmsMediaAssets.length === 0 ? (
                            <p className="mt-2 text-xs text-[var(--color-muted)]">
                              No media assets yet. Upload images in the Media Library section below.
                            </p>
                          ) : (
                            <div className="mt-2 grid max-h-52 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-black/10 p-2 md:grid-cols-6">
                              {cmsMediaAssets.slice(0, 36).map((asset) => {
                                const publicUrl = getCmsMediaPublicUrl(asset);

                                return (
                                  <button
                                    key={asset.id}
                                    type="button"
                                    className="overflow-hidden rounded-lg border border-black/10 bg-white"
                                    onClick={() => {
                                      setPreviewEditableValues((previous) => ({
                                        ...previous,
                                        imageUrl: publicUrl,
                                      }));
                                      applyPreviewEditableChanges({ imageUrl: publicUrl });
                                      syncSelectedImageUrlToDraft(publicUrl);
                                    }}
                                    title={asset.storage_path}
                                  >
                                    <img src={publicUrl} alt={asset.alt || asset.storage_path} className="h-16 w-full object-cover" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {selectedPreviewCapabilities.location ? (
                      <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            X offset
                          </label>
                          <input
                            type="number"
                            className={fieldClassName}
                            value={previewEditableValues.x}
                            onChange={(event) => {
                              const value = Number(event.target.value || 0);
                              setPreviewEditableValues((previous) => ({ ...previous, x: value }));
                              applyPreviewEditableChanges({ x: value, y: previewEditableValues.y });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Y offset
                          </label>
                          <input
                            type="number"
                            className={fieldClassName}
                            value={previewEditableValues.y}
                            onChange={(event) => {
                              const value = Number(event.target.value || 0);
                              setPreviewEditableValues((previous) => ({ ...previous, y: value }));
                              applyPreviewEditableChanges({ x: previewEditableValues.x, y: value });
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {selectedCustomHomeBlock || selectedCmsBinding?.section === "home" || selectedCmsBinding?.kind === "text" ? (
                      <div className="mt-4 pt-3 border-t border-black/10">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDeleteSelectedTextTarget}
                          className="w-full"
                        >
                          {selectedCustomHomeBlock || selectedCmsBinding?.section === "home"
                            ? "Delete Block"
                            : "Clear Text"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Turn on overlay and click a highlighted element in the preview to inspect editable properties.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-5 rounded-2xl border border-black/10 bg-[var(--color-neutral-100)]/55 p-5">
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">Home Custom Blocks</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      Add and remove optional text and image blocks on the homepage.
                    </p>
                  </div>
                  {!previewFullscreen ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={() => addCmsHomeCustomBlock("text")}>
                        Add Text Block
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => addCmsHomeCustomBlock("image")}>
                        Add Image Block
                      </Button>
                    </div>
                  ) : null}
                </div>

                {cmsHomeDraft.customBlocks.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-black/20 px-4 py-3 text-sm text-[var(--color-muted)]">
                    No custom blocks yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {cmsHomeDraft.customBlocks.map((block, index) => (
                      <div key={block.id} className="rounded-xl border border-black/10 bg-[var(--color-neutral-100)]/50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                            Block {index + 1}: {block.type}
                          </p>
                          <Button type="button" variant="ghost" onClick={() => removeCmsHomeCustomBlock(block.id)}>
                            Remove
                          </Button>
                        </div>

                        {block.type === "text" ? (
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Text EN
                              </label>
                              <textarea
                                className={fieldClassName}
                                rows={3}
                                value={block.text}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "text", event.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Text NL
                              </label>
                              <textarea
                                className={fieldClassName}
                                rows={3}
                                value={block.textNl}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "textNl", event.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Background Color
                              </label>
                              <input
                                type="color"
                                className={`${fieldClassName} h-12`}
                                value={getColorPickerDraftValue(
                                  `cms.custom-block.${block.id}.backgroundColor`,
                                  block.backgroundColor === "transparent"
                                    ? "#ffffff"
                                    : block.backgroundColor || "#ffffff",
                                )}
                                disabled={block.backgroundColor === "transparent"}
                                onChange={(event) =>
                                  stageColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    event.target.value,
                                  )
                                }
                                onPointerUp={() =>
                                  commitColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    block.backgroundColor === "transparent"
                                      ? "#ffffff"
                                      : block.backgroundColor || "#ffffff",
                                    (value) => updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                  )
                                }
                                onBlur={() =>
                                  commitColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    block.backgroundColor === "transparent"
                                      ? "#ffffff"
                                      : block.backgroundColor || "#ffffff",
                                    (value) => updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                  )
                                }
                              />
                              <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <input
                                  type="checkbox"
                                  checked={block.backgroundColor === "transparent"}
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(
                                      block.id,
                                      "backgroundColor",
                                      event.target.checked ? "transparent" : "#ffffff",
                                    )
                                  }
                                />
                                Invisible background
                              </label>
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Background Shape
                              </label>
                              <select
                                className={fieldClassName}
                                value={block.backgroundShape}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "backgroundShape", event.target.value)
                                }
                              >
                                <option value="rounded-square">Rounded Square</option>
                                <option value="pill">Pill</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div
                              className="md:col-span-2 rounded-xl border border-dashed border-black/20 bg-white px-4 py-4 text-center text-xs text-[var(--color-muted)]"
                              onDragOver={(event) => {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = "copy";
                              }}
                              onDrop={(event) => {
                                event.preventDefault();
                                const file = event.dataTransfer.files?.[0];
                                if (file) {
                                  void handleCustomBlockImageUpload(block.id, file);
                                }
                              }}
                            >
                              <p className="font-semibold text-[var(--color-ink)]">
                                Drag and drop an image here
                              </p>
                              <p className="mt-1">or click to upload</p>
                              <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-black/10 bg-[var(--color-neutral-100)] px-3 py-2 text-xs font-medium text-[var(--color-ink)]">
                                Upload image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                      void handleCustomBlockImageUpload(block.id, file);
                                    }
                                    event.target.value = "";
                                  }}
                                />
                              </label>
                              {uploadingCustomBlockId === block.id ? (
                                <p className="mt-2 text-xs text-[var(--color-muted)]">Uploading image...</p>
                              ) : null}
                              {customBlockUploadError ? (
                                <p className="mt-2 text-xs text-red-600">{customBlockUploadError}</p>
                              ) : null}
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Image URL
                              </label>
                              <input
                                className={fieldClassName}
                                value={block.imageUrl}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "imageUrl", event.target.value)
                                }
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Alt EN
                              </label>
                              <input
                                className={fieldClassName}
                                value={block.alt}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "alt", event.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Alt NL
                              </label>
                              <input
                                className={fieldClassName}
                                value={block.altNl}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "altNl", event.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Background Color
                              </label>
                              <input
                                type="color"
                                className={`${fieldClassName} h-12`}
                                value={getColorPickerDraftValue(
                                  `cms.custom-block.${block.id}.backgroundColor`,
                                  block.backgroundColor === "transparent"
                                    ? "#ffffff"
                                    : block.backgroundColor || "#ffffff",
                                )}
                                disabled={block.backgroundColor === "transparent"}
                                onChange={(event) =>
                                  stageColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    event.target.value,
                                  )
                                }
                                onPointerUp={() =>
                                  commitColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    block.backgroundColor === "transparent"
                                      ? "#ffffff"
                                      : block.backgroundColor || "#ffffff",
                                    (value) => updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                  )
                                }
                                onBlur={() =>
                                  commitColorPickerValue(
                                    `cms.custom-block.${block.id}.backgroundColor`,
                                    block.backgroundColor === "transparent"
                                      ? "#ffffff"
                                      : block.backgroundColor || "#ffffff",
                                    (value) => updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                  )
                                }
                              />
                              <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <input
                                  type="checkbox"
                                  checked={block.backgroundColor === "transparent"}
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(
                                      block.id,
                                      "backgroundColor",
                                      event.target.checked ? "transparent" : "#ffffff",
                                    )
                                  }
                                />
                                Invisible background
                              </label>
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Background Shape
                              </label>
                              <select
                                className={fieldClassName}
                                value={block.backgroundShape}
                                onChange={(event) =>
                                  updateCmsHomeCustomBlock(block.id, "backgroundShape", event.target.value)
                                }
                              >
                                <option value="rounded-square">Rounded Square</option>
                                <option value="pill">Pill</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">Global Editor</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    Control your whole site look from one place: colors, typography, button shape, and spacing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUndoAppearanceChange}
                    disabled={appearanceUndoHistory.length === 0}
                    aria-label="Undo"
                    title="Undo style change"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M9 7 5 11l4 4" />
                      <path d="M5 11h8a6 6 0 0 1 0 12h-1" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRedoAppearanceChange}
                    disabled={appearanceRedoHistory.length === 0}
                    aria-label="Redo"
                    title="Redo style change"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m15 7 4 4-4 4" />
                      <path d="M19 11h-8a6 6 0 0 0 0 12h1" />
                    </svg>
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleRestoreAppearanceDefault}>
                    Restore Saved
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void saveAppearanceSettings(appearanceForm)}
                    disabled={savingAppearance || !appearanceDirty}
                  >
                    {savingAppearance ? "Saving..." : "Save Global Style"}
                  </Button>
                </div>
              </div>

              {appearanceError ? (
                <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{appearanceError}</p>
              ) : null}

              {appearanceSuccess ? (
                <p className="rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">{appearanceSuccess}</p>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Background
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue("appearance.colorBg", appearanceForm.colorBg)}
                    onChange={(event) => stageColorPickerValue("appearance.colorBg", event.target.value)}
                    onPointerUp={() =>
                      commitColorPickerValue("appearance.colorBg", appearanceForm.colorBg, (value) =>
                        updateAppearanceField("colorBg", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue("appearance.colorBg", appearanceForm.colorBg, (value) =>
                        updateAppearanceField("colorBg", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Main Text
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue("appearance.colorText", appearanceForm.colorText)}
                    onChange={(event) => stageColorPickerValue("appearance.colorText", event.target.value)}
                    onPointerUp={() =>
                      commitColorPickerValue("appearance.colorText", appearanceForm.colorText, (value) =>
                        updateAppearanceField("colorText", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue("appearance.colorText", appearanceForm.colorText, (value) =>
                        updateAppearanceField("colorText", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Button Color
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue("appearance.colorButtonBg", appearanceForm.colorButtonBg)}
                    onChange={(event) =>
                      stageColorPickerValue("appearance.colorButtonBg", event.target.value)
                    }
                    onPointerUp={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonBg",
                        appearanceForm.colorButtonBg,
                        (value) => updateAppearanceField("colorButtonBg", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonBg",
                        appearanceForm.colorButtonBg,
                        (value) => updateAppearanceField("colorButtonBg", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Button Shape
                  </p>
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={appearanceForm.buttonRadius}
                    onChange={(event) => updateAppearanceField("buttonRadius", event.target.value)}
                  >
                    <option value="9999px">Pill</option>
                    <option value="16px">Rounded</option>
                    <option value="8px">Soft</option>
                    <option value="0px">Square</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Logo Color
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue("appearance.logoColor", appearanceForm.logoColor)}
                    onChange={(event) => stageColorPickerValue("appearance.logoColor", event.target.value)}
                    onPointerUp={() =>
                      commitColorPickerValue("appearance.logoColor", appearanceForm.logoColor, (value) =>
                        updateAppearanceField("logoColor", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue("appearance.logoColor", appearanceForm.logoColor, (value) =>
                        updateAppearanceField("logoColor", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Button Hover
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue(
                      "appearance.colorButtonBgHover",
                      appearanceForm.colorButtonBgHover,
                    )}
                    onChange={(event) =>
                      stageColorPickerValue("appearance.colorButtonBgHover", event.target.value)
                    }
                    onPointerUp={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonBgHover",
                        appearanceForm.colorButtonBgHover,
                        (value) => updateAppearanceField("colorButtonBgHover", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonBgHover",
                        appearanceForm.colorButtonBgHover,
                        (value) => updateAppearanceField("colorButtonBgHover", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Button Text
                  </p>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-black/10"
                    value={getColorPickerDraftValue(
                      "appearance.colorButtonText",
                      appearanceForm.colorButtonText,
                    )}
                    onChange={(event) =>
                      stageColorPickerValue("appearance.colorButtonText", event.target.value)
                    }
                    onPointerUp={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonText",
                        appearanceForm.colorButtonText,
                        (value) => updateAppearanceField("colorButtonText", value),
                      )
                    }
                    onBlur={() =>
                      commitColorPickerValue(
                        "appearance.colorButtonText",
                        appearanceForm.colorButtonText,
                        (value) => updateAppearanceField("colorButtonText", value),
                      )
                    }
                  />
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Logo URL
                  </p>
                  <input
                    type="url"
                    className={`${fieldClassName} mt-2`}
                    placeholder="https://example.com/logo.svg"
                    value={appearanceForm.logoUrl}
                    onChange={(event) => updateAppearanceField("logoUrl", event.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Body Font
                  </p>
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={appearanceForm.fontBody}
                    onChange={(event) =>
                      updateAppearanceField("fontBody", event.target.value as FontPreset)
                    }
                  >
                    <option value="manrope">Manrope</option>
                    <option value="jakarta">Jakarta Sans</option>
                    <option value="system">System UI</option>
                    <option value="serif">Serif</option>
                  </select>
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Heading Font
                  </p>
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={appearanceForm.fontHeading}
                    onChange={(event) =>
                      updateAppearanceField("fontHeading", event.target.value as FontPreset)
                    }
                  >
                    <option value="jakarta">Jakarta Sans</option>
                    <option value="manrope">Manrope</option>
                    <option value="system">System UI</option>
                    <option value="serif">Serif</option>
                  </select>
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Layout Density
                  </p>
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={appearanceForm.layoutMode}
                    onChange={(event) =>
                      updateAppearanceField("layoutMode", event.target.value as LayoutMode)
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="balanced">Balanced</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </label>

                <label className="rounded-xl border border-black/10 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    Content Width
                  </p>
                  <select
                    className={`${fieldClassName} mt-2`}
                    value={appearanceForm.containerWidth}
                    onChange={(event) =>
                      updateAppearanceField("containerWidth", event.target.value as ContainerWidthMode)
                    }
                  >
                    <option value="narrow">Narrow</option>
                    <option value="standard">Standard</option>
                    <option value="wide">Wide</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Need deeper controls?
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Open Controls for advanced tokens, color schemes, and legacy CMS settings.
                </p>
                <div className="mt-3">
                  <Button type="button" variant="secondary" onClick={() => setAppearanceDrawerOpen(true)}>
                    Open Advanced Controls
                  </Button>
                </div>
              </div>
            </div>

            {loadingAppearance ? (
              <p className="mt-4 text-sm text-[var(--color-muted)]">Loading appearance settings...</p>
            ) : null}

            <div
              className={
                previewFullscreen
                  ? "fixed inset-4 z-[70] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
                  : "mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white"
              }
            >
              {previewFullscreen ? (
                <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] leading-[1.05]">
                    <span className="block">Fullscreen</span>
                    <span className="block">Editor</span>
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 w-10 px-0 py-0"
                        onClick={() => setHomeBlocksMenuOpen((previous) => !previous)}
                        aria-label="Open block actions"
                        title="Add Blocks"
                      >
                        <span aria-hidden="true" className="flex h-4 w-4 flex-col items-center justify-center gap-0.5">
                          <span className="block h-0.5 w-4 rounded-full bg-current" />
                          <span className="block h-0.5 w-4 rounded-full bg-current" />
                          <span className="block h-0.5 w-4 rounded-full bg-current" />
                        </span>
                      </Button>

                      <div
                        className={`absolute left-0 z-[90] mt-2 w-20 origin-top overflow-hidden rounded-lg border border-black/10 bg-[var(--color-neutral-100)]/95 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur transition duration-200 ${
                          homeBlocksMenuOpen
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none -translate-y-1 opacity-0"
                        }`}
                      >
                        <button
                          type="button"
                          className={`w-full border-b border-black/10 px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.09em] transition ${
                            visualEditorEnabled
                              ? "bg-[var(--color-wood-dark)] text-white hover:bg-[var(--color-wood)]"
                              : "bg-transparent text-[var(--color-ink)] hover:bg-white/70"
                          }`}
                          title={visualEditorEnabled ? "Disable selection overlay" : "Enable selection overlay"}
                          onClick={() => {
                            setVisualEditorEnabled((previous) => !previous);
                          }}
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          className={`w-full border-b border-black/10 px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.09em] transition ${
                            previewGridEnabled
                              ? "bg-[var(--color-wood-dark)] text-white hover:bg-[var(--color-wood)]"
                              : "bg-transparent text-[var(--color-ink)] hover:bg-white/70"
                          }`}
                          title={previewGridEnabled ? "Disable grid snap" : "Enable grid snap"}
                          onClick={() => {
                            setPreviewGridEnabled((previous) => !previous);
                          }}
                        >
                          Grid
                        </button>
                        <button
                          type="button"
                          className="w-full border-b border-black/10 px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.09em] text-[var(--color-ink)] transition hover:bg-white/70"
                          title="Add text block"
                          onClick={() => {
                            addCmsHomeCustomBlock("text");
                          }}
                        >
                          TXT +
                        </button>
                        <button
                          type="button"
                          className="w-full px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.09em] text-[var(--color-ink)] transition hover:bg-white/70"
                          title="Add image block"
                          onClick={() => {
                            addCmsHomeCustomBlock("image");
                          }}
                        >
                          IMG +
                        </button>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        cmsDraftDirty
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {cmsDraftDirty ? "Unsaved" : "Saved"}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleUndoPreviewChange}
                      disabled={previewUndoHistory.length === 0}
                      aria-label="Undo"
                      title="Undo"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M9 7 5 11l4 4" />
                        <path d="M5 11h8a6 6 0 0 1 0 12h-1" />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRedoPreviewChange}
                      disabled={previewRedoHistory.length === 0}
                      aria-label="Redo"
                      title="Redo"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m15 7 4 4-4 4" />
                        <path d="M19 11h-8a6 6 0 0 0 0 12h1" />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void handleSaveCmsDraft()}
                      disabled={loadingCms || savingCmsDraft || publishingCms}
                    >
                      {savingCmsDraft ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleDiscardCmsDraftChanges()}
                      disabled={!canDiscardCmsChanges || loadingCms || savingCmsDraft || publishingCms}
                    >
                      Discard
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handlePublishCms()}
                      disabled={loadingCms || savingCmsDraft || publishingCms}
                    >
                      {publishingCms ? "Publishing..." : "Publish"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setPreviewFullscreenInspectorOpen((previous) => !previous)
                      }
                    >
                      {previewFullscreenInspectorOpen ? "Hide Panel" : "Show Panel"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setPreviewFullscreen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : null}
              <iframe
                key={`${previewPath}-${previewFrameVersion}`}
                ref={previewIframeRef}
                src={previewPath}
                title="Live storefront preview"
                className={previewFullscreen ? "h-[calc(100vh-4.5rem)] w-full border-0" : "h-[78vh] w-full border-0"}
                onLoad={postPreviewDraft}
              />

              {previewFullscreen && previewFullscreenInspectorOpen ? (
                <aside
                  className="absolute z-[80] overflow-auto rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur"
                  style={{
                    left: `${previewFullscreenInspectorPosition.left}px`,
                    top: `${previewFullscreenInspectorPosition.top}px`,
                    width: `${previewFullscreenInspectorSize.width}px`,
                    height: `${previewFullscreenInspectorSize.height}px`,
                  }}
                >
                  <div
                    className="-m-2 mb-2 cursor-move rounded-xl border border-black/10 bg-white/85 px-3 py-2"
                    onPointerDown={handleFullscreenInspectorDragStart}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Quick Editor (Drag Me)
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                      {selectedCmsBinding?.label || selectedNavigationBinding?.label || selectedCustomHomeBlockLabel || selectedPreviewEditableId || "Select an element in preview"}
                    </p>
                  </div>

                  {selectedPreviewEditableId && selectedPreviewCapabilities ? (
                    <div className="mt-3 grid gap-3 pb-6">
                      {selectedPreviewCapabilities.text ? (
                        <>
                          <textarea
                            className={fieldClassName}
                            rows={2}
                            value={previewEditableValues.text}
                            onChange={(event) =>
                              setPreviewEditableValues((previous) => ({
                                ...previous,
                                text: event.target.value,
                              }))
                            }
                            onBlur={() => applyPreviewEditableChanges({ text: previewEditableValues.text })}
                          />

                          {selectedPreviewCapabilities.color ? (
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                {selectedPreviewTagName === "BUTTON" ? "Button text color" : "Text color"}
                              </label>
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  type="color"
                                  className="h-10 w-14 rounded-xl border border-black/10 bg-white p-1"
                                  value={toColorInputValue(previewEditableValues.color)}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    setPreviewEditableValues((previous) => ({ ...previous, color: value }));
                                  }}
                                  onPointerUp={() =>
                                    applyColorFieldChange(
                                      "color",
                                      previewEditableValues.color,
                                      applyPreviewEditableChanges,
                                    )
                                  }
                                  onBlur={() =>
                                    applyColorFieldChange(
                                      "color",
                                      previewEditableValues.color,
                                      applyPreviewEditableChanges,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]"
                                  onClick={() => saveEditorColor(previewEditableValues.color)}
                                >
                                  Save
                                </button>
                                <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
                                  {savedEditorColors.map((savedColor) => (
                                    <button
                                      key={`fullscreen-text-${savedColor}`}
                                      type="button"
                                      title={savedColor}
                                      className="h-6 w-6 rounded-md border border-black/15"
                                      style={{ backgroundColor: savedColor }}
                                      onClick={() => {
                                        setPreviewEditableValues((previous) => ({ ...previous, color: savedColor }));
                                        applyPreviewEditableChanges({ color: savedColor });
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                              Font family
                            </label>
                            <select
                              className={fieldClassName}
                              value={previewEditableValues.fontFamily || ""}
                              onChange={(event) => {
                                const value = event.target.value;
                                setPreviewEditableValues((previous) => ({ ...previous, fontFamily: value }));
                                applyPreviewEditableChanges({ fontFamily: value });
                              }}
                            >
                              <option value="">Keep current</option>
                              <option value="var(--font-manrope), sans-serif">Manrope</option>
                              <option value="var(--font-jakarta), sans-serif">Plus Jakarta Sans</option>
                              <option value="Georgia, serif">Georgia</option>
                              <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace">
                                Monospace
                              </option>
                            </select>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Font size
                              </label>
                              <input
                                className={fieldClassName}
                                value={previewEditableValues.fontSize}
                                placeholder="e.g. 20px"
                                onChange={(event) =>
                                  setPreviewEditableValues((previous) => ({
                                    ...previous,
                                    fontSize: event.target.value,
                                  }))
                                }
                                onBlur={() =>
                                  applyPreviewEditableChanges({ fontSize: previewEditableValues.fontSize })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                                Font weight
                              </label>
                              <select
                                className={fieldClassName}
                                value={previewEditableValues.fontWeight || ""}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setPreviewEditableValues((previous) => ({ ...previous, fontWeight: value }));
                                  applyPreviewEditableChanges({ fontWeight: value });
                                }}
                              >
                                <option value="">Keep current</option>
                                <option value="400">Regular (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semibold (600)</option>
                                <option value="700">Bold (700)</option>
                              </select>
                            </div>
                          </div>
                        </>
                      ) : null}

                      {selectedNavigationBinding && selectedNavigationRow ? (
                        <>
                          <input
                            className={fieldClassName}
                            value={selectedNavigationRow.label}
                            placeholder="Navigation label EN"
                            onChange={(event) => {
                              const value = event.target.value;
                              updateSelectedNavigationRow("label", value);
                              setPreviewEditableValues((previous) => ({ ...previous, text: value }));
                              applyPreviewEditableChanges({ text: value });
                            }}
                          />
                          <input
                            className={fieldClassName}
                            value={selectedNavigationRow.labelNl}
                            placeholder="Navigation label NL"
                            onChange={(event) => updateSelectedNavigationRow("labelNl", event.target.value)}
                          />
                        </>
                      ) : null}

                      {selectedCmsBinding?.kind === "text" || selectedCustomHomeBlock?.type === "text" ? (
                        <>
                          <input
                            className={fieldClassName}
                            value={
                              selectedCmsBinding?.kind === "text"
                                ? getCmsBindingValue(selectedCmsBinding, "keyEn")
                                : selectedCustomHomeBlock?.text ?? ""
                            }
                            placeholder="Draft English"
                            onChange={(event) => {
                              const value = event.target.value;
                              if (selectedCmsBinding?.kind === "text") {
                                setCmsBindingValue(selectedCmsBinding, "keyEn", value);
                              }

                              if (selectedCustomHomeBlock?.type === "text") {
                                updateCmsHomeCustomBlock(selectedCustomHomeBlock.id, "text", value);
                              }

                              setPreviewEditableValues((previous) => ({ ...previous, text: value }));
                              applyPreviewEditableChanges({ text: value });
                            }}
                          />
                          {selectedCmsBinding?.keyNl ? (
                            <input
                              className={fieldClassName}
                              value={getCmsBindingValue(selectedCmsBinding, "keyNl")}
                              placeholder="Draft Nederlands"
                              onChange={(event) => setCmsBindingValue(selectedCmsBinding, "keyNl", event.target.value)}
                            />
                          ) : null}
                        </>
                      ) : null}

                      {selectedPreviewCapabilities.background ? (
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            {selectedPreviewTagName === "BUTTON" ? "Button color" : "Background color"}
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="color"
                              className="h-10 w-14 rounded-xl border border-black/10 bg-white p-1"
                              value={toColorInputValue(
                                isTransparentBackgroundColor(previewEditableValues.backgroundColor)
                                  ? "#ffffff"
                                  : previewEditableValues.backgroundColor,
                              )}
                              disabled={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                              onChange={(event) => {
                                const value = event.target.value;
                                setPreviewEditableValues((previous) => ({ ...previous, backgroundColor: value }));
                              }}
                              onPointerUp={() =>
                                applyColorFieldChange(
                                  "backgroundColor",
                                  previewEditableValues.backgroundColor,
                                  applyPreviewEditableChanges,
                                )
                              }
                              onBlur={() =>
                                applyColorFieldChange(
                                  "backgroundColor",
                                  previewEditableValues.backgroundColor,
                                  applyPreviewEditableChanges,
                                )
                              }
                            />
                            <button
                              type="button"
                              className="rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]"
                              onClick={() => saveEditorColor(previewEditableValues.backgroundColor)}
                              disabled={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                            >
                              Save
                            </button>
                            <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
                              {savedEditorColors.map((savedColor) => (
                                <button
                                  key={`fullscreen-bg-${savedColor}`}
                                  type="button"
                                  title={savedColor}
                                  className="h-6 w-6 rounded-md border border-black/15"
                                  style={{ backgroundColor: savedColor }}
                                  onClick={() => {
                                    setPreviewEditableValues((previous) => ({
                                      ...previous,
                                      backgroundColor: savedColor,
                                    }));
                                    applyPreviewEditableChanges({ backgroundColor: savedColor });
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                            <input
                              type="checkbox"
                              checked={isTransparentBackgroundColor(previewEditableValues.backgroundColor)}
                              onChange={(event) => {
                                const value = event.target.checked ? "transparent" : "#ffffff";
                                setPreviewEditableValues((previous) => ({ ...previous, backgroundColor: value }));
                                applyPreviewEditableChanges({ backgroundColor: value });
                              }}
                            />
                            Invisible background
                          </label>
                        </div>
                      ) : null}

                      {selectedPreviewCapabilities.shape ? (
                        <div className="grid gap-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                            Background shape
                          </label>
                          <select
                            className={fieldClassName}
                            value={getPreviewShapeOption(previewEditableValues.borderRadius)}
                            onChange={(event) => {
                              const option = event.target.value;
                              if (option === "custom") {
                                return;
                              }

                              const radius = option === "pill" ? "9999px" : "1.5rem";
                              setPreviewEditableValues((previous) => ({ ...previous, borderRadius: radius }));
                              applyPreviewEditableChanges({ borderRadius: radius });
                            }}
                          >
                            <option value="rounded-square">Rounded Square</option>
                            <option value="pill">Pill</option>
                            <option value="custom">Custom Radius</option>
                          </select>
                          <input
                            className={fieldClassName}
                            value={previewEditableValues.borderRadius}
                            placeholder="e.g. 24px"
                            onChange={(event) => {
                              const value = event.target.value;
                              setPreviewEditableValues((previous) => ({
                                ...previous,
                                borderRadius: value,
                              }));
                              applyPreviewEditableChanges({ borderRadius: value });
                            }}
                          />
                        </div>
                      ) : null}

                      {selectedPreviewCapabilities.image ? (
                        <div className="space-y-3">
                          <div
                            className="rounded-xl border border-dashed border-black/20 bg-[var(--color-neutral-100)]/60 px-4 py-4 text-center text-xs text-[var(--color-muted)]"
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "copy";
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              const file = event.dataTransfer.files?.[0];
                              if (file) {
                                void handleQuickEditorImageUpload(file);
                              }
                            }}
                          >
                            <p className="font-semibold text-[var(--color-ink)]">
                              Drag an image here to replace
                            </p>
                            <p className="mt-1">or click to upload from your device</p>
                            <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[var(--color-ink)]">
                              Upload image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleQuickEditorImageInputChange}
                              />
                            </label>
                            {quickImageUploadFeedback ? (
                              <p className="mt-2 text-xs text-[var(--color-muted)]">{quickImageUploadFeedback}</p>
                            ) : null}
                            {isQuickImageUploading ? (
                              <p className="mt-2 text-xs text-[var(--color-muted)]">Uploading image...</p>
                            ) : null}
                            {cmsMediaUploadError ? (
                              <p className="mt-2 text-xs text-red-600">{cmsMediaUploadError}</p>
                            ) : null}
                          </div>

                          <input
                            className={fieldClassName}
                            value={previewEditableValues.imageUrl}
                            placeholder="Image URL"
                            onChange={(event) =>
                              setPreviewEditableValues((previous) => ({
                                ...previous,
                                imageUrl: event.target.value,
                              }))
                            }
                            onBlur={() => {
                              applyPreviewEditableChanges({ imageUrl: previewEditableValues.imageUrl });
                              syncSelectedImageUrlToDraft(previewEditableValues.imageUrl);
                            }}
                          />
                        </div>
                      ) : null}

                      {selectedCustomHomeBlock || selectedCmsBinding?.section === "home" || selectedCmsBinding?.kind === "text" ? (
                        <div className="mt-4 pt-3 border-t border-black/10">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteSelectedTextTarget}
                            className="w-full"
                          >
                            {selectedCustomHomeBlock || selectedCmsBinding?.section === "home"
                              ? "Delete Block"
                              : "Clear Text"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      Click any outlined element in the preview to edit it here.
                    </p>
                  )}

                  <div className="mt-3 rounded-xl border border-black/10 bg-[var(--color-neutral-100)]/50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Global Style
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                          Edit theme, logo, and button colors without leaving fullscreen.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void saveAppearanceSettings(appearanceForm)}
                        disabled={savingAppearance || !appearanceDirty}
                      >
                        {savingAppearance ? "Saving..." : "Save"}
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <input
                        className={fieldClassName}
                        value={appearanceForm.brandName}
                        placeholder="Brand name"
                        onChange={(event) => updateAppearanceField("brandName", event.target.value)}
                      />

                      <input
                        className={fieldClassName}
                        value={appearanceForm.logoUrl}
                        placeholder="Logo URL"
                        onChange={(event) => updateAppearanceField("logoUrl", event.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Background
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue("appearance.colorBg", appearanceForm.colorBg)}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.colorBg", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue("appearance.colorBg", appearanceForm.colorBg, (value) =>
                                updateAppearanceField("colorBg", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue("appearance.colorBg", appearanceForm.colorBg, (value) =>
                                updateAppearanceField("colorBg", value),
                              )
                            }
                          />
                        </label>

                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Main Text
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue("appearance.colorText", appearanceForm.colorText)}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.colorText", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue(
                                "appearance.colorText",
                                appearanceForm.colorText,
                                (value) => updateAppearanceField("colorText", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue(
                                "appearance.colorText",
                                appearanceForm.colorText,
                                (value) => updateAppearanceField("colorText", value),
                              )
                            }
                          />
                        </label>

                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Logo
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue("appearance.logoColor", appearanceForm.logoColor)}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.logoColor", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue("appearance.logoColor", appearanceForm.logoColor, (value) =>
                                updateAppearanceField("logoColor", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue("appearance.logoColor", appearanceForm.logoColor, (value) =>
                                updateAppearanceField("logoColor", value),
                              )
                            }
                          />
                        </label>

                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Button
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue(
                              "appearance.colorButtonBg",
                              appearanceForm.colorButtonBg,
                            )}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.colorButtonBg", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonBg",
                                appearanceForm.colorButtonBg,
                                (value) => updateAppearanceField("colorButtonBg", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonBg",
                                appearanceForm.colorButtonBg,
                                (value) => updateAppearanceField("colorButtonBg", value),
                              )
                            }
                          />
                        </label>

                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Button Hover
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue(
                              "appearance.colorButtonBgHover",
                              appearanceForm.colorButtonBgHover,
                            )}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.colorButtonBgHover", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonBgHover",
                                appearanceForm.colorButtonBgHover,
                                (value) => updateAppearanceField("colorButtonBgHover", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonBgHover",
                                appearanceForm.colorButtonBgHover,
                                (value) => updateAppearanceField("colorButtonBgHover", value),
                              )
                            }
                          />
                        </label>

                        <label className="rounded-lg border border-black/10 bg-white p-2 text-[11px] font-medium text-[var(--color-muted)]">
                          Button Text
                          <input
                            type="color"
                            className="mt-1 h-9 w-full cursor-pointer rounded-md border border-black/10"
                            value={getColorPickerDraftValue(
                              "appearance.colorButtonText",
                              appearanceForm.colorButtonText,
                            )}
                            onChange={(event) =>
                              stageColorPickerValue("appearance.colorButtonText", event.target.value)
                            }
                            onPointerUp={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonText",
                                appearanceForm.colorButtonText,
                                (value) => updateAppearanceField("colorButtonText", value),
                              )
                            }
                            onBlur={() =>
                              commitColorPickerValue(
                                "appearance.colorButtonText",
                                appearanceForm.colorButtonText,
                                (value) => updateAppearanceField("colorButtonText", value),
                              )
                            }
                          />
                        </label>
                      </div>

                      <select
                        className={fieldClassName}
                        value={appearanceForm.buttonRadius}
                        onChange={(event) => updateAppearanceField("buttonRadius", event.target.value)}
                      >
                        <option value="9999px">Button Shape: Pill</option>
                        <option value="16px">Button Shape: Rounded</option>
                        <option value="8px">Button Shape: Soft</option>
                        <option value="0px">Button Shape: Square</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-black/10 bg-[var(--color-neutral-100)]/50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Home Custom Blocks
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          Add or remove homepage text and image blocks.
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-[var(--color-muted)]">
                      Use the top-left menu button to add text or image blocks.
                    </p>

                    {cmsHomeDraft.customBlocks.length === 0 ? (
                      <p className="mt-3 text-xs text-[var(--color-muted)]">No custom blocks yet.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {cmsHomeDraft.customBlocks.map((block, index) => (
                          <div key={block.id} className="rounded-lg border border-black/10 bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                Block {index + 1}: {block.type}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeCmsHomeCustomBlock(block.id)}
                              >
                                Remove
                              </Button>
                            </div>

                            {block.type === "text" ? (
                              <div className="mt-2 grid gap-2">
                                <textarea
                                  className={fieldClassName}
                                  rows={2}
                                  value={block.text}
                                  placeholder="Text EN"
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(block.id, "text", event.target.value)
                                  }
                                />
                                <textarea
                                  className={fieldClassName}
                                  rows={2}
                                  value={block.textNl}
                                  placeholder="Text NL"
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(block.id, "textNl", event.target.value)
                                  }
                                />
                                <div className="rounded-lg border border-black/10 bg-[var(--color-neutral-100)]/40 p-2.5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                    Background
                                  </p>
                                  <div className="mt-2 grid gap-2">
                                    <label className="text-[11px] font-medium text-[var(--color-muted)]">
                                      Background Color
                                    </label>
                                    <input
                                      type="color"
                                      className={`${fieldClassName} h-10`}
                                      value={getColorPickerDraftValue(
                                        `custom-block.${block.id}.bg.fullscreen-text`,
                                        block.backgroundColor === "transparent"
                                          ? "#ffffff"
                                          : block.backgroundColor || "#ffffff",
                                      )}
                                      disabled={block.backgroundColor === "transparent"}
                                      onChange={(event) =>
                                        stageColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-text`,
                                          event.target.value,
                                        )
                                      }
                                      onPointerUp={() =>
                                        commitColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-text`,
                                          block.backgroundColor === "transparent"
                                            ? "#ffffff"
                                            : block.backgroundColor || "#ffffff",
                                          (value) =>
                                            updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                        )
                                      }
                                      onBlur={() =>
                                        commitColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-text`,
                                          block.backgroundColor === "transparent"
                                            ? "#ffffff"
                                            : block.backgroundColor || "#ffffff",
                                          (value) =>
                                            updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                        )
                                      }
                                    />
                                    <label className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                                      <input
                                        type="checkbox"
                                        checked={block.backgroundColor === "transparent"}
                                        onChange={(event) =>
                                          updateCmsHomeCustomBlock(
                                            block.id,
                                            "backgroundColor",
                                            event.target.checked ? "transparent" : "#ffffff",
                                          )
                                        }
                                      />
                                      Invisible background
                                    </label>
                                    <label className="text-[11px] font-medium text-[var(--color-muted)]">
                                      Background Shape
                                    </label>
                                    <select
                                      className={fieldClassName}
                                      value={block.backgroundShape}
                                      onChange={(event) =>
                                        updateCmsHomeCustomBlock(block.id, "backgroundShape", event.target.value)
                                      }
                                    >
                                      <option value="rounded-square">Rounded Square</option>
                                      <option value="pill">Pill</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 grid gap-2">
                                <div
                                  className="rounded-lg border border-dashed border-black/20 bg-[var(--color-neutral-100)]/50 px-3 py-3 text-center text-xs text-[var(--color-muted)]"
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = "copy";
                                  }}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    const file = event.dataTransfer.files?.[0];
                                    if (file) {
                                      void handleCustomBlockImageUpload(block.id, file);
                                    }
                                  }}
                                >
                                  <p className="font-semibold text-[var(--color-ink)]">Drop image here</p>
                                  <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]">
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                          void handleCustomBlockImageUpload(block.id, file);
                                        }
                                        event.target.value = "";
                                      }}
                                    />
                                  </label>
                                  {uploadingCustomBlockId === block.id ? (
                                    <p className="mt-2 text-[11px] text-[var(--color-muted)]">Uploading...</p>
                                  ) : null}
                                  {customBlockUploadError ? (
                                    <p className="mt-2 text-[11px] text-red-600">{customBlockUploadError}</p>
                                  ) : null}
                                </div>

                                <input
                                  className={fieldClassName}
                                  value={block.imageUrl}
                                  placeholder="Image URL"
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(block.id, "imageUrl", event.target.value)
                                  }
                                />
                                <input
                                  className={fieldClassName}
                                  value={block.alt}
                                  placeholder="Alt EN"
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(block.id, "alt", event.target.value)
                                  }
                                />
                                <input
                                  className={fieldClassName}
                                  value={block.altNl}
                                  placeholder="Alt NL"
                                  onChange={(event) =>
                                    updateCmsHomeCustomBlock(block.id, "altNl", event.target.value)
                                  }
                                />
                                <div className="rounded-lg border border-black/10 bg-[var(--color-neutral-100)]/40 p-2.5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                                    Background
                                  </p>
                                  <div className="mt-2 grid gap-2">
                                    <label className="text-[11px] font-medium text-[var(--color-muted)]">
                                      Background Color
                                    </label>
                                    <input
                                      type="color"
                                      className={`${fieldClassName} h-10`}
                                      value={getColorPickerDraftValue(
                                        `custom-block.${block.id}.bg.fullscreen-image`,
                                        block.backgroundColor === "transparent"
                                          ? "#ffffff"
                                          : block.backgroundColor || "#ffffff",
                                      )}
                                      disabled={block.backgroundColor === "transparent"}
                                      onChange={(event) =>
                                        stageColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-image`,
                                          event.target.value,
                                        )
                                      }
                                      onPointerUp={() =>
                                        commitColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-image`,
                                          block.backgroundColor === "transparent"
                                            ? "#ffffff"
                                            : block.backgroundColor || "#ffffff",
                                          (value) =>
                                            updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                        )
                                      }
                                      onBlur={() =>
                                        commitColorPickerValue(
                                          `custom-block.${block.id}.bg.fullscreen-image`,
                                          block.backgroundColor === "transparent"
                                            ? "#ffffff"
                                            : block.backgroundColor || "#ffffff",
                                          (value) =>
                                            updateCmsHomeCustomBlock(block.id, "backgroundColor", value),
                                        )
                                      }
                                    />
                                    <label className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                                      <input
                                        type="checkbox"
                                        checked={block.backgroundColor === "transparent"}
                                        onChange={(event) =>
                                          updateCmsHomeCustomBlock(
                                            block.id,
                                            "backgroundColor",
                                            event.target.checked ? "transparent" : "#ffffff",
                                          )
                                        }
                                      />
                                      Invisible background
                                    </label>
                                    <label className="text-[11px] font-medium text-[var(--color-muted)]">
                                      Background Shape
                                    </label>
                                    <select
                                      className={fieldClassName}
                                      value={block.backgroundShape}
                                      onChange={(event) =>
                                        updateCmsHomeCustomBlock(block.id, "backgroundShape", event.target.value)
                                      }
                                    >
                                      <option value="rounded-square">Rounded Square</option>
                                      <option value="pill">Pill</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label="Resize quick editor"
                    className="absolute bottom-1 right-1 h-5 w-5 cursor-se-resize rounded border border-black/15 bg-[var(--color-neutral-100)]"
                    onPointerDown={handleFullscreenInspectorResizeStart}
                  />
                </aside>
              ) : null}
            </div>

            {appearanceDrawerOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setAppearanceDrawerOpen(false)}
                />
                <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-[520px] overflow-y-auto border-l border-black/10 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-ink)]">Appearance Controls</h3>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Accordion controls keep options out of the way while you preview.
                      </p>
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setAppearanceDrawerOpen(false)}>
                      Close
                    </Button>
                  </div>

                  <form onSubmit={handleSaveAppearance} className="mt-5 space-y-3 pb-24">
                    <details open className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        Brand and Layout
                      </summary>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Brand Name</label>
                          <input
                            className={fieldClassName}
                            value={appearanceForm.brandName}
                            onChange={(event) => updateAppearanceField("brandName", event.target.value)}
                            placeholder="Atelier Nord"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Logo URL</label>
                          <input
                            className={fieldClassName}
                            value={appearanceForm.logoUrl}
                            onChange={(event) => updateAppearanceField("logoUrl", event.target.value)}
                            placeholder="https://example.com/logo.svg"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Layout Density</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.layoutMode}
                            onChange={(event) =>
                              updateAppearanceField("layoutMode", event.target.value as LayoutMode)
                            }
                          >
                            <option value="compact">compact</option>
                            <option value="balanced">balanced</option>
                            <option value="spacious">spacious</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Container Width</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.containerWidth}
                            onChange={(event) =>
                              updateAppearanceField("containerWidth", event.target.value as ContainerWidthMode)
                            }
                          >
                            <option value="narrow">narrow</option>
                            <option value="standard">standard</option>
                            <option value="wide">wide</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Section Spacing</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.sectionSpacing}
                            onChange={(event) =>
                              updateAppearanceField("sectionSpacing", event.target.value as SectionSpacingMode)
                            }
                          >
                            <option value="tight">tight</option>
                            <option value="balanced">balanced</option>
                            <option value="airy">airy</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[var(--color-ink)]">Home Hero Layout</label>
                          <select
                            className={fieldClassName}
                            value={appearanceForm.heroLayout}
                            onChange={(event) =>
                              updateAppearanceField("heroLayout", event.target.value as HeroLayoutMode)
                            }
                          >
                            <option value="split">split</option>
                            <option value="centered">centered</option>
                            <option value="image-first">image-first</option>
                          </select>
                        </div>
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">Colors</summary>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Background", "colorBg"],
                          ["Main Text", "colorText"],
                          ["Ink", "colorInk"],
                          ["Muted Text", "colorMuted"],
                          ["Logo", "logoColor"],
                          ["Neutral 100", "colorNeutral100"],
                          ["Neutral 200", "colorNeutral200"],
                          ["Neutral 300", "colorNeutral300"],
                          ["Wood Accent", "colorWood"],
                          ["Wood Dark", "colorWoodDark"],
                          ["Button", "colorButtonBg"],
                          ["Button Hover", "colorButtonBgHover"],
                          ["Button Text", "colorButtonText"],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <label className="text-sm font-medium text-[var(--color-ink)]">{label}</label>
                            <input
                              type="color"
                              className={fieldClassName}
                              value={getColorPickerDraftValue(
                                `appearance.drawer.${key}`,
                                appearanceForm[key as keyof AppearanceSettingsState] as string,
                              )}
                              onChange={(event) =>
                                stageColorPickerValue(`appearance.drawer.${key}`, event.target.value)
                              }
                              onPointerUp={() =>
                                commitColorPickerValue(
                                  `appearance.drawer.${key}`,
                                  appearanceForm[key as keyof AppearanceSettingsState] as string,
                                  (value) =>
                                    updateAppearanceField(
                                      key as keyof AppearanceSettingsState,
                                      value as never,
                                    ),
                                )
                              }
                              onBlur={() =>
                                commitColorPickerValue(
                                  `appearance.drawer.${key}`,
                                  appearanceForm[key as keyof AppearanceSettingsState] as string,
                                  (value) =>
                                    updateAppearanceField(
                                      key as keyof AppearanceSettingsState,
                                      value as never,
                                    ),
                                )
                              }
                            />
                            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                              <span
                                className="h-6 w-6 rounded-md border border-black/20"
                                style={{
                                  backgroundColor: appearanceForm[key as keyof AppearanceSettingsState] as string,
                                }}
                              />
                              <span>
                                {(appearanceForm[key as keyof AppearanceSettingsState] as string).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        Color Schemes
                      </summary>
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="min-w-[180px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
                            value={newAppearanceSchemeName}
                            onChange={(event) => setNewAppearanceSchemeName(event.target.value)}
                            placeholder="Scheme name"
                          />
                          <Button type="button" variant="secondary" onClick={handleSaveAppearanceScheme}>
                            Save Scheme
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRestoreAppearanceDefault}
                            disabled={!appearanceDefaultSnapshot}
                          >
                            Restore Default
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {appearanceSchemes.length === 0 ? (
                            <p className="text-xs text-[var(--color-muted)]">No saved schemes yet.</p>
                          ) : (
                            appearanceSchemes.map((scheme) => (
                              <div
                                key={scheme.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/10 px-3 py-2"
                              >
                                <span className="text-sm font-medium text-[var(--color-ink)]">{scheme.name}</span>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleApplyAppearanceScheme(scheme)}
                                  >
                                    Apply
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleDeleteAppearanceScheme(scheme.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </details>

                    <details className="rounded-2xl border border-black/10 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-ink)]">
                        History and Publish
                      </summary>
                      <div className="mt-4 space-y-3">
                        {appearanceDirty ? (
                          <p className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
                            You have unsaved appearance changes.
                          </p>
                        ) : null}

                        {appearanceError ? (
                          <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                            {appearanceError}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" disabled={savingAppearance}>
                            {savingAppearance ? "Saving..." : "Save Appearance"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUndoAppearanceChange}
                            disabled={appearanceUndoHistory.length === 0 || savingAppearance}
                          >
                            Undo ({appearanceUndoHistory.length})
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRedoAppearanceChange}
                            disabled={appearanceRedoHistory.length === 0 || savingAppearance}
                          >
                            Redo ({appearanceRedoHistory.length})
                          </Button>
                        </div>
                      </div>
                    </details>
                  </form>
                </aside>
              </>
            ) : null}
          </div>
        ) : null}

        {activeAdminTab === "catalog" ? (
          <>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Manage Categories</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Add, edit, or remove product categories used in the shop and admin forms.
          </p>

          <form onSubmit={handleCreateCategory} className="mt-5 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category Name EN *</label>
              <input
                className={fieldClassName}
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                    slug: previous.slug ? previous.slug : slugify(event.target.value),
                  }))
                }
                placeholder="Benches"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category Name NL</label>
              <input
                className={fieldClassName}
                value={categoryForm.nameNl}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    nameNl: event.target.value,
                  }))
                }
                placeholder="Banken"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Slug *</label>
              <input
                className={fieldClassName}
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    slug: slugify(event.target.value),
                  }))
                }
                placeholder="benches"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description EN</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Compact and versatile seating pieces."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description NL</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={categoryForm.descriptionNl}
                onChange={(event) =>
                  setCategoryForm((previous) => ({
                    ...previous,
                    descriptionNl: event.target.value,
                  }))
                }
                placeholder="Compacte en veelzijdige zitmeubels."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Hero Image URL (optional)</label>
              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start">
                <label
                  className={`group flex h-28 w-full max-w-[12rem] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition md:h-32 ${
                    isDraggingCategoryHero
                      ? "border-[var(--color-wood-dark)] bg-[var(--color-neutral-100)]"
                      : "border-black/15 bg-[var(--color-neutral-100)]/40 hover:border-[var(--color-wood)]"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                    setIsDraggingCategoryHero(true);
                  }}
                  onDragLeave={() => setIsDraggingCategoryHero(false)}
                  onDrop={handleCategoryHeroDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCategoryHeroInputChange}
                  />
                  {categoryForm.heroImage ? (
                    <img
                      src={categoryForm.heroImage}
                      alt="Category hero preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                      Drop Image Here
                    </span>
                  )}
                </label>

                <div className="min-w-0 flex-1">
                  {isUploadingCategoryHero ? (
                    <p className="mb-2 text-xs text-[var(--color-muted)]">Uploading hero image...</p>
                  ) : null}
                  {categoryHeroUploadError ? (
                    <p className="mb-2 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700">
                      {categoryHeroUploadError}
                    </p>
                  ) : null}
                  <input
                    className={fieldClassName}
                    value={categoryForm.heroImage}
                    onChange={(event) =>
                      setCategoryForm((previous) => ({
                        ...previous,
                        heroImage: event.target.value,
                      }))
                    }
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={managingCategories}>
                  {managingCategories
                    ? "Saving..."
                    : editingCategoryId
                      ? "Save Category"
                      : "Add Category"}
                </Button>
                {editingCategoryId ? (
                  <Button type="button" variant="secondary" onClick={handleCancelCategoryEdit}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </div>
          </form>

          {categoryError ? (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{categoryError}</p>
          ) : null}

          <div className="mt-6 space-y-2">
            {loadingCategories ? (
              <p className="text-sm text-[var(--color-muted)]">Loading categories...</p>
            ) : categoryRows.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No categories yet. Add one above.</p>
            ) : (
              categoryRows.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{category.name}</p>
                    {category.name_nl ? (
                      <p className="text-xs text-[var(--color-muted)]">NL: {category.name_nl}</p>
                    ) : null}
                    <p className="text-xs text-[var(--color-muted)]">/{category.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => handleEditCategory(category)}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleDeleteCategory(category)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
            {editingProductId ? "Edit Product" : "Add Product"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {editingProductId
              ? "Update product details stored in Supabase."
              : "Create a new product directly in Supabase."}
          </p>

          {isOwner === false && (
            <p className="mt-4 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
              Owner access missing for this user. Add this user id to public.admin_users to enable create/update/delete.
            </p>
          )}

          {ownerCheckError && (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
              Could not verify owner membership: {ownerCheckError}
            </p>
          )}

          <form onSubmit={handleCreateProduct} className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Name EN *</label>
              <input
                className={fieldClassName}
                value={productForm.name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setProductForm((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: slugEdited ? prev.slug : slugify(nextName),
                  }));
                }}
                placeholder="Oak Dining Table"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Name NL</label>
              <input
                className={fieldClassName}
                value={productForm.nameNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    nameNl: event.target.value,
                  }))
                }
                placeholder="Eiken eettafel"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Slug *</label>
              <input
                className={fieldClassName}
                value={productForm.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setProductForm((prev) => ({
                    ...prev,
                    slug: slugify(event.target.value),
                  }));
                }}
                placeholder="oak-dining-table"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Category *</label>
              <select
                className={fieldClassName}
                value={productForm.category}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                required
              >
                {categoryRows.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Base Price (USD) *</label>
              <input
                className={fieldClassName}
                type="text"
                inputMode="decimal"
                value={productForm.basePrice}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    basePrice: event.target.value,
                  }))
                }
                placeholder="1499"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Subtitle EN *</label>
              <input
                className={fieldClassName}
                value={productForm.subtitle}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    subtitle: event.target.value,
                  }))
                }
                placeholder="Solid oak, hand-finished"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Subtitle NL</label>
              <input
                className={fieldClassName}
                value={productForm.subtitleNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    subtitleNl: event.target.value,
                  }))
                }
                placeholder="Massief eiken, met de hand afgewerkt"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Lead Time EN *</label>
              <input
                className={fieldClassName}
                value={productForm.leadTime}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    leadTime: event.target.value,
                  }))
                }
                placeholder="6-8 weeks"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Lead Time NL</label>
              <input
                className={fieldClassName}
                value={productForm.leadTimeNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    leadTimeNl: event.target.value,
                  }))
                }
                placeholder="6-8 weken"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description EN *</label>
              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="A handcrafted oak dining table with natural oil finish."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Description NL</label>
              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.descriptionNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    descriptionNl: event.target.value,
                  }))
                }
                placeholder="Een handgemaakte eiken eettafel met natuurlijke olie-afwerking."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">
                Images (drag and drop supported)
              </label>

              <div
                className={`mt-2 rounded-2xl border-2 border-dashed p-4 transition ${
                  isDraggingImages
                    ? "border-[var(--color-wood-dark)] bg-[var(--color-neutral-100)]"
                    : "border-black/15 bg-white"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingImages(true);
                }}
                onDragLeave={() => setIsDraggingImages(false)}
                onDrop={handleImageDrop}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] hover:border-[var(--color-wood)]">
                    Select images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageInputChange}
                    />
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    Drag images here or click Select images. They upload automatically.
                  </p>
                </div>

                {isUploadingImages ? (
                  <p className="mt-3 text-xs text-[var(--color-muted)]">Uploading images...</p>
                ) : null}

                {imageUploadError ? (
                  <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700">
                    {imageUploadError}
                  </p>
                ) : null}
              </div>

              <textarea
                className={fieldClassName}
                rows={4}
                value={productForm.images}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    images: event.target.value,
                  }))
                }
                placeholder="Uploaded image URLs appear here automatically (one per line)."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Story EN (optional)</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={productForm.story}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    story: event.target.value,
                  }))
                }
                placeholder="Built by local craftsmen."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-ink)]">Story NL (optioneel)</label>
              <textarea
                className={fieldClassName}
                rows={2}
                value={productForm.storyNl}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    storyNl: event.target.value,
                  }))
                }
                placeholder="Gemaakt door lokale vakmensen."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Custom Options</label>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Create product-specific options and choices shown on this product page.
              </p>

              <div className="mt-3 space-y-3">
                {customOptionsForm.map((option) => (
                  <div key={option.formId} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.id}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "id", event.target.value)
                        }
                        placeholder="Option id (e.g. finish)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.label}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "label", event.target.value)
                        }
                        placeholder="Option label EN (e.g. Finish)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.labelNl}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "labelNl", event.target.value)
                        }
                        placeholder="Option label NL (bijv. Afwerking)"
                      />
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_220px_auto]">
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.helperText}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "helperText", event.target.value)
                        }
                        placeholder="Helper text EN (optional)"
                      />
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.helperTextNl}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "helperTextNl", event.target.value)
                        }
                        placeholder="Helper text NL (optioneel)"
                      />
                      <select
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.type}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "type", event.target.value)
                        }
                      >
                        <option value="dropdown">dropdown</option>
                        <option value="toggle">toggle</option>
                        <option value="swatch">swatch</option>
                      </select>
                      <Button type="button" variant="ghost" onClick={() => removeCustomOption(option.formId)}>
                        Remove option
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {option.choices.map((choice) => (
                        <div
                          key={choice.formId}
                          className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_140px_140px_64px_auto]"
                        >
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.id}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "id", event.target.value)
                            }
                            placeholder="Choice id"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.label}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "label", event.target.value)
                            }
                            placeholder="Choice label EN"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.labelNl}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "labelNl", event.target.value)
                            }
                            placeholder="Choice label NL"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            inputMode="decimal"
                            value={choice.priceModifier}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "priceModifier", event.target.value)
                            }
                            placeholder="Price +/-"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                            value={choice.swatchHex}
                            onChange={(event) =>
                              updateCustomChoiceField(option.formId, choice.formId, "swatchHex", event.target.value)
                            }
                            placeholder="Swatch hex"
                          />
                          {option.type === "swatch" ? (
                            <input
                              type="color"
                              aria-label="Pick swatch color"
                              className="h-11 w-full cursor-pointer rounded-xl border border-black/10 bg-white p-1"
                              value={getColorPickerDraftValue(
                                `custom-swatch.${option.formId}.${choice.formId}`,
                                choice.swatchHex,
                              )}
                              onChange={(event) =>
                                stageColorPickerValue(
                                  `custom-swatch.${option.formId}.${choice.formId}`,
                                  event.target.value,
                                )
                              }
                              onPointerUp={() =>
                                commitColorPickerValue(
                                  `custom-swatch.${option.formId}.${choice.formId}`,
                                  choice.swatchHex,
                                  (value) =>
                                    updateCustomChoiceField(
                                      option.formId,
                                      choice.formId,
                                      "swatchHex",
                                      value,
                                    ),
                                )
                              }
                              onBlur={() =>
                                commitColorPickerValue(
                                  `custom-swatch.${option.formId}.${choice.formId}`,
                                  choice.swatchHex,
                                  (value) =>
                                    updateCustomChoiceField(
                                      option.formId,
                                      choice.formId,
                                      "swatchHex",
                                      value,
                                    ),
                                )
                              }
                            />
                          ) : (
                            <div />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeCustomChoice(option.formId, choice.formId)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Button type="button" variant="secondary" onClick={() => addCustomChoice(option.formId)}>
                        Add choice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Button type="button" variant="secondary" onClick={addCustomOption}>
                  Add custom option
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">
                Default Selections
              </label>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Add your own standard option IDs below. They are auto-added for every new product.
              </p>

              <div className="mt-3 rounded-2xl border border-black/10 bg-[var(--color-neutral-100)] p-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Standard option IDs
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {standardOptionIds.map((optionId) => (
                    <span
                      key={optionId}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-[var(--color-ink)]"
                    >
                      {optionId}
                      <button
                        type="button"
                        onClick={() => removeStandardOptionId(optionId)}
                        className="text-[var(--color-muted)] transition hover:text-red-700"
                        aria-label={`Remove standard option ${optionId}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                    value={newStandardOptionId}
                    onChange={(event) => setNewStandardOptionId(event.target.value)}
                    placeholder="Add standard id (e.g. finish or leg_style)"
                  />
                  <Button type="button" variant="secondary" onClick={addStandardOptionId}>
                    Add standard id
                  </Button>
                </div>

                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Tip: spaces are converted to underscores automatically.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {standardOptionIds.map((optionId) => {
                  const exists = defaultSelectionRows.some(
                    (row) => row.optionId.trim().toLowerCase() === optionId,
                  );

                  if (exists) {
                    return null;
                  }

                  return (
                    <Button
                      key={optionId}
                      type="button"
                      variant="secondary"
                      onClick={() => addStandardOptionRow(optionId)}
                    >
                      Add {optionId}
                    </Button>
                  );
                })}

                <Button type="button" variant="ghost" onClick={restoreStandardOptionRows}>
                  Restore standard options
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {defaultSelectionRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                      value={row.optionId}
                      onChange={(event) =>
                        updateDefaultSelectionRow(row.id, "optionId", event.target.value)
                      }
                      placeholder="Option id (e.g. material)"
                    />
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                      value={row.choiceId}
                      onChange={(event) =>
                        updateDefaultSelectionRow(row.id, "choiceId", event.target.value)
                      }
                      placeholder="Default value (e.g. oak)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeDefaultSelectionRow(row.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Button type="button" variant="secondary" onClick={addDefaultSelectionRow}>
                  Add default option
                </Button>
              </div>
            </div>

            <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[var(--color-wood-dark)]"
              />
              Mark as featured
            </label>

            {createError && (
              <p className="md:col-span-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p className="md:col-span-2 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
                {createSuccess}
              </p>
            )}

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={creatingProduct}>
                  {creatingProduct ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}
                </Button>
                {editingProductId ? (
                  <Button type="button" variant="secondary" onClick={resetEditorState}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Products ({products.length})</h2>
            <Button variant="ghost" onClick={() => void fetchProducts()} disabled={loadingProducts}>
              {loadingProducts ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {error && <p className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg">{error}</p>}

          {products.length === 0 ? (
            <p className="mt-4 text-[var(--color-muted)]">No products found. Create one to get started.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-[var(--color-ink)]">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right font-semibold text-[var(--color-ink)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-black/5 hover:bg-[var(--color-neutral-100)]">
                      <td className="px-4 py-3 text-[var(--color-ink)]">{product.name}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{product.category}</td>
                      <td className="px-4 py-3 text-[var(--color-ink)] font-medium">
                        ${formatAdminPrice(product.base_price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-wood-dark)]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Connected</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            You are authenticated with Supabase. Use the Add Product form above to create products directly from this page.
          </p>
        </div>
          </>
        ) : null}

        {confirmDialogAction ? (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-wood-dark)]">
                Confirm Action
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                {confirmDialogAction === "publish"
                  ? "Publish Changes Live?"
                  : confirmDialogAction === "discard"
                    ? "Discard Unsaved Changes?"
                    : "Delete Selected Block?"}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {confirmDialogAction === "publish"
                  ? "This will make your current draft visible on the live website immediately."
                  : confirmDialogAction === "discard"
                    ? "This will remove all unsaved edits and restore the last saved state."
                    : "This will remove the selected block from the current layout."}
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setConfirmDialogAction(null);
                    setPendingDeleteAction(null);
                  }}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--color-wood-dark)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-wood)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={publishingCms || savingCmsDraft || loadingCms}
                  onClick={() => {
                    const action = confirmDialogAction;
                    setConfirmDialogAction(null);

                    if (action === "discard") {
                      void handleDiscardCmsDraftChanges(true);
                      return;
                    }

                    if (action === "delete") {
                      executePendingDeleteAction();
                      setPendingDeleteAction(null);
                      return;
                    }

                    void handlePublishCms(true);
                  }}
                >
                  {confirmDialogAction === "publish"
                    ? "Yes, Publish Live"
                    : confirmDialogAction === "discard"
                      ? "Yes, Discard Changes"
                      : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

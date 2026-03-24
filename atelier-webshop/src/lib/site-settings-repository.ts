import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type LayoutMode = "compact" | "balanced" | "spacious";
export type ContainerWidthMode = "narrow" | "standard" | "wide";
export type SectionSpacingMode = "tight" | "balanced" | "airy";
export type HeroLayoutMode = "split" | "centered" | "image-first";

export interface SiteSettings {
  brandName: string;
  colorBg: string;
  colorInk: string;
  colorMuted: string;
  colorNeutral100: string;
  colorNeutral200: string;
  colorNeutral300: string;
  colorWood: string;
  colorWoodDark: string;
  layoutMode: LayoutMode;
  containerWidth: ContainerWidthMode;
  sectionSpacing: SectionSpacingMode;
  heroLayout: HeroLayoutMode;
}

const fallbackSiteSettings: SiteSettings = {
  brandName: "Atelier Nord",
  colorBg: "#fbfaf8",
  colorInk: "#2b231d",
  colorMuted: "#6f655c",
  colorNeutral100: "#f2ede7",
  colorNeutral200: "#e8e1d8",
  colorNeutral300: "#d7cabc",
  colorWood: "#b88a5b",
  colorWoodDark: "#7f5534",
  layoutMode: "balanced",
  containerWidth: "standard",
  sectionSpacing: "balanced",
  heroLayout: "split",
};

interface SiteSettingsRow {
  brand_name: string;
  color_bg: string;
  color_ink: string;
  color_muted: string;
  color_neutral_100: string;
  color_neutral_200: string;
  color_neutral_300: string;
  color_wood: string;
  color_wood_dark: string;
  layout_mode: LayoutMode;
  container_width: ContainerWidthMode;
  section_spacing: SectionSpacingMode;
  hero_layout: HeroLayoutMode;
}

const mapRowToSettings = (row: SiteSettingsRow): SiteSettings => ({
  brandName: row.brand_name,
  colorBg: row.color_bg,
  colorInk: row.color_ink,
  colorMuted: row.color_muted,
  colorNeutral100: row.color_neutral_100,
  colorNeutral200: row.color_neutral_200,
  colorNeutral300: row.color_neutral_300,
  colorWood: row.color_wood,
  colorWoodDark: row.color_wood_dark,
  layoutMode: row.layout_mode,
  containerWidth: row.container_width,
  sectionSpacing: row.section_spacing,
  heroLayout: row.hero_layout,
});

export const getSiteSettingsFromStore = async (): Promise<SiteSettings> => {
  if (!hasSupabaseConfig()) {
    return fallbackSiteSettings;
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return fallbackSiteSettings;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "brand_name, color_bg, color_ink, color_muted, color_neutral_100, color_neutral_200, color_neutral_300, color_wood, color_wood_dark, layout_mode, container_width, section_spacing, hero_layout",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return fallbackSiteSettings;
  }

  return mapRowToSettings(data as SiteSettingsRow);
};

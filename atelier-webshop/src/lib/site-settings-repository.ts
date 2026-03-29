import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type LayoutMode = "compact" | "balanced" | "spacious";
export type ContainerWidthMode = "narrow" | "standard" | "wide";
export type SectionSpacingMode = "tight" | "balanced" | "airy";
export type HeroLayoutMode = "split" | "centered" | "image-first";
export type FontPreset = "manrope" | "jakarta" | "system" | "serif";

export interface SiteSettings {
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

const fallbackSiteSettings: SiteSettings = {
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
};

interface SiteSettingsRow {
  brand_name: string;
  logo_url?: string;
  logo_color?: string;
  color_bg: string;
  color_text?: string;
  color_ink: string;
  color_muted: string;
  color_neutral_100: string;
  color_neutral_200: string;
  color_neutral_300: string;
  color_wood: string;
  color_wood_dark: string;
  color_button_bg?: string;
  color_button_bg_hover?: string;
  color_button_text?: string;
  layout_mode: LayoutMode;
  container_width: ContainerWidthMode;
  section_spacing: SectionSpacingMode;
  hero_layout: HeroLayoutMode;
  font_body?: FontPreset;
  font_heading?: FontPreset;
  button_radius?: string;
}

const mapRowToSettings = (row: SiteSettingsRow): SiteSettings => ({
  brandName: row.brand_name,
  logoUrl: row.logo_url ?? "",
  logoColor: row.logo_color ?? row.color_ink,
  colorBg: row.color_bg,
  colorText: row.color_text ?? row.color_ink,
  colorInk: row.color_ink,
  colorMuted: row.color_muted,
  colorNeutral100: row.color_neutral_100,
  colorNeutral200: row.color_neutral_200,
  colorNeutral300: row.color_neutral_300,
  colorWood: row.color_wood,
  colorWoodDark: row.color_wood_dark,
  colorButtonBg: row.color_button_bg ?? row.color_wood_dark,
  colorButtonBgHover: row.color_button_bg_hover ?? row.color_wood,
  colorButtonText: row.color_button_text ?? "#ffffff",
  layoutMode: row.layout_mode,
  containerWidth: row.container_width,
  sectionSpacing: row.section_spacing,
  heroLayout: row.hero_layout,
  fontBody: row.font_body ?? "manrope",
  fontHeading: row.font_heading ?? "jakarta",
  buttonRadius: row.button_radius ?? "9999px",
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
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return fallbackSiteSettings;
  }

  return mapRowToSettings(data as SiteSettingsRow);
};

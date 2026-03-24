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
  slug: string;
  category: string;
  base_price: number;
  subtitle: string;
  description: string;
  lead_time: string;
  images: unknown;
  featured: boolean;
  story: string | null;
  default_selections: unknown;
  custom_options: unknown;
}

type ProductCategory = string;

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  hero_image: string;
}

interface NewCategoryState {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
}

type LayoutMode = "compact" | "balanced" | "spacious";
type ContainerWidthMode = "narrow" | "standard" | "wide";
type SectionSpacingMode = "tight" | "balanced" | "airy";
type HeroLayoutMode = "split" | "centered" | "image-first";

interface AppearanceSettingsState {
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

interface AppearanceScheme {
  id: string;
  name: string;
  settings: AppearanceSettingsState;
}

interface NewProductState {
  name: string;
  slug: string;
  category: ProductCategory;
  basePrice: string;
  subtitle: string;
  description: string;
  leadTime: string;
  images: string;
  featured: boolean;
  story: string;
}

const createInitialCategoryState = (): NewCategoryState => ({
  name: "",
  slug: "",
  description: "",
  heroImage: "",
});

const createInitialAppearanceState = (): AppearanceSettingsState => ({
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
  priceModifier: string;
  swatchHex: string;
}

interface CustomOptionForm {
  formId: string;
  id: string;
  label: string;
  helperText: string;
  type: OptionInputType;
  choices: CustomOptionChoiceForm[];
}

const defaultStandardOptionIds = ["material", "size"];
const standardOptionStorageKey = "atelier.admin.defaultSelectionStandardOptionIds";
const appearanceSchemesStorageKey = "atelier.admin.appearanceSchemes";
const productImageBucket = "product-images";
const appearanceUndoHistoryLimit = 30;

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
  priceModifier: "0",
  swatchHex: "",
});

const createCustomOptionForm = (): CustomOptionForm => ({
  formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  id: "",
  label: "",
  helperText: "",
  type: "dropdown",
  choices: [createCustomChoiceForm()],
});

const normalizeOptionId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

const toColorInputValue = (value: string) => {
  const trimmed = value.trim();
  return /^#([0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : "#c9a97c";
};

const createInitialProductState = (): NewProductState => ({
  name: "",
  slug: "",
  category: "tables",
  basePrice: "",
  subtitle: "",
  description: "",
  leadTime: "6-8 weeks",
  images: "",
  featured: false,
  story: "",
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
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceSuccess, setAppearanceSuccess] = useState("");
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
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
  const [slugEdited, setSlugEdited] = useState(false);
  const router = useRouter();

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

          const requiredColorFields = [
            "brandName",
            "colorBg",
            "colorInk",
            "colorMuted",
            "colorNeutral100",
            "colorNeutral200",
            "colorNeutral300",
            "colorWood",
            "colorWoodDark",
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
              colorBg: settings.colorBg as string,
              colorInk: settings.colorInk as string,
              colorMuted: settings.colorMuted as string,
              colorNeutral100: settings.colorNeutral100 as string,
              colorNeutral200: settings.colorNeutral200 as string,
              colorNeutral300: settings.colorNeutral300 as string,
              colorWood: settings.colorWood as string,
              colorWoodDark: settings.colorWoodDark as string,
              layoutMode,
              containerWidth,
              sectionSpacing,
              heroLayout,
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
        .select("id, slug, name, description, hero_image")
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
        .select(
          "brand_name, color_bg, color_ink, color_muted, color_neutral_100, color_neutral_200, color_neutral_300, color_wood, color_wood_dark, layout_mode, container_width, section_spacing, hero_layout",
        )
        .eq("id", 1)
        .maybeSingle();

      if (queryError) {
        setAppearanceError(queryError.message);
        return;
      }

      if (!data) {
        return;
      }

      setAppearanceForm({
        brandName: data.brand_name,
        colorBg: data.color_bg,
        colorInk: data.color_ink,
        colorMuted: data.color_muted,
        colorNeutral100: data.color_neutral_100,
        colorNeutral200: data.color_neutral_200,
        colorNeutral300: data.color_neutral_300,
        colorWood: data.color_wood,
        colorWoodDark: data.color_wood_dark,
        layoutMode: (data.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (data.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (data.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (data.hero_layout ?? "split") as HeroLayoutMode,
      });
      setAppearanceDefaultSnapshot({
        brandName: data.brand_name,
        colorBg: data.color_bg,
        colorInk: data.color_ink,
        colorMuted: data.color_muted,
        colorNeutral100: data.color_neutral_100,
        colorNeutral200: data.color_neutral_200,
        colorNeutral300: data.color_neutral_300,
        colorWood: data.color_wood,
        colorWoodDark: data.color_wood_dark,
        layoutMode: (data.layout_mode ?? "balanced") as LayoutMode,
        containerWidth: (data.container_width ?? "standard") as ContainerWidthMode,
        sectionSpacing: (data.section_spacing ?? "balanced") as SectionSpacingMode,
        heroLayout: (data.hero_layout ?? "split") as HeroLayoutMode,
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

        const { error: upsertError } = await (supabase as any).from("site_settings").upsert({
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
        });

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
          "id, name, slug, category, base_price, subtitle, description, lead_time, images, featured, story, default_selections, custom_options",
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
    }
  }, [session, fetchAppearanceSettings, fetchCategories, fetchProducts]);

  const handleSaveAppearance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveAppearanceSettings(appearanceForm);
  };

  const handleOpenPreviewInNewTab = () => {
    window.open(previewPath, "_blank", "noopener,noreferrer");
  };

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
  }, [appearanceForm]);

  useEffect(() => {
    if (activeAdminTab === "appearance") {
      postPreviewDraft();
    }
  }, [activeAdminTab, postPreviewDraft]);

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = categoryForm.name.trim();
    const slug = slugify(categoryForm.slug || categoryForm.name);
    const description = categoryForm.description.trim();

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
            slug,
            description,
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
          slug,
          description,
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
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      heroImage: category.hero_image,
    });
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryError("");
    setCategoryForm(createInitialCategoryState());
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
        const helperText = typeof option.helperText === "string" ? option.helperText : "";
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
            priceModifier: String(Number(choice.priceModifier ?? 0)),
            swatchHex: typeof choice.swatchHex === "string" ? choice.swatchHex : "",
          }))
          .filter((choice) => choice.id || choice.label);

        return {
          formId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          id,
          label,
          helperText,
          type: type as OptionInputType,
          choices: choices.length > 0 ? choices : [createCustomChoiceForm()],
        };
      })
      .filter((option) => option.id || option.label || option.choices.some((choice) => choice.id));

    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      slug: product.slug,
      category: normalizedCategory,
      basePrice: String(product.base_price),
      subtitle: product.subtitle,
      description: product.description,
      leadTime: product.lead_time,
      images: imageList.join("\n"),
      featured: Boolean(product.featured),
      story: product.story ?? "",
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
    field: "id" | "label" | "helperText" | "type",
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
    field: "id" | "label" | "priceModifier" | "swatchHex",
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

    const basePriceNumber = Number(productForm.basePrice);
    if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
      setCreateError("Base price must be a valid number greater than 0.");
      setCreateSuccess("");
      return;
    }

    const name = productForm.name.trim();
    const slug = slugify(productForm.slug);
    const subtitle = productForm.subtitle.trim();
    const description = productForm.description.trim();
    const leadTime = productForm.leadTime.trim();

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
      helperText?: string;
      type: OptionInputType;
      choices: Array<{
        id: string;
        label: string;
        priceModifier: number;
        swatchHex?: string;
      }>;
    }> = [];

    for (const option of customOptionsForm) {
      const normalizedId = normalizeOptionId(option.id);
      const label = option.label.trim();
      const helperText = option.helperText.trim();

      const hasAnyData =
        normalizedId.length > 0 ||
        label.length > 0 ||
        helperText.length > 0 ||
        option.choices.some(
          (choice) =>
            choice.id.trim().length > 0 ||
            choice.label.trim().length > 0 ||
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

          if (!choiceId || !choiceLabel) {
            return null;
          }

          return {
            id: choiceId,
            label: choiceLabel,
            priceModifier: Number(choice.priceModifier || 0),
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
        ...(helperText ? { helperText } : {}),
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
        subtitle,
        description,
        category: productForm.category,
        base_price: basePriceNumber,
        lead_time: leadTime,
        images,
        featured: productForm.featured,
        story: productForm.story.trim() || null,
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
              </div>
            </div>

            {loadingAppearance ? (
              <p className="mt-4 text-sm text-[var(--color-muted)]">Loading appearance settings...</p>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
              <iframe
                ref={previewIframeRef}
                src={previewPath}
                title="Live storefront preview"
                className="h-[78vh] w-full border-0"
                onLoad={postPreviewDraft}
              />
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
                          ["Ink", "colorInk"],
                          ["Muted Text", "colorMuted"],
                          ["Neutral 100", "colorNeutral100"],
                          ["Neutral 200", "colorNeutral200"],
                          ["Neutral 300", "colorNeutral300"],
                          ["Wood Accent", "colorWood"],
                          ["Wood Dark", "colorWoodDark"],
                        ].map(([label, key]) => (
                          <div key={key}>
                            <label className="text-sm font-medium text-[var(--color-ink)]">{label}</label>
                            <input
                              type="color"
                              className={fieldClassName}
                              value={appearanceForm[key as keyof AppearanceSettingsState] as string}
                              onChange={(event) =>
                                updateAppearanceField(
                                  key as keyof AppearanceSettingsState,
                                  event.target.value as never,
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

                        {appearanceSuccess ? (
                          <p className="rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
                            {appearanceSuccess}
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
              <label className="text-sm font-medium text-[var(--color-ink)]">Category Name *</label>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Description</label>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Hero Image URL (optional)</label>
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
              <label className="text-sm font-medium text-[var(--color-ink)]">Name *</label>
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
                type="number"
                step="0.01"
                min="0"
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
              <label className="text-sm font-medium text-[var(--color-ink)]">Subtitle *</label>
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
              <label className="text-sm font-medium text-[var(--color-ink)]">Lead Time *</label>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Description *</label>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Story (optional)</label>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-ink)]">Custom Options</label>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Create product-specific options and choices shown on this product page.
              </p>

              <div className="mt-3 space-y-3">
                {customOptionsForm.map((option) => (
                  <div key={option.formId} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="grid gap-2 md:grid-cols-2">
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
                        placeholder="Option label (e.g. Finish)"
                      />
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_220px_auto]">
                      <input
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
                        value={option.helperText}
                        onChange={(event) =>
                          updateCustomOptionField(option.formId, "helperText", event.target.value)
                        }
                        placeholder="Helper text (optional)"
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
                          className="grid gap-2 md:grid-cols-[1fr_1fr_140px_140px_64px_auto]"
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
                            placeholder="Choice label"
                          />
                          <input
                            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
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
                              value={toColorInputValue(choice.swatchHex)}
                              onChange={(event) =>
                                updateCustomChoiceField(
                                  option.formId,
                                  choice.formId,
                                  "swatchHex",
                                  event.target.value,
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
                        ${product.base_price}
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
      </div>
    </div>
  );
}

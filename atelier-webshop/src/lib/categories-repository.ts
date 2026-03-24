import { categories as fallbackCategories } from "@/data/shop-data";
import { ProductCategory } from "@/types/shop";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

interface CategoryRow {
  slug: string;
  name: string;
  description: string;
  hero_image: string;
}

const mapRowToCategory = (row: CategoryRow): ProductCategory => ({
  slug: row.slug,
  name: row.name,
  description: row.description,
  heroImage: row.hero_image,
});

const getSupabaseCategories = async (): Promise<ProductCategory[] | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description, hero_image")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return null;
  }

  return (data as CategoryRow[]).map(mapRowToCategory);
};

export const getAllCategoriesFromStore = async (): Promise<ProductCategory[]> => {
  const supabaseCategories = await getSupabaseCategories();
  if (supabaseCategories && supabaseCategories.length > 0) {
    return supabaseCategories;
  }

  return fallbackCategories;
};

export const getCategoryBySlugFromStore = async (slug: string) => {
  const categories = await getAllCategoriesFromStore();
  return categories.find((category) => category.slug === slug);
};

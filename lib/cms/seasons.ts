import { competitionSeasons } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
export type CmsSeason = {
  id: string;
  label: string;
  isDefault: boolean;
  sortOrder: number;
  published: boolean;
};

export async function fetchPublishedSeasons(): Promise<CmsSeason[]> {
  if (!isSupabaseConfigured()) {
    return competitionSeasons.map((s, index) => ({
      id: s.id,
      label: s.label,
      isDefault: s.id === "2025-26",
      sortOrder: index,
      published: true,
    }));
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_seasons")
    .select("id, label, is_default, sort_order, published")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return competitionSeasons.map((s, index) => ({
      id: s.id,
      label: s.label,
      isDefault: s.id === "2025-26",
      sortOrder: index,
      published: true,
    }));
  }

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    published: row.published,
  }));
}

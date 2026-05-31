import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CmsSeason = {
  id: string;
  label: string;
  isDefault: boolean;
  sortOrder: number;
  published: boolean;
};

const FALLBACK_SEASONS: CmsSeason[] = [
  { id: "2025-26", label: "2025/26", isDefault: true, sortOrder: 0, published: true },
];

export async function fetchPublishedSeasons(): Promise<CmsSeason[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_SEASONS;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_seasons")
    .select("id, label, is_default, sort_order, published")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return FALLBACK_SEASONS;
  }

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    published: row.published,
  }));
}

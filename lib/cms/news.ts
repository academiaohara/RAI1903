import { newsItems as mockNewsItems } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { NewsItem, NewsTag } from "@/types";

type CmsNewsRow = {
  id: string;
  season_id: string | null;
  channel: "club" | "prensa";
  source: string;
  published_at: string;
  title: string;
  excerpt: string;
  url: string;
  image_url: string | null;
  tags: string[];
  featured: boolean;
  teams: string[];
  player_ids: string[];
  published: boolean;
};

function rowToNewsItem(row: CmsNewsRow): NewsItem {
  return {
    id: row.id,
    channel: row.channel,
    source: row.source,
    date: row.published_at,
    title: row.title,
    excerpt: row.excerpt,
    url: row.url,
    imageUrl: row.image_url ?? undefined,
    tags: row.tags as NewsTag[],
    featured: row.featured,
    teams: row.teams.length ? (row.teams as NewsItem["teams"]) : undefined,
    playerIds: row.player_ids.length ? row.player_ids : undefined,
  };
}

export async function fetchPublishedNewsItems(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    return mockNewsItems;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_news_items")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data?.length) {
    return mockNewsItems;
  }

  const cmsItems = data.map((row) => rowToNewsItem(row as CmsNewsRow));
  const cmsIds = new Set(cmsItems.map((item) => item.id));
  const mockOnly = mockNewsItems.filter((item) => !cmsIds.has(item.id));
  return [...cmsItems, ...mockOnly];
}

export function newsItemToRow(item: NewsItem, seasonId: string | null = "2025-26"): Omit<CmsNewsRow, "published"> & { published: boolean } {
  return {
    id: item.id,
    season_id: seasonId,
    channel: item.channel,
    source: item.source,
    published_at: item.date,
    title: item.title,
    excerpt: item.excerpt,
    url: item.url,
    image_url: item.imageUrl ?? null,
    tags: item.tags,
    featured: item.featured ?? false,
    teams: item.teams ?? [],
    player_ids: item.playerIds ?? [],
    published: true,
  };
}

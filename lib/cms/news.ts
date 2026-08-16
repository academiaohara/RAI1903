import { createClient } from "@/lib/supabase/client";
import { readCachedPublishedNews, writeCachedPublishedNews } from "@/lib/cms/client-cache";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  newsItemToPublishedAt,
  newsTimeFromPublishedAt,
  normalizeNewsDate,
} from "@/lib/noticias";
import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";
import type { NewsItem, NewsTag } from "@/types";

const LOCAL_NEWS_KEY = "rai1903:cms-news:v1";
const LOCAL_NEWS_MIGRATED_KEY = "rai1903:cms-news:migrated-to-supabase";

type CmsNewsRow = {
  id: string;
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

export function newsTitleOverrideKey(id: string) {
  return `news:${id}:title`;
}

export function newsExcerptOverrideKey(id: string) {
  return `news:${id}:excerpt`;
}

/** Aplica overrides inline legacy (titular/extracto) sobre noticias del CMS. */
export function applyNewsInlineOverrides(items: NewsItem[], overrides: InlineOverridesMap): NewsItem[] {
  return items.map((item) => {
    const titleOverride = overrides[newsTitleOverrideKey(item.id)];
    const excerptOverride = overrides[newsExcerptOverrideKey(item.id)];
    if (titleOverride === undefined && excerptOverride === undefined) return item;

    return {
      ...item,
      ...(typeof titleOverride === "string" ? { title: titleOverride } : {}),
      ...(typeof excerptOverride === "string" ? { excerpt: excerptOverride } : {}),
    };
  });
}

function rowToNewsItem(row: CmsNewsRow): NewsItem {
  const time = newsTimeFromPublishedAt(row.published_at);
  return {
    id: row.id,
    channel: row.channel,
    source: row.source,
    date: normalizeNewsDate(row.published_at),
    time,
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

function readLocalNewsItems(): NewsItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_NEWS_KEY);
    return raw ? (JSON.parse(raw) as NewsItem[]) : [];
  } catch {
    return [];
  }
}

function clearLocalNewsItems() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_NEWS_KEY);
}

/** Sube noticias creadas en localStorage a Supabase (una vez por navegador). */
export async function migrateLocalNewsToSupabase(): Promise<void> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return;
  if (window.localStorage.getItem(LOCAL_NEWS_MIGRATED_KEY) === "1") return;

  const localItems = readLocalNewsItems();
  if (!localItems.length) {
    window.localStorage.setItem(LOCAL_NEWS_MIGRATED_KEY, "1");
    return;
  }

  const supabase = createClient();
  const rows = localItems.map((item) => newsItemToRow(item));
  const { error } = await supabase.from("cms_news_items").upsert(rows);

  if (!error) {
    clearLocalNewsItems();
    window.localStorage.setItem(LOCAL_NEWS_MIGRATED_KEY, "1");
  }
}

export async function fetchPublishedNewsItems(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  await migrateLocalNewsToSupabase();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_news_items")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    const cached = await readCachedPublishedNews();
    return cached ?? [];
  }

  const items = data.map((row) => rowToNewsItem(row as CmsNewsRow));
  await writeCachedPublishedNews(items);
  return items;
}

export function newsItemToRow(item: NewsItem): Omit<CmsNewsRow, "published"> & { published: boolean } {
  return {
    id: item.id,
    channel: item.channel,
    source: item.source,
    published_at: newsItemToPublishedAt(item.date, item.time),
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

export async function updateNewsItem(item: NewsItem): Promise<{ ok: boolean; error?: string }> {
  return insertNewsItem(item);
}

export async function insertNewsItem(item: NewsItem): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const row = newsItemToRow(item);
  const { error } = await supabase.from("cms_news_items").upsert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function createNewsId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `news-${Date.now()}`;
}

export async function deleteNewsItem(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_news_items").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

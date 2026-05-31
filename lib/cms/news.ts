import { newsItems as mockNewsItems } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { NewsItem, NewsTag } from "@/types";

const LOCAL_NEWS_KEY = "rai1903:cms-news:v1";
const LOCAL_DELETED_NEWS_KEY = "rai1903:cms-news-deleted:v1";

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

function rowToNewsItem(row: CmsNewsRow): NewsItem {
  return {
    id: row.id,
    channel: row.channel,
    source: row.source,
    date: row.published_at.slice(0, 10),
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

function writeLocalNewsItems(items: NewsItem[]) {
  window.localStorage.setItem(LOCAL_NEWS_KEY, JSON.stringify(items));
}

function readDeletedNewsIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LOCAL_DELETED_NEWS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedNewsId(id: string) {
  const deleted = readDeletedNewsIds();
  deleted.add(id);
  window.localStorage.setItem(LOCAL_DELETED_NEWS_KEY, JSON.stringify([...deleted]));
}

function withoutDeletedNews(items: NewsItem[]) {
  const deleted = readDeletedNewsIds();
  return deleted.size ? items.filter((item) => !deleted.has(item.id)) : items;
}

function mergeNewsLists(...lists: NewsItem[][]): NewsItem[] {
  const byId = new Map<string, NewsItem>();
  for (const list of lists) {
    for (const item of list) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export async function fetchPublishedNewsItems(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    return withoutDeletedNews(mergeNewsLists(mockNewsItems, readLocalNewsItems()));
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_news_items")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const localItems = readLocalNewsItems();

  if (error || !data?.length) {
    return withoutDeletedNews(mergeNewsLists(mockNewsItems, localItems));
  }

  const cmsItems = data.map((row) => rowToNewsItem(row as CmsNewsRow));
  const cmsIds = new Set(cmsItems.map((item) => item.id));
  const mockOnly = mockNewsItems.filter((item) => !cmsIds.has(item.id));
  const localOnly = localItems.filter((item) => !cmsIds.has(item.id));
  return withoutDeletedNews(mergeNewsLists(cmsItems, mockOnly, localOnly));
}

export function newsItemToRow(item: NewsItem): Omit<CmsNewsRow, "published"> & { published: boolean } {
  return {
    id: item.id,
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

export async function updateNewsItem(item: NewsItem): Promise<{ ok: boolean; error?: string }> {
  return insertNewsItem(item);
}

export async function insertNewsItem(item: NewsItem): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const existing = readLocalNewsItems();
    writeLocalNewsItems([item, ...existing.filter((entry) => entry.id !== item.id)]);
    return { ok: true };
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
  addDeletedNewsId(id);

  if (!isSupabaseConfigured()) {
    writeLocalNewsItems(readLocalNewsItems().filter((entry) => entry.id !== id));
    return { ok: true };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_news_items").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

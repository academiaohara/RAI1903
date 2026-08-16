import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import type { PublishedTransfersSnapshot } from "@/lib/season/published-transfers";
import type { NewsItem } from "@/types";

const DB_NAME = "rai1903-cms-cache";
const DB_VERSION = 1;
const STORE_NAME = "entries";

type CacheEnvelope<T> = {
  value: T;
  updatedAt: number;
};

export const CMS_CACHE_KEYS = {
  publishedSeasons: "seasons:published",
  publishedNews: "news:published",
  transfersSnapshot: "transfers:snapshot",
  seasonBundles: (seasonId: string) => `bundles:${seasonId}`,
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error("IndexedDB no disponible"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("No se pudo abrir IndexedDB"));
    });
  }

  return dbPromise;
}

async function readEntry<T>(key: string): Promise<CacheEnvelope<T> | null> {
  if (!isIndexedDbAvailable()) return null;

  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CacheEnvelope<T> | undefined;
        resolve(result ?? null);
      };
      request.onerror = () => reject(request.error ?? new Error("Lectura de caché fallida"));
    });
  } catch {
    return null;
  }
}

async function writeEntry<T>(key: string, value: T): Promise<void> {
  if (!isIndexedDbAvailable()) return;

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const envelope: CacheEnvelope<T> = { value, updatedAt: Date.now() };
      const request = store.put(envelope, key);

      request.onerror = () => reject(request.error ?? new Error("Escritura de caché fallida"));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Transacción de caché fallida"));
    });
  } catch {
    // Caché opcional: no bloquear la app si falla el almacenamiento local.
  }
}

export async function readCachedPublishedSeasons(): Promise<CmsSeason[] | null> {
  const entry = await readEntry<CmsSeason[]>(CMS_CACHE_KEYS.publishedSeasons);
  return entry?.value ?? null;
}

export async function writeCachedPublishedSeasons(seasons: CmsSeason[]): Promise<void> {
  await writeEntry(CMS_CACHE_KEYS.publishedSeasons, seasons);
}

export async function readCachedSeasonBundles(seasonId: string): Promise<SeasonBundlesMap | null> {
  const entry = await readEntry<SeasonBundlesMap>(CMS_CACHE_KEYS.seasonBundles(seasonId));
  return entry?.value ?? null;
}

export async function writeCachedSeasonBundles(seasonId: string, bundles: SeasonBundlesMap): Promise<void> {
  await writeEntry(CMS_CACHE_KEYS.seasonBundles(seasonId), bundles);
}

export async function readAllCachedSeasonBundles(): Promise<Record<string, SeasonBundlesMap>> {
  if (!isIndexedDbAvailable()) return {};

  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const result: Record<string, SeasonBundlesMap> = {};
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(result);
          return;
        }

        const key = String(cursor.key);
        if (key.startsWith("bundles:")) {
          const envelope = cursor.value as CacheEnvelope<SeasonBundlesMap>;
          const seasonId = key.slice("bundles:".length);
          if (seasonId && envelope?.value) {
            result[seasonId] = envelope.value;
          }
        }

        cursor.continue();
      };
      request.onerror = () => reject(request.error ?? new Error("Lectura de bundles en caché fallida"));
    });
  } catch {
    return {};
  }
}

export async function readCachedTransfersSnapshot(): Promise<PublishedTransfersSnapshot | null> {
  const entry = await readEntry<PublishedTransfersSnapshot>(CMS_CACHE_KEYS.transfersSnapshot);
  return entry?.value ?? null;
}

export async function writeCachedTransfersSnapshot(snapshot: PublishedTransfersSnapshot): Promise<void> {
  await writeEntry(CMS_CACHE_KEYS.transfersSnapshot, snapshot);
}

export async function readCachedPublishedNews(): Promise<NewsItem[] | null> {
  const entry = await readEntry<NewsItem[]>(CMS_CACHE_KEYS.publishedNews);
  return entry?.value ?? null;
}

export async function writeCachedPublishedNews(items: NewsItem[]): Promise<void> {
  await writeEntry(CMS_CACHE_KEYS.publishedNews, items);
}

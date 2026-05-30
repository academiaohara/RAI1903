export type UrlMetadata = {
  title: string | null;
  description: string | null;
  date: string | null;
  image: string | null;
};

const META_CONTENT =
  /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']([^"']+)["'][^>]*>/gi;

const TITLE_TAG = /<title[^>]*>([^<]+)<\/title>/i;

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => HTML_ENTITIES[name.toLowerCase()] ?? match);
}

function getMetaMap(html: string) {
  const map = new Map<string, string>();
  for (const match of html.matchAll(META_CONTENT)) {
    const key = (match[1] ?? match[4])?.toLowerCase();
    const content = match[2] ?? match[3];
    if (key && content && !map.has(key)) {
      map.set(key, decodeHtmlEntities(content));
    }
  }
  return map;
}

function getMeta(map: Map<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = map.get(key.toLowerCase());
    if (value) return value;
  }
  return null;
}

function parseTitleTag(html: string) {
  const match = html.match(TITLE_TAG);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function toIsoDate(value: string | null) {
  if (!value) return null;
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function dateFromUrlPath(url: string) {
  try {
    const { pathname } = new URL(url);
    const slashMatch = pathname.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (slashMatch) return `${slashMatch[1]}-${slashMatch[2]}-${slashMatch[3]}`;
    const hyphenMatch = pathname.match(/\/(\d{4})-(\d{2})-(\d{2})\//);
    if (hyphenMatch) return `${hyphenMatch[1]}-${hyphenMatch[2]}-${hyphenMatch[3]}`;
    const compactMatch = pathname.match(/-(\d{4})(\d{2})(\d{2})\d{6}-nt\.html$/);
    if (compactMatch) return `${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}`;
  } catch {
    return null;
  }
  return null;
}

function cleanTitle(title: string, url: string) {
  let cleaned = title.trim();
  cleaned = cleaned.replace(/\s*\|\s*El Comercio:.*$/i, "");
  if (url.includes("realavilesindustrial1903.com")) {
    cleaned = cleaned.replace(/\s*[–-]\s*Real Avilés Industrial.*$/i, "").trim();
  }
  return cleaned;
}

function imageScore(value: string) {
  let score = 0;
  if (/FOTO|noticia/i.test(value)) score += 20;
  if (/\/20\d{2}\/\d{2}\//.test(value)) score += 5;
  if (/-\d+x\d+\./i.test(value)) score -= 10;
  if (/(?:cropped-FAV|LOGO_|favicon|icon|avatar|Head2Head)/i.test(value)) score -= 30;
  return score;
}

function findArticleImage(html: string, url: string) {
  const origin = new URL(url).origin;
  const candidates = [...new Set(
    [...html.matchAll(/(?:https?:\/\/[^"'\\s]+)?\/wp-content\/uploads\/[^"'\\s]+\.(?:jpg|jpeg|png|webp)/gi)].map((match) => {
      const value = match[0].startsWith("http") ? match[0] : `${origin}${match[0]}`;
      return value.replace(/-\d+x\d+(?=\.(?:jpg|jpeg|png|webp)$)/i, "");
    }),
  )]
    .filter((value) => imageScore(value) > 0)
    .sort((a, b) => imageScore(b) - imageScore(a));

  return candidates[0] ?? null;
}

export function parseUrlMetadata(html: string, url: string): UrlMetadata {
  const meta = getMetaMap(html);
  const rawTitle =
    getMeta(meta, "og:title", "twitter:title") ?? parseTitleTag(html);
  const description = getMeta(meta, "og:description", "twitter:description", "description");
  const published = getMeta(meta, "article:published_time", "article:modified_time");
  const image =
    getMeta(meta, "og:image", "twitter:image") ?? findArticleImage(html, url);

  return {
    title: rawTitle ? cleanTitle(rawTitle, url) : null,
    description,
    date: toIsoDate(published) ?? dateFromUrlPath(url),
    image,
  };
}

export async function fetchUrlMetadata(url: string, init?: RequestInit): Promise<UrlMetadata> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RAI1903/1.0; +https://github.com/rai1903fan/rai1903webpage)",
      ...init?.headers,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseUrlMetadata(html, url);
}

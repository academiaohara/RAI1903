/** HTML interior de blockquotes `twitter-tweet` generados por publish.x.com. */
export type ClubXPostEmbed = {
  id: string;
  /** Contenido del blockquote tal como lo exporta X Publish (sin la etiqueta blockquote). */
  html: string;
};

export const CLUB_X_POSTS_STORAGE_KEY = "home:club_x_posts";

/** Ancho estándar de los embeds de X Publish. */
export const CLUB_X_EMBED_WIDTH_PX = 550;

export function isClubXPostsList(value: unknown): value is ClubXPostEmbed[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as ClubXPostEmbed).id === "string" &&
        typeof (item as ClubXPostEmbed).html === "string",
    )
  );
}

export function parseTweetIdFromEmbed(raw: string): string | null {
  const match = raw.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

/** Acepta HTML interior o blockquote completo exportado por publish.x.com. */
export function normalizeClubXPostEmbed(raw: string): ClubXPostEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const blockquoteMatch = trimmed.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  const html = (blockquoteMatch?.[1] ?? trimmed).trim();
  if (!html) return null;

  const id = parseTweetIdFromEmbed(html);
  if (!id) return null;

  return { id, html };
}

export function createClubXPostId(): string {
  return `club-x-post-${Date.now()}`;
}

export function mergeClubXPostLists(...lists: ClubXPostEmbed[][]): ClubXPostEmbed[] {
  const byId = new Map<string, ClubXPostEmbed>();
  for (const list of lists) {
    for (const post of list) {
      byId.set(post.id, post);
    }
  }
  return [...byId.values()];
}

export function moveClubXPost(
  posts: ClubXPostEmbed[],
  id: string,
  direction: "up" | "down",
): ClubXPostEmbed[] {
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return posts;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= posts.length) return posts;

  const next = [...posts];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const TWITTER_EPOCH_MS = BigInt(1288834974657);
const SNOWFLAKE_TIMESTAMP_SHIFT = BigInt(22);

/** Extrae la fecha de publicación desde el ID numérico de un tweet (snowflake de X). */
export function tweetPublishedAtMs(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  try {
    const snowflake = BigInt(id);
    return Number((snowflake >> SNOWFLAKE_TIMESTAMP_SHIFT) + TWITTER_EPOCH_MS);
  } catch {
    return null;
  }
}

/** Ordena tweets por fecha de publicación (más recientes primero). */
export function sortClubXPostsByDate(posts: ClubXPostEmbed[]): ClubXPostEmbed[] {
  return [...posts].sort((a, b) => {
    const aMs = tweetPublishedAtMs(a.id) ?? 0;
    const bMs = tweetPublishedAtMs(b.id) ?? 0;
    return bMs - aMs;
  });
}

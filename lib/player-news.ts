import { sortNewsByDate } from "@/lib/noticias";
import type { NewsItem } from "@/types";

function namePartsInText(name: string, text: string): boolean {
  const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = text.toLowerCase();
  return parts.length > 0 && parts.every((part) => haystack.includes(part));
}

export function newsMatchesPlayer(
  item: NewsItem,
  playerId: string,
  playerName?: string,
): boolean {
  if (item.playerIds?.includes(playerId)) return true;
  if (!playerName) return false;
  return namePartsInText(playerName, `${item.title} ${item.excerpt}`);
}

export function getNewsById(allNews: NewsItem[], id: string): NewsItem | undefined {
  return allNews.find((item) => item.id === id);
}

/** Noticia oficial del club vinculada a un fichaje o renovacion (comunicado). */
export function getPlayerClubAnnouncementNews(
  allNews: NewsItem[],
  playerId: string,
  options?: { announcementNewsId?: string; playerName?: string },
): NewsItem | undefined {
  if (options?.announcementNewsId) {
    const linked = getNewsById(allNews, options.announcementNewsId);
    if (linked) return linked;
  }

  return sortNewsByDate(
    allNews.filter(
      (item) =>
        item.channel === "club" &&
        (item.tags.includes("fichajes") || item.tags.includes("renovaciones")) &&
        newsMatchesPlayer(item, playerId, options?.playerName),
    ),
  )[0];
}

/** Resto de noticias del jugador (club y prensa) para el carrusel. */
export function getPlayerNews(
  allNews: NewsItem[],
  playerId: string,
  options?: { excludeNewsId?: string; playerName?: string },
): NewsItem[] {
  return sortNewsByDate(
    allNews.filter(
      (item) =>
        item.id !== options?.excludeNewsId &&
        newsMatchesPlayer(item, playerId, options?.playerName),
    ),
  );
}

/** Noticias del jugador cuando solo se dispone del nombre (fichajes sin ficha). */
export function getPlayerNewsByName(allNews: NewsItem[], playerName: string, excludeNewsId?: string): NewsItem[] {
  return sortNewsByDate(
    allNews.filter(
      (item) =>
        item.id !== excludeNewsId && namePartsInText(playerName, `${item.title} ${item.excerpt}`),
    ),
  );
}

import type { NewsItem, TransferRumor } from "@/types";

export type ClubAnnouncementDisplay = {
  /** Enlace al comunicado oficial (campo CMS). */
  url?: string;
  /** Texto legacy (mock antiguo); no usar en CMS nuevos. */
  text?: string;
  /** Metadatos obtenidos de la URL (CMS mercado de fichajes). */
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  date?: string;
  newsItem?: NewsItem;
};

const URL_PREFIX_RE = /^https?:\/\//i;

export function looksLikeClubAnnouncementUrl(value: string): boolean {
  if (URL_PREFIX_RE.test(value)) return true;
  if (/^www\./i.test(value)) return true;
  try {
    const withProtocol = URL_PREFIX_RE.test(value) ? value : `https://${value}`;
    const parsed = new URL(withProtocol);
    return Boolean(parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

/** Normaliza un enlace de comunicado (añade https si falta). */
export function normalizeClubAnnouncementUrl(value: string): string {
  const trimmed = value.trim();
  if (URL_PREFIX_RE.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function parseClubAnnouncementField(value: string | undefined): {
  url: string | null;
  legacyText: string | null;
} {
  if (!value?.trim()) return { url: null, legacyText: null };
  const trimmed = value.trim();
  if (looksLikeClubAnnouncementUrl(trimmed)) {
    return { url: normalizeClubAnnouncementUrl(trimmed), legacyText: null };
  }
  return { url: null, legacyText: trimmed };
}

const INLINE_ANNOUNCEMENT_ID = "club-announcement-inline";

/** Noticia para mostrar el comunicado con foto y titular (vinculada o sintetizada). */
export function clubAnnouncementNewsItem(
  announcement: ClubAnnouncementDisplay,
): NewsItem | null {
  if (announcement.newsItem) return announcement.newsItem;

  const date = announcement.date ?? new Date().toISOString().slice(0, 10);
  const source = "Real Avilés Industrial";

  if (announcement.text?.trim()) {
    const text = announcement.text.trim();
    const titleEnd = text.search(/[.!?](\s|$)/);
    const title =
      titleEnd > 0 && titleEnd < 100 ? text.slice(0, titleEnd + 1) : text.length > 90 ? `${text.slice(0, 87)}…` : text;

    return {
      id: INLINE_ANNOUNCEMENT_ID,
      channel: "club",
      source,
      date,
      title,
      excerpt: text,
      url: announcement.url ?? "#",
      tags: ["fichajes"],
      teams: ["masculino"],
    };
  }

  if (announcement.url) {
    const title = announcement.title?.trim();
    const excerpt = announcement.excerpt?.trim();
    return {
      id: INLINE_ANNOUNCEMENT_ID,
      channel: "club",
      source,
      date,
      title: title || "Comunicado oficial",
      excerpt: excerpt || "Lee el comunicado del club en la web oficial.",
      url: announcement.url,
      imageUrl: announcement.imageUrl,
      tags: ["club"],
      teams: ["masculino"],
    };
  }

  return null;
}

/** Enlace principal del comunicado (URL del mercado o de la noticia). */
export function clubAnnouncementHref(announcement: ClubAnnouncementDisplay): string | null {
  if (announcement.url) return announcement.url;
  const news = announcement.newsItem;
  if (news?.url && news.url !== "#") return news.url;
  return null;
}

export function clubAnnouncementFromTransfer(
  transfer: TransferRumor | undefined,
  announcementNews?: NewsItem,
): ClubAnnouncementDisplay | undefined {
  if (transfer?.clubAnnouncement) {
    const parsed = parseClubAnnouncementField(transfer.clubAnnouncement);
    const metaDate = transfer.clubAnnouncementDate;
    return {
      url: parsed.url ?? undefined,
      text: parsed.legacyText ?? undefined,
      title: transfer.clubAnnouncementTitle,
      excerpt: transfer.clubAnnouncementExcerpt,
      imageUrl: transfer.clubAnnouncementImageUrl,
      date: metaDate ?? transfer.date,
      newsItem: announcementNews,
    };
  }

  if (announcementNews) {
    return {
      text: announcementNews.excerpt,
      date: announcementNews.date,
      newsItem: announcementNews,
    };
  }

  return undefined;
}

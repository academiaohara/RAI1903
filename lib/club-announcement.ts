import type { NewsItem, TransferRumor } from "@/types";

export type ClubAnnouncementDisplay = {
  /** Enlace al comunicado oficial (campo CMS). */
  url?: string;
  /** Texto legacy (mock antiguo); no usar en CMS nuevos. */
  text?: string;
  date?: string;
  newsItem?: NewsItem;
};

const URL_PREFIX_RE = /^https?:\/\//i;

function looksLikeUrl(value: string): boolean {
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
  if (looksLikeUrl(trimmed)) {
    return { url: normalizeClubAnnouncementUrl(trimmed), legacyText: null };
  }
  return { url: null, legacyText: trimmed };
}

export function clubAnnouncementFromTransfer(
  transfer: TransferRumor | undefined,
  announcementNews?: NewsItem,
): ClubAnnouncementDisplay | undefined {
  if (transfer?.clubAnnouncement) {
    const parsed = parseClubAnnouncementField(transfer.clubAnnouncement);
    return {
      url: parsed.url ?? undefined,
      text: parsed.legacyText ?? undefined,
      date: transfer.date,
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

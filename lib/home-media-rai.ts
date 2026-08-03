import { contenidoFanSections } from "@/lib/contenido-fan";
import { isContenidoFanSlug } from "@/lib/contenido-fan-slugs";
import { collectMediaRaiSpaces, sortFanSpacesByDate } from "@/lib/fan-spaces";
import { collectMediaRaiVideos, parseFanVideoDate } from "@/lib/fan-videos";
import { getMediaRaiSectionLabel, type MediaRaiSectionEntry } from "@/lib/media-rai-sections";
import { youtubeVideoId } from "@/lib/youtube";
import type { FanMediaLink, FanYouTubeVideo } from "@/types";

export const HOME_MEDIA_RAI_ITEM_LIMIT = 12;

type HomeMediaRaiItemBase = {
  id: string;
  title: string;
  url: string;
  date?: string;
  sectionSlug: string;
  sectionLabel: string;
  sortDate: number;
};

export type HomeMediaRaiVideoItem = HomeMediaRaiItemBase & {
  kind: "video";
  videoId: string;
};

export type HomeMediaRaiSpaceItem = HomeMediaRaiItemBase & {
  kind: "space";
  description?: string;
  avatarUrl?: string;
};

export type HomeMediaRaiItem = HomeMediaRaiVideoItem | HomeMediaRaiSpaceItem;

function fallbackVideosForSection(slug: string): FanYouTubeVideo[] {
  if (!isContenidoFanSlug(slug)) return [];
  return contenidoFanSections[slug].videos ?? [];
}

function fallbackSpacesForSection(slug: string): FanMediaLink[] {
  if (!isContenidoFanSlug(slug)) return [];
  return contenidoFanSections[slug].links ?? [];
}

function toVideoItem(video: FanYouTubeVideo, entry: MediaRaiSectionEntry): HomeMediaRaiVideoItem | null {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;

  return {
    kind: "video",
    id: video.id,
    title: video.title,
    url: video.url,
    date: video.date,
    videoId,
    sectionSlug: entry.slug,
    sectionLabel: getMediaRaiSectionLabel(entry),
    sortDate: parseFanVideoDate(video.date),
  };
}

function toSpaceItem(space: FanMediaLink, entry: MediaRaiSectionEntry): HomeMediaRaiSpaceItem | null {
  if (!space.url?.trim()) return null;

  return {
    kind: "space",
    id: space.id,
    title: space.name,
    url: space.url,
    date: space.date,
    description: space.description || undefined,
    avatarUrl: space.avatarUrl,
    sectionSlug: entry.slug,
    sectionLabel: getMediaRaiSectionLabel(entry),
    sortDate: parseFanVideoDate(space.date),
  };
}

/** Contenido reciente de Media RAI (vídeos y espacios de X) para el carrusel de inicio. */
export function collectHomeMediaRaiItems(
  sections: MediaRaiSectionEntry[],
  overrides: Record<string, unknown>,
  limit = HOME_MEDIA_RAI_ITEM_LIMIT,
): HomeMediaRaiItem[] {
  const items: HomeMediaRaiItem[] = [];
  const seenVideoIds = new Set<string>();
  const seenSpaceIds = new Set<string>();

  for (const entry of sections) {
    const { videos } = collectMediaRaiVideos(entry.slug, overrides, fallbackVideosForSection(entry.slug));
    for (const video of videos) {
      const videoId = youtubeVideoId(video.url);
      if (!videoId || seenVideoIds.has(videoId)) continue;

      const item = toVideoItem(video, entry);
      if (!item) continue;

      seenVideoIds.add(videoId);
      items.push(item);
    }

    const { spaces } = collectMediaRaiSpaces(entry.slug, overrides, fallbackSpacesForSection(entry.slug));
    for (const space of sortFanSpacesByDate(spaces)) {
      if (seenSpaceIds.has(space.id)) continue;

      const item = toSpaceItem(space, entry);
      if (!item) continue;

      seenSpaceIds.add(space.id);
      items.push(item);
    }
  }

  return items
    .sort((a, b) => {
      const dateDiff = b.sortDate - a.sortDate;
      if (dateDiff !== 0) return dateDiff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, limit);
}

/** @deprecated Usa collectHomeMediaRaiItems. */
export function collectHomeMediaRaiVideos(
  sections: MediaRaiSectionEntry[],
  overrides: Record<string, unknown>,
  limit = HOME_MEDIA_RAI_ITEM_LIMIT,
): HomeMediaRaiVideoItem[] {
  return collectHomeMediaRaiItems(sections, overrides, limit).filter(
    (item): item is HomeMediaRaiVideoItem => item.kind === "video",
  );
}

/** @deprecated Usa HomeMediaRaiItem. */
export type HomeMediaRaiVideo = HomeMediaRaiVideoItem;

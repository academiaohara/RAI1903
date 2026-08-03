import { contenidoFanSections } from "@/lib/contenido-fan";
import { isContenidoFanSlug } from "@/lib/contenido-fan-slugs";
import { collectMediaRaiVideos, sortFanVideosByDate } from "@/lib/fan-videos";
import { getMediaRaiSectionLabel, type MediaRaiSectionEntry } from "@/lib/media-rai-sections";
import { youtubeVideoId } from "@/lib/youtube";
import type { FanYouTubeVideo } from "@/types";

export const HOME_MEDIA_RAI_VIDEO_LIMIT = 12;

export type HomeMediaRaiVideo = {
  id: string;
  title: string;
  url: string;
  date?: string;
  videoId: string;
  sectionSlug: string;
  sectionLabel: string;
};

function fallbackVideosForSection(slug: string): FanYouTubeVideo[] {
  if (!isContenidoFanSlug(slug)) return [];
  return contenidoFanSections[slug].videos ?? [];
}

function toHomeMediaRaiVideo(
  video: FanYouTubeVideo,
  entry: MediaRaiSectionEntry,
): HomeMediaRaiVideo | null {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;

  return {
    id: video.id,
    title: video.title,
    url: video.url,
    date: video.date,
    videoId,
    sectionSlug: entry.slug,
    sectionLabel: getMediaRaiSectionLabel(entry),
  };
}

/** Vídeos recientes de todas las subsecciones de Media RAI para el carrusel de inicio. */
export function collectHomeMediaRaiVideos(
  sections: MediaRaiSectionEntry[],
  overrides: Record<string, unknown>,
  limit = HOME_MEDIA_RAI_VIDEO_LIMIT,
): HomeMediaRaiVideo[] {
  const merged: FanYouTubeVideo[] = [];
  const sectionByVideoId = new Map<string, MediaRaiSectionEntry>();

  for (const entry of sections) {
    const { videos } = collectMediaRaiVideos(entry.slug, overrides, fallbackVideosForSection(entry.slug));

    for (const video of videos) {
      const videoId = youtubeVideoId(video.url);
      if (!videoId) continue;

      const dedupeKey = videoId;
      if (sectionByVideoId.has(dedupeKey)) continue;

      sectionByVideoId.set(dedupeKey, entry);
      merged.push(video);
    }
  }

  const sorted = sortFanVideosByDate(merged);
  const items: HomeMediaRaiVideo[] = [];

  for (const video of sorted) {
    const videoId = youtubeVideoId(video.url);
    if (!videoId) continue;

    const entry = sectionByVideoId.get(videoId);
    if (!entry) continue;

    const item = toHomeMediaRaiVideo(video, entry);
    if (!item) continue;

    items.push(item);
    if (items.length >= limit) break;
  }

  return items;
}

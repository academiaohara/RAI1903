import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { FanYouTubeVideo } from "@/types";

/** Temporada ancla en Supabase para overrides globales de Media RAI (no dependen de la vista de temporada). */
export const MEDIA_RAI_INLINE_SEASON_ID = DEFAULT_COMPETITION_SEASON_ID;

/** Clave CMS global para vídeos de Media RAI (sin temporada). */
export function mediaRaiVideosStorageKey(section: string): string {
  return `media-rai:${section}:videos`;
}

const LEGACY_MEDIA_RAI_VIDEO_KEY = /^contenido-fan:[^:]+:([^:]+):videos$/;

/** Clave CMS para la lista completa de vídeos de una sección. */
export function fanVideosStorageKey(
  section: string,
  seasonId: string,
  gender?: PrimerEquipoGender,
): string {
  if (gender) return `primer-equipo:${gender}:contenido-fan:${seasonId}:${section}:videos`;
  return mediaRaiVideosStorageKey(section);
}

export function isMediaRaiGlobalInlineKey(key: string): boolean {
  if (key.startsWith("media-rai:")) return true;
  return LEGACY_MEDIA_RAI_VIDEO_KEY.test(key) && !key.includes("primer-equipo");
}

export function isLegacyMediaRaiVideoKey(key: string, section: string): boolean {
  return LEGACY_MEDIA_RAI_VIDEO_KEY.test(key) && key.endsWith(`:${section}:videos`) && !key.includes("primer-equipo");
}

function isFanVideoList(value: unknown): value is FanYouTubeVideo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => item && typeof item === "object" && "id" in item && "title" in item && "url" in item,
    )
  );
}

/** Une listas de vídeos sin duplicar por id; ante conflicto gana la entrada más reciente en el array. */
export function mergeFanVideoLists(...lists: FanYouTubeVideo[][]): FanYouTubeVideo[] {
  const byId = new Map<string, FanYouTubeVideo>();
  for (const list of lists) {
    for (const video of list) {
      byId.set(video.id, video);
    }
  }
  return sortFanVideosByDate([...byId.values()]);
}

/** Combina overrides de todas las temporadas (y clave global) con el fallback del mock. */
export function collectMediaRaiVideos(
  section: string,
  overrides: Record<string, unknown>,
  fallback: FanYouTubeVideo[],
): { videos: FanYouTubeVideo[]; hasCustomList: boolean } {
  const lists: FanYouTubeVideo[][] = [];
  const globalKey = mediaRaiVideosStorageKey(section);
  const globalValue = overrides[globalKey];
  if (isFanVideoList(globalValue)) lists.push(globalValue);

  for (const [key, value] of Object.entries(overrides)) {
    if (key === globalKey || !isLegacyMediaRaiVideoKey(key, section)) continue;
    if (isFanVideoList(value)) lists.push(value);
  }

  if (lists.length === 0) {
    return { videos: fallback, hasCustomList: false };
  }

  return { videos: mergeFanVideoLists(...lists), hasCustomList: true };
}

/** Convierte DD/MM/AAAA o ISO a timestamp; sin fecha válida devuelve 0. */
export function parseFanVideoDate(value: string | undefined): number {
  if (!value?.trim()) return 0;

  const trimmed = value.trim();
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    const day = Number(slashParts[0]);
    const month = Number(slashParts[1]);
    const year = Number(slashParts[2]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
      return Date.UTC(year, month - 1, day);
    }
  }

  const iso = Date.parse(trimmed);
  return Number.isNaN(iso) ? 0 : iso;
}

export function sortFanVideosByDate(videos: FanYouTubeVideo[]): FanYouTubeVideo[] {
  return [...videos].sort((a, b) => {
    const dateDiff = parseFanVideoDate(b.date) - parseFanVideoDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return a.id.localeCompare(b.id);
  });
}

export function createFanVideoId(section: string): string {
  return `${section}-video-${Date.now()}`;
}

const DEFAULT_FAN_VIDEO_TITLE = "Nuevo vídeo";

export function isDefaultFanVideoTitle(title: string): boolean {
  return title.trim() === DEFAULT_FAN_VIDEO_TITLE;
}

export function newFanVideo(section: string): FanYouTubeVideo {
  const today = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return {
    id: createFanVideoId(section),
    title: DEFAULT_FAN_VIDEO_TITLE,
    url: "",
    date: today,
  };
}

import type { ContenidoFanSlug } from "@/lib/contenido-fan";
import type { FanYouTubeVideo } from "@/types";

/** Clave CMS para la lista completa de vídeos de una sección. */
export function fanVideosStorageKey(section: ContenidoFanSlug): string {
  return `contenido-fan:${section}:videos`;
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

export function createFanVideoId(section: ContenidoFanSlug): string {
  return `${section}-video-${Date.now()}`;
}

const DEFAULT_FAN_VIDEO_TITLE = "Nuevo vídeo";

export function isDefaultFanVideoTitle(title: string): boolean {
  return title.trim() === DEFAULT_FAN_VIDEO_TITLE;
}

export function newFanVideo(section: ContenidoFanSlug): FanYouTubeVideo {
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

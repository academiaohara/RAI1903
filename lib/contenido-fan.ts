import type { FanMediaLink, FanYouTubeVideo } from "@/types";
import {
  fanDelClubVideos,
  fanPreviaVideos,
  fanRdpVideos,
  fanResumenesVideos,
  fanTenteFirme,
  fanTenteFirmeVideos,
  fanZonaMixtaVideos,
} from "@/data/mock";
import {
  CONTENIDO_FAN_SLUGS,
  isContenidoFanSlug,
  type ContenidoFanSlug,
} from "@/lib/contenido-fan-slugs";
import { getMediaRaiSectionLabel, type MediaRaiSectionEntry } from "@/lib/media-rai-sections";

export { CONTENIDO_FAN_SLUGS, isContenidoFanSlug, type ContenidoFanSlug };

type ContenidoFanSectionConfig = {
  slug: string;
  label: string;
  heroTitle: string;
  heroDescription: string;
  cardEyebrow?: string;
  cardIntro: string;
  links: FanMediaLink[];
  videos?: FanYouTubeVideo[];
};

export const contenidoFanSections: Record<ContenidoFanSlug, ContenidoFanSectionConfig> = {
  "zona-mixta": {
    slug: "zona-mixta",
    label: "Zona Mixta",
    heroTitle: "Zona Mixta",
    heroDescription:
      "Programa oficial del club con entrevistas a directivos, entrenadores y jugadores. Presentado por Jorge Quirós.",
    cardIntro:
      "Espacio semanal de actualidad blanquiazul. El último episodio se reproduce arriba; el resto aparece en el carrusel inferior.",
    links: [],
    videos: fanZonaMixtaVideos,
  },
  previa: {
    slug: "previa",
    label: "Previa",
    heroTitle: "Previas",
    heroDescription: "Entrevistas y piezas de antes del partido con rivales, entrenadores y claves del duelo.",
    cardIntro: "El último vídeo se reproduce arriba; el resto aparece en el carrusel inferior.",
    links: [],
    videos: fanPreviaVideos,
  },
  rdp: {
    slug: "rdp",
    label: "RDP",
    heroTitle: "Ruedas de prensa",
    heroDescription: "RDP del Real Avilés Industrial: comparecencias de Lolo Escobar y el cuerpo técnico tras cada jornada.",
    cardIntro: "El último vídeo se reproduce arriba; el resto aparece en el carrusel inferior.",
    links: [],
    videos: fanRdpVideos,
  },
  resumenes: {
    slug: "resumenes",
    label: "Resúmenes",
    heroTitle: "Resúmenes de liga",
    heroDescription:
      "Vídeos resumen oficiales de los partidos de liga del Real Avilés Industrial: los goles y las jugadas clave de cada jornada.",
    cardIntro: "El último resumen se reproduce arriba; el resto aparece en el carrusel inferior.",
    links: [],
    videos: fanResumenesVideos,
  },
  "del-club": {
    slug: "del-club",
    label: "Del club",
    heroTitle: "Del club",
    heroDescription:
      "Entrevistas, presentaciones de fichajes, actos institucionales y otros vídeos publicados por el Real Avilés Industrial.",
    cardIntro: "El último vídeo se reproduce arriba; el resto aparece en el carrusel inferior.",
    links: [],
    videos: fanDelClubVideos,
  },
  "tente-firme": {
    slug: "tente-firme",
    label: "Tente firme",
    heroTitle: "Tente firme",
    heroDescription:
      "Contenido de afición, peñas y apoyo a la plantilla: directos, tertulias y piezas que animan a «tenerse firme» en cada jornada.",
    cardEyebrow: "Afición",
    cardIntro:
      "Tertulias y directos de aficion en X Spaces. Recorre el carrusel para escuchar cada episodio en X.",
    links: fanTenteFirme,
    videos: fanTenteFirmeVideos,
  },
};

const CUSTOM_SECTION_INTRO =
  "El último vídeo se reproduce arriba; el resto aparece en el carrusel inferior.";

/** Config de sección: built-in del mock o plantilla vacía para subsecciones nuevas. */
export function resolveContenidoFanSection(
  slug: string,
  sections?: MediaRaiSectionEntry[],
): ContenidoFanSectionConfig {
  if (isContenidoFanSlug(slug)) {
    const builtIn = contenidoFanSections[slug];
    const entry = sections?.find((item) => item.slug === slug);
    if (!entry?.label?.trim()) return builtIn;

    const label = getMediaRaiSectionLabel(entry);
    return {
      ...builtIn,
      label,
      heroTitle: label,
    };
  }

  const entry = sections?.find((item) => item.slug === slug);
  const label = entry ? getMediaRaiSectionLabel(entry) : slug;

  return {
    slug,
    label,
    heroTitle: label,
    heroDescription: "",
    cardIntro: CUSTOM_SECTION_INTRO,
    links: [],
    videos: [],
  };
}

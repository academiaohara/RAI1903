import type { FanMediaLink, FanYouTubeVideo } from "@/types";
import { fanPreviaVideos, fanRdpVideos, fanTenteFirme, fanTenteFirmeVideos, fanZonaMixtaVideos } from "@/data/mock";

export const CONTENIDO_FAN_SLUGS = ["zona-mixta", "previa", "rdp", "tente-firme"] as const;

export type ContenidoFanSlug = (typeof CONTENIDO_FAN_SLUGS)[number];

export function isContenidoFanSlug(value: string): value is ContenidoFanSlug {
  return CONTENIDO_FAN_SLUGS.includes(value as ContenidoFanSlug);
}

type ContenidoFanSectionConfig = {
  slug: ContenidoFanSlug;
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
  "tente-firme": {
    slug: "tente-firme",
    label: "Tente firme",
    heroTitle: "Tente firme",
    heroDescription:
      "Contenido de afición, peñas y apoyo a la plantilla: directos, tertulias y piezas que animan a «tenerse firme» en cada jornada.",
    cardEyebrow: "Afición",
    cardIntro:
      "Tertulias y directos de aficion en X Spaces. El espacio destacado abre la grabacion en X; el resto aparece en el carrusel.",
    links: fanTenteFirme,
    videos: fanTenteFirmeVideos,
  },
};

export function getContenidoFanTabs() {
  return [
    { href: "/contenido-fan/zona-mixta", label: "Zona Mixta" },
    { href: "/contenido-fan/previa", label: "Previa" },
    { href: "/contenido-fan/rdp", label: "RDP" },
    { href: "/contenido-fan/tente-firme", label: "Tente firme" },
  ];
}

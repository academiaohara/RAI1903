import type { FanMediaLink } from "@/types";
import { fanPrevia, fanRdp, fanTenteFirme, fanZonaMixta } from "@/data/mock";

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
  cardEyebrow: string;
  cardTitle: string;
  cardIntro: string;
  links: FanMediaLink[];
};

export const contenidoFanSections: Record<ContenidoFanSlug, ContenidoFanSectionConfig> = {
  "zona-mixta": {
    slug: "zona-mixta",
    label: "Zona Mixta",
    heroTitle: "Zona Mixta",
    heroDescription:
      "Programa oficial del club con entrevistas a directivos, entrenadores y jugadores. Presentado por Jorge Quirós en RAI Radio.",
    cardEyebrow: "RAI Radio",
    cardTitle: "Zona Mixta",
    cardIntro:
      "Espacio semanal de actualidad blanquiazul. Sustituye las URLs por el episodio o playlist concreta cuando quieras destacar uno.",
    links: fanZonaMixta,
  },
  previa: {
    slug: "previa",
    label: "Previa",
    heroTitle: "Previas",
    heroDescription: "Entrevistas y piezas de antes del partido con rivales, entrenadores y claves del duelo.",
    cardEyebrow: "Antes del partido",
    cardTitle: "La previa",
    cardIntro:
      "Enlaza las previas publicadas en YouTube u otras plataformas. Cada tarjeta puede apuntar a un vídeo concreto de la jornada.",
    links: fanPrevia,
  },
  rdp: {
    slug: "rdp",
    label: "RDP",
    heroTitle: "Ruedas de prensa",
    heroDescription: "RDP del Real Avilés Industrial: comparecencias de Lolo Escobar y el cuerpo técnico tras cada jornada.",
    cardEyebrow: "RDP",
    cardTitle: "Ruedas de prensa",
    cardIntro: "Añade el enlace de cada rueda de prensa oficial. El formato habitual en el canal es «RDP | …».",
    links: fanRdp,
  },
  "tente-firme": {
    slug: "tente-firme",
    label: "Tente firme",
    heroTitle: "Tente firme",
    heroDescription:
      "Contenido de afición, peñas y apoyo a la plantilla: directos, tertulias y piezas que animan a «tenerse firme» en cada jornada.",
    cardEyebrow: "Afición",
    cardTitle: "Tente firme",
    cardIntro:
      "Huecos para enlazar programas de peñas, tertulias de aficionados o vídeos de apoyo al equipo fuera del canal oficial.",
    links: fanTenteFirme,
  },
};

export function getContenidoFanTabs() {
  return [
    { href: "/contenido-fan/zona-mixta", label: "Zona Mixta" },
    { href: "/contenido-fan/previa", label: "Previa" },
    { href: "/contenido-fan/rdp", label: "RDP" },
    { href: "/contenido-fan/tente-firme", label: "Tente firme" },
    { href: "/contenido-fan/podcasts", label: "Podcasts" },
  ];
}

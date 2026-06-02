export const CONTENIDO_FAN_SLUGS = [
  "zona-mixta",
  "previa",
  "rdp",
  "resumenes",
  "del-club",
  "tente-firme",
] as const;

export type ContenidoFanSlug = (typeof CONTENIDO_FAN_SLUGS)[number];

export function isContenidoFanSlug(value: string): value is ContenidoFanSlug {
  return CONTENIDO_FAN_SLUGS.includes(value as ContenidoFanSlug);
}

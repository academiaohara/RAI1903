import { STADIUM_PATHS } from "@/lib/stadium-manifest";

/** Dorsales con foto oficial temporada 2025/26 (masculino). */
export const SQUAD_PHOTO_DORSALS_2526 = new Set([
  1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26,
]);

export function getSquadPlayerPhoto(dorsal: number): string | null {
  if (!SQUAD_PHOTO_DORSALS_2526.has(dorsal)) return null;
  return `/plantilla/2526/${dorsal}.webp`;
}

const GENERIC_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";

/** @deprecated Use getStadiumPhoto(teamId) */
export const STADIUM_ROMAN_SUAREZ_PHOTO = STADIUM_PATHS["real-aviles-industrial"] ?? "/estadio/real-aviles-industrial.jpg";

export function getStadiumPhoto(teamId: string): string {
  return STADIUM_PATHS[teamId] ?? GENERIC_STADIUM_IMAGE;
}

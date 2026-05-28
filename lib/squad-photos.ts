/** Dorsales con foto oficial temporada 2025/26 (masculino). */
export const SQUAD_PHOTO_DORSALS_2526 = new Set([
  1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26,
]);

export function getSquadPlayerPhoto(dorsal: number): string | null {
  if (!SQUAD_PHOTO_DORSALS_2526.has(dorsal)) return null;
  return `/plantilla/2526/${dorsal}.webp`;
}

export const STADIUM_ROMAN_SUAREZ_PHOTO = "/estadio/roman-suarez-puerta.jpg";

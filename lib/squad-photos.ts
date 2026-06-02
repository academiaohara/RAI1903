import type { SquadPlayer } from "@/types/squad";
import { STADIUM_PATHS } from "@/lib/stadium-manifest";

/** Dorsales con foto oficial temporada 2025/26 (masculino). */
export const SQUAD_PHOTO_DORSALS_2526 = new Set([
  1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26,
]);

export function getSquadPlayerPhoto(dorsal: number): string | null {
  if (!SQUAD_PHOTO_DORSALS_2526.has(dorsal)) return null;
  return `/plantilla/2526/${dorsal}.webp`;
}

/** Convierte enlaces tipo /blob/ de GitHub a raw.githubusercontent.com (sirven como src de imagen). */
export function normalizeSquadPlayerPhotoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname !== "github.com") return trimmed;

    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
    if (!match) return trimmed;

    const [, owner, repo, branch, filePath] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  } catch {
    return trimmed;
  }
}

/** Foto efectiva: local en repo por dorsal; si no, URL del CMS normalizada. */
export function resolveSquadPlayerPhoto(player: SquadPlayer): string | null {
  const local = getSquadPlayerPhoto(player.dorsal);
  if (local) return local;
  if (!player.foto) return null;
  return normalizeSquadPlayerPhotoUrl(player.foto);
}

/**
 * Alinea `foto` con los assets del repo cuando hay dorsal conocido.
 * Las URLs de GitHub del CMS se ignoran en ese caso (Next/Image no las sirve bien como /blob/).
 */
export function withSquadPlayerPhoto(player: SquadPlayer): SquadPlayer {
  const foto = resolveSquadPlayerPhoto(player);
  return foto ? { ...player, foto } : { ...player, foto: null };
}

/** Rutas locales y GitHub: cargar sin optimizador de Next (evita 403 / dominio no permitido). */
export function squadPlayerImageRequiresUnoptimized(src: string): boolean {
  if (src.startsWith("/")) return true;

  try {
    const host = new URL(src).hostname;
    return (
      host === "github.com" ||
      host === "raw.githubusercontent.com" ||
      host.endsWith(".githubusercontent.com")
    );
  } catch {
    return false;
  }
}

const GENERIC_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";

/** @deprecated Use getStadiumPhoto(teamId) */
export const STADIUM_ROMAN_SUAREZ_PHOTO = STADIUM_PATHS["real-aviles-industrial"] ?? "/estadio/real-aviles-industrial.jpg";

export function getStadiumPhoto(teamId: string): string {
  return STADIUM_PATHS[teamId] ?? GENERIC_STADIUM_IMAGE;
}

import type { SquadPlayer } from "@/types/squad";
import { STADIUM_PATHS } from "@/lib/stadium-manifest";

/** Ruta por defecto en `public/Jugadores/` (p. ej. `/Jugadores/13.webp`). */
export function defaultSquadPlayerPhotoPath(dorsal: number): string | null {
  if (!Number.isFinite(dorsal) || dorsal <= 0) return null;
  return `/Jugadores/${dorsal}.webp`;
}

/** @deprecated Usa `defaultSquadPlayerPhotoPath`. */
export function getSquadPlayerPhoto(dorsal: number): string | null {
  return defaultSquadPlayerPhotoPath(dorsal);
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

/** Foto efectiva: ruta explícita del jugador; si no, dorsal en `/Jugadores/`. */
export function resolveSquadPlayerPhoto(player: SquadPlayer): string | null {
  if (player.foto?.trim()) {
    const trimmed = player.foto.trim();
    if (trimmed.startsWith("/") || trimmed.startsWith("http")) {
      return trimmed.startsWith("http") ? normalizeSquadPlayerPhotoUrl(trimmed) : trimmed;
    }
    return `/${trimmed.replace(/^\/+/, "")}`;
  }
  return defaultSquadPlayerPhotoPath(player.dorsal);
}

/** Alinea `foto` con la ruta resuelta (respeta overrides del editor). */
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

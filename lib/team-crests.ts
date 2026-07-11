import { ESCUDO_PATHS } from "@/lib/escudo-manifest";
import type { Team } from "@/types";

/** Rutas por defecto desde imágenes en public/escudos (manifest). */
export const TEAM_CREST_PATHS: Record<string, string> = ESCUDO_PATHS;

/** Asociaciones temporada → escudo guardadas en Supabase (las define el editor). */
let cmsCrestByTeamId: Record<string, string> = {};

export function setCmsTeamCrestMap(map: Record<string, string>) {
  cmsCrestByTeamId = map;
}

export const teamCrestOverrideKey = (teamId: string) => `team-crest:${teamId}`;

export function isTeamCrestUrl(value: string): boolean {
  return value.startsWith("/") || value.startsWith("http");
}

/** Sombra suave para que escudos claros (p. ej. Avilés) no se pierdan sobre fondos blancos o azules. */
export const teamCrestDropShadowClassName = "drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]";

function resolveCrestPath(teamId: string, crestInitials?: string): string {
  const fromCms = cmsCrestByTeamId[teamId];
  if (fromCms && isTeamCrestUrl(fromCms)) return fromCms;
  const fromRepo = TEAM_CREST_PATHS[teamId];
  if (fromRepo) return fromRepo;
  return crestInitials ?? teamId.slice(0, 3).toUpperCase();
}

export function getTeamCrest(team: Pick<Team, "id" | "crestInitials"> | undefined): string {
  if (!team) return "???";
  return resolveCrestPath(team.id, team.crestInitials);
}

export function getTeamCrestById(teamId: string, crestInitials?: string): string {
  return resolveCrestPath(teamId, crestInitials);
}

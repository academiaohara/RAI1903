import { ESCUDO_PATHS } from "@/lib/escudo-manifest";
import type { Team } from "@/types";

/** Public paths for 1ª RFEF Grupo I 25/26 crests (see /public/escudos). Regenerate with `npm run sync:escudos`. */
export const TEAM_CREST_PATHS: Record<string, string> = ESCUDO_PATHS;

export function isTeamCrestUrl(value: string): boolean {
  return value.startsWith("/") || value.startsWith("http");
}

export function getTeamCrest(team: Pick<Team, "id" | "crestInitials"> | undefined): string {
  if (!team) return "???";
  return TEAM_CREST_PATHS[team.id] ?? team.crestInitials;
}

export function getTeamCrestById(teamId: string, crestInitials?: string): string {
  return TEAM_CREST_PATHS[teamId] ?? crestInitials ?? teamId.slice(0, 3).toUpperCase();
}

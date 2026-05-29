import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import type { Team } from "@/types";

/** Public paths for 1ª RFEF Grupo I 25/26 crests (see /public/escudos). */
export const TEAM_CREST_PATHS: Record<string, string> = {
  [RAI_TEAM_ID]: "/escudos/real-aviles-industrial.jpg",
  [RAI_FEM_TEAM_ID]: "/escudos/real-aviles-industrial.jpg",
  ferrol: "/escudos/ferrol.jpg",
  lugo: "/escudos/lugo.jpg",
  pontevedra: "/escudos/pontevedra.jpg",
  zamora: "/escudos/zamora.jpg",
  arenteiro: "/escudos/arenteiro.jpg",
  unionistas: "/escudos/unionistas.jpg",
  ponferradina: "/escudos/ponferradina.jpg",
  castilla: "/escudos/castilla.jpg",
  tenerife: "/escudos/tenerife.jpg",
  talavera: "/escudos/talavera.jpg",
  merida: "/escudos/merida.jpg",
  "celta-fortuna": "/escudos/celta-fortuna.jpg",
  cacereno: "/escudos/cacereno.jpg",
  guadalajara: "/escudos/guadalajara.jpg",
  ourense: "/escudos/ourense.jpg",
  arenas: "/escudos/arenas.jpg",
  barakaldo: "/escudos/barakaldo.jpg",
  "athletic-bilbao-b": "/escudos/athletic-bilbao-b.jpg",
  "osasuna-promesas": "/escudos/osasuna-promesas.jpg",
};

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

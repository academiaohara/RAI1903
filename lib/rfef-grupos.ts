import { teams as teamsGrupo1, teamsGrupo2 } from "@/data/mock";
import type { Team } from "@/types";

export const RFEF_GRUPOS = [
  { id: "1", label: "Grupo 1" },
  { id: "2", label: "Grupo 2" },
] as const;

export type RfefGrupoId = (typeof RFEF_GRUPOS)[number]["id"];

export function isRfefGrupoId(value: string): value is RfefGrupoId {
  return value === "1" || value === "2";
}

export function getTeamsForRfefGrupo(grupo: RfefGrupoId): Team[] {
  return grupo === "2" ? teamsGrupo2 : teamsGrupo1;
}

export { teamsGrupo1 };

import { players, playersFemenino } from "@/data/mock";
import type { Player } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function getPlayersByGender(gender: PrimerEquipoGender): Player[] {
  return gender === "femenino" ? playersFemenino : players;
}

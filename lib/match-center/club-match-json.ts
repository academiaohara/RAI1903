import { getRaiTeamId } from "@/lib/fixtures";
import { resolveClubSideInMatch } from "@/lib/season/club-team-ids";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type ClubMatchJsonContext = {
  avilesTeamId: string;
  avilesIsHome: boolean;
  /** Clave JSON del Avilés (siempre "aviles"). */
  avilesKey: "aviles";
  /** "visitante" si el Avilés es local; "local" si juega fuera. */
  rivalKey: "visitante" | "local";
};

export function buildClubMatchJsonContext(
  homeTeamId: string,
  awayTeamId: string,
  gender: PrimerEquipoGender,
  clubTeamIds?: readonly string[],
): ClubMatchJsonContext | null {
  const ids = clubTeamIds?.length ? clubTeamIds : [getRaiTeamId(gender)];
  const clubSide = resolveClubSideInMatch({ homeTeamId, awayTeamId, homeTeam: "", awayTeam: "" }, ids);
  if (!clubSide) return null;

  return {
    avilesTeamId: clubSide.isHome ? homeTeamId : awayTeamId,
    avilesIsHome: clubSide.isHome,
    avilesKey: "aviles",
    rivalKey: clubSide.isHome ? "visitante" : "local",
  };
}

export function clubSideToStorageTeam(
  side: string,
  context: ClubMatchJsonContext,
): "home" | "away" | null {
  const normalized = side.toLowerCase();
  if (normalized === "aviles" || normalized === "avilés") {
    return context.avilesIsHome ? "home" : "away";
  }
  if (normalized === "home" || normalized === "local" || normalized === "casa" || normalized === "h") {
    return "home";
  }
  if (normalized === "away" || normalized === "visitante" || normalized === "fuera" || normalized === "a") {
    return "away";
  }
  return null;
}

export function storageTeamToClubJsonTeam(
  team: "home" | "away",
  context: ClubMatchJsonContext,
): "aviles" | "local" | "visitante" {
  const avilesStorage: "home" | "away" = context.avilesIsHome ? "home" : "away";
  if (team === avilesStorage) return "aviles";
  return context.rivalKey;
}

export function isAvilesStorageTeam(team: "home" | "away", context: ClubMatchJsonContext): boolean {
  return team === (context.avilesIsHome ? "home" : "away");
}

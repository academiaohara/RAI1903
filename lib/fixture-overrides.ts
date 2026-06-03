import {
  applyMatchResultOverride,
  type MatchResultOverride,
  type ResolveFixtureTeamName,
} from "@/lib/calendar-match-overrides";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

export function applyMatchInlineOverride(
  match: Match,
  getOverride: (key: string) => unknown,
  gender: PrimerEquipoGender = "masculino",
  resolveName?: ResolveFixtureTeamName,
): Match {
  const override = getOverride(`match-result:${match.id}`) as MatchResultOverride | undefined;
  if (!override || Object.keys(override).length === 0) return match;
  return applyMatchResultOverride(match, override, gender, resolveName);
}

export function applyMatchdayOverrides(
  matchdays: Matchday[],
  getOverride: (key: string) => unknown,
  gender: PrimerEquipoGender = "masculino",
): Matchday[] {
  return matchdays.map((matchday) => ({
    ...matchday,
    matches: matchday.matches.map((match) => applyMatchInlineOverride(match, getOverride, gender)),
  }));
}

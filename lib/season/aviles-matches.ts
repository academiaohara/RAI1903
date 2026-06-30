import { getRaiTeamId } from "@/lib/fixtures";
import { isClubTeamMatch } from "@/lib/season/club-team-ids";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

export function getAvilesMatchesFromSource(
  source: JornadasFixtureSource,
  gender: PrimerEquipoGender,
  options?: { mapMatch?: (match: Match) => Match; clubTeamIds?: readonly string[] },
): Match[] {
  const clubTeamIds = options?.clubTeamIds ?? [getRaiTeamId(gender)];

  const league =
    gender === "femenino"
      ? [
          ...source.matchdaysFemenino.flatMap((matchday) => matchday.matches),
          ...source.amistosoMatches,
          ...source.calendarExtraMatches,
        ]
      : [
          ...source.matchdays.flatMap((matchday) => matchday.matches),
          ...source.matchdaysGrupo2.flatMap((matchday) => matchday.matches),
          ...source.amistosoMatches,
          ...source.copaDelReyMatches,
          ...source.calendarExtraMatches,
        ];

  return league
    .map((match) => options?.mapMatch?.(match) ?? match)
    .filter((match) => isClubTeamMatch(match, clubTeamIds))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getCopaDelReyMatchesFromSource(
  source: JornadasFixtureSource,
  gender: PrimerEquipoGender,
): Match[] {
  if (gender !== "masculino") return [];
  return [...source.copaDelReyMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getLeagueMatchdaysForGender(source: JornadasFixtureSource, gender: PrimerEquipoGender) {
  return gender === "femenino" ? source.matchdaysFemenino : source.matchdays;
}

export function getGrupo2Matchdays(source: JornadasFixtureSource) {
  return source.matchdaysGrupo2;
}

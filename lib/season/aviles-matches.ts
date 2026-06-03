import { getRaiTeamId } from "@/lib/fixtures";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

export function getAvilesMatchesFromSource(
  source: JornadasFixtureSource,
  gender: PrimerEquipoGender,
  options?: { mapMatch?: (match: Match) => Match },
): Match[] {
  const raiId = getRaiTeamId(gender);

  const league =
    gender === "femenino"
      ? source.matchdaysFemenino.flatMap((matchday) => matchday.matches)
      : [
          ...source.matchdays.flatMap((matchday) => matchday.matches),
          ...source.amistosoMatches,
          ...source.copaDelReyMatches,
          ...source.calendarExtraMatches,
        ];

  return league
    .map((match) => options?.mapMatch?.(match) ?? match)
    .filter((match) => match.homeTeamId === raiId || match.awayTeamId === raiId)
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

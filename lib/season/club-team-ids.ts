import { isPlaceholderMatch } from "@/lib/competition/normalize-fixtures";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getRaiTeamId } from "@/lib/fixtures";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { Match, Matchday } from "@/types";

const CLUB_NAME_PATTERN = /avil[eé]s/i;

const CANONICAL_CLUB_IDS: Record<PrimerEquipoGender, string> = {
  masculino: RAI_TEAM_ID,
  femenino: RAI_FEM_TEAM_ID,
};

function addClubIdFromMatch(ids: Set<string>, match: Match): void {
  if (CLUB_NAME_PATTERN.test(match.homeTeam)) ids.add(match.homeTeamId);
  if (CLUB_NAME_PATTERN.test(match.awayTeam)) ids.add(match.awayTeamId);
}

/** IDs del club en el grupo CMS y en partidos ya cargados (nombres visibles). */
export function resolveClubTeamIds(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId = "1",
  matchdays?: readonly Matchday[],
): string[] {
  const canonical = getRaiTeamId(gender);
  const ids = new Set<string>([canonical, CANONICAL_CLUB_IDS[gender]]);

  for (const team of resolveGroupTeams(bundles, gender, grupo)) {
    if (team.id === canonical || CLUB_NAME_PATTERN.test(team.name)) {
      ids.add(team.id);
    }
  }

  if (matchdays) {
    for (const matchday of matchdays) {
      for (const match of matchday.matches) {
        addClubIdFromMatch(ids, match);
      }
    }
  }

  return [...ids];
}

export function isClubTeamMatch(match: Match, clubTeamIds: readonly string[]): boolean {
  if (clubTeamIds.includes(match.homeTeamId) || clubTeamIds.includes(match.awayTeamId)) {
    return true;
  }
  return CLUB_NAME_PATTERN.test(match.homeTeam) || CLUB_NAME_PATTERN.test(match.awayTeam);
}

function dedupeMatchesById(matches: Match[]): Match[] {
  const byId = new Map<string, Match>();
  for (const match of matches) {
    byId.set(match.id, match);
  }
  return [...byId.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Partidos del club: liga (jornadas editadas) + amistosos, copa y extras del calendario. */
export function collectClubMatches(
  editedLeagueMatchdays: readonly Matchday[],
  fixtureSource: JornadasFixtureSource,
  gender: PrimerEquipoGender,
  clubTeamIds: readonly string[],
): Match[] {
  const league = editedLeagueMatchdays
    .flatMap((matchday) => matchday.matches)
    .filter((match) => !isPlaceholderMatch(match));

  const extras =
    gender === "femenino"
      ? []
      : [
          ...fixtureSource.amistosoMatches,
          ...fixtureSource.copaDelReyMatches,
          ...fixtureSource.calendarExtraMatches,
        ];

  const candidates = [...league, ...extras].filter(
    (match) => !isPlaceholderMatch(match) && isClubTeamMatch(match, clubTeamIds),
  );

  return dedupeMatchesById(candidates);
}

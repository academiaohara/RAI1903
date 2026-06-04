import {
  matchCompetitionShortLabel,
  matchJornadaLabel,
  type FixtureMetaSource,
} from "@/lib/competition-labels";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CompetitionId } from "@/types";

const MASCULINO_LEAGUE_COMPETITIONS: readonly CompetitionId[] = ["primera-rfef", "liga-raij903"];
const FEMENINO_LEAGUE_COMPETITIONS: readonly CompetitionId[] = ["liga-femenina", "primera-rfef"];

export function isLeagueCalendarMatch(
  match: Pick<FixtureMetaSource, "competition">,
  gender: PrimerEquipoGender,
): boolean {
  const leagueIds = gender === "femenino" ? FEMENINO_LEAGUE_COMPETITIONS : MASCULINO_LEAGUE_COMPETITIONS;
  return leagueIds.includes(match.competition);
}

export function ligaLabelStorageKey(gender: PrimerEquipoGender): string {
  return `competition:${gender}:liga:label`;
}

export function defaultLigaLabel(gender: PrimerEquipoGender, cmsLabel?: string): string {
  if (cmsLabel?.trim()) return cmsLabel.trim();
  return gender === "femenino" ? "2ª RFEF Femenina" : "1ª RFEF";
}

export function calendarCompetitionDisplayLabel(
  match: FixtureMetaSource & { matchday?: number },
  options: { gender: PrimerEquipoGender; ligaLabel: string },
): string {
  const jornada = matchJornadaLabel(match);
  if (isLeagueCalendarMatch(match, options.gender)) {
    const base = options.ligaLabel.trim() || (options.gender === "femenino" ? "2ª RFEF Femenina" : "1ª RFEF");
    return jornada ? `${base} · ${jornada}` : base;
  }
  const customStage = match.competitionStage?.trim();
  const base = customStage || matchCompetitionShortLabel(match);
  return jornada ? `${base} · ${jornada}` : base;
}

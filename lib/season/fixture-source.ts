import {
  amistosoMatches,
  copaDelReyMatches,
  matchdays,
  matchdaysFemenino,
  matchdaysGrupo2,
} from "@/data/mock";
import { DEFINITIVE_QUALIFYING_LEAGUE_ROUND } from "@/lib/playoff-jornadas";
import type {
  SeasonBundlesMap,
  SeasonFemeninoFixturesBundle,
  SeasonFixturesBundle,
} from "@/lib/cms/season-bundles";
import { getFixturesBundle } from "@/lib/cms/season-bundles";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { EMPTY_FIXTURE_SOURCE } from "@/lib/season/empty-fixture-source";
import { RESULTADOS_2526_LAST_ROUND } from "@/lib/resultados-2526";
import { SEGUNDA_RFEF_FEMENINA_LAST_ROUND } from "@/lib/segunda-rfef-femenina-2526";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

export type JornadasFixtureSource = {
  matchdays: Matchday[];
  matchdaysGrupo2: Matchday[];
  matchdaysFemenino: Matchday[];
  amistosoMatches: Match[];
  copaDelReyMatches: Match[];
  calendarExtraMatches: Match[];
  lastRoundMasculino: number;
  lastRoundFemenino: number;
  definitiveQualifyingLeagueRound: number;
};

export function getDefaultFixtureSource(): JornadasFixtureSource {
  return {
    matchdays,
    matchdaysGrupo2,
    matchdaysFemenino,
    amistosoMatches,
    copaDelReyMatches,
    calendarExtraMatches: [],
    lastRoundMasculino: RESULTADOS_2526_LAST_ROUND,
    lastRoundFemenino: SEGUNDA_RFEF_FEMENINA_LAST_ROUND,
    definitiveQualifyingLeagueRound: DEFINITIVE_QUALIFYING_LEAGUE_ROUND,
  };
}

export function fixtureSourceFromBundles(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): JornadasFixtureSource {
  const mockFallback = shouldUseMockCompetitionFallback();
  const defaults = mockFallback ? getDefaultFixtureSource() : EMPTY_FIXTURE_SOURCE;
  const raw = getFixturesBundle(bundles, gender);

  if (gender === "femenino") {
    const bundle = raw as SeasonFemeninoFixturesBundle | null;
    if (!bundle?.matchdaysFemenino?.length) return defaults;
    return {
      ...EMPTY_FIXTURE_SOURCE,
      matchdaysFemenino: bundle.matchdaysFemenino,
      lastRoundFemenino: bundle.meta?.lastRound ?? defaults.lastRoundFemenino,
    };
  }

  const bundle = raw as SeasonFixturesBundle | null;
  if (!bundle?.matchdays?.length) return defaults;

  return {
    ...EMPTY_FIXTURE_SOURCE,
    matchdays: bundle.matchdays,
    matchdaysGrupo2: bundle.matchdaysGrupo2 ?? [],
    amistosoMatches: bundle.amistosoMatches ?? [],
    copaDelReyMatches: bundle.copaDelReyMatches ?? [],
    calendarExtraMatches: bundle.calendarExtraMatches ?? [],
    lastRoundMasculino: bundle.meta?.lastRound ?? defaults.lastRoundMasculino,
    definitiveQualifyingLeagueRound:
      bundle.meta?.definitiveQualifyingLeagueRound ?? defaults.definitiveQualifyingLeagueRound,
  };
}

export function getLeagueMatchdays(source: JornadasFixtureSource, gender: PrimerEquipoGender): Matchday[] {
  return gender === "femenino" ? source.matchdaysFemenino : source.matchdays;
}

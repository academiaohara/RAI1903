import type { JornadasFixtureSource } from "@/lib/season/fixture-source";

/** Fuente vacía cuando Supabase está activo pero la temporada aún no tiene datos subidos. */
export const EMPTY_FIXTURE_SOURCE: JornadasFixtureSource = {
  matchdays: [],
  matchdaysGrupo2: [],
  matchdaysFemenino: [],
  amistosoMatches: [],
  copaDelReyMatches: [],
  calendarExtraMatches: [],
  lastRoundMasculino: 1,
  lastRoundFemenino: 1,
  definitiveQualifyingLeagueRound: 38,
};

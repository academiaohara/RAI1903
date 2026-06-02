import {
  amistosoMatches,
  copaDelReyMatches,
  matchArticles,
  matchdays,
  matchdaysFemenino,
  matchdaysGrupo2,
} from "@/data/mock";
import { DEFINITIVE_QUALIFYING_LEAGUE_ROUND } from "@/lib/playoff-jornadas";
import { RESULTADOS_2526_LAST_ROUND } from "@/lib/resultados-2526";
import { SEGUNDA_RFEF_FEMENINA_LAST_ROUND } from "@/lib/segunda-rfef-femenina-2526";
import { computeClubLeagueStatsForGender } from "@/lib/season/club-league-stats";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import type { SeasonBundleKey, SeasonBundleScope } from "@/lib/cms/season-bundles";
import type {
  SeasonFemeninoFixturesBundle,
  SeasonFixturesBundle,
  SeasonMatchArticlesBundle,
  SeasonSquadBundle,
} from "@/lib/cms/season-bundles";
import { buildMockTransfersBundle } from "@/lib/season/mock-transfers-bundle";
import { buildFilialMockBundleEntries } from "@/lib/cantera/filial-season-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type MockBundleEntry = {
  scope: SeasonBundleScope;
  bundleKey: SeasonBundleKey;
  payload: unknown;
};

/** Paquetes listos para subir a Supabase desde los datos actuales del repo (25/26). */
export function buildMockSeasonBundleEntries(seasonLabel: string): MockBundleEntry[] {
  const masculinoFixtures: SeasonFixturesBundle = {
    matchdays,
    matchdaysGrupo2,
    amistosoMatches,
    copaDelReyMatches,
    meta: {
      lastRound: RESULTADOS_2526_LAST_ROUND,
      definitiveQualifyingLeagueRound: DEFINITIVE_QUALIFYING_LEAGUE_ROUND,
    },
  };

  const femeninoFixtures: SeasonFemeninoFixturesBundle = {
    matchdaysFemenino,
    meta: { lastRound: SEGUNDA_RFEF_FEMENINA_LAST_ROUND },
  };

  const genders: PrimerEquipoGender[] = ["masculino", "femenino"];
  const squadEntries: MockBundleEntry[] = genders.map((gender) => {
    const club = getSquadClubInfo(gender);
    const leagueMatchdays = gender === "femenino" ? matchdaysFemenino : matchdays;
    const bundle: SeasonSquadBundle = {
      players: getSquadPlayers(gender),
      clubInfo: {
        ...club,
        temporada: seasonLabel,
        stats: computeClubLeagueStatsForGender(gender, leagueMatchdays),
      },
    };
    return { scope: gender, bundleKey: "squad" as const, payload: bundle };
  });

  const articles: SeasonMatchArticlesBundle = { articles: matchArticles };

  const filialEntries: MockBundleEntry[] = buildFilialMockBundleEntries().map((entry) => ({
    scope: entry.scope,
    bundleKey: entry.bundleKey,
    payload: entry.payload,
  }));

  return [
    { scope: "masculino", bundleKey: "fixtures", payload: masculinoFixtures },
    { scope: "femenino", bundleKey: "fixtures", payload: femeninoFixtures },
    ...squadEntries,
    ...filialEntries,
    { scope: "global", bundleKey: "match_articles", payload: articles },
    { scope: "global", bundleKey: "transfers", payload: buildMockTransfersBundle() },
  ];
}

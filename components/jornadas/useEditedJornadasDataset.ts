"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyJornadaFixtureOverride } from "@/lib/jornada-fixture-overrides";
import { readMatchResultOverride } from "@/lib/fixture-inline-keys";
import { formatShortDate, representativeDateFromFixtures } from "@/lib/jornadas-data";
import { isClubTeamMatch, resolveClubSideInMatch } from "@/lib/season/club-team-ids";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";
import type {
  JornadaFixture,
  JornadaRoundData,
  JornadaRoundSummary,
  JornadasDataset,
} from "@/types/jornadas";
import { useMemo } from "react";

function opponentFromFixtures(
  fixtures: JornadaFixture[],
  clubTeamIds: readonly string[],
): { teamId: string; name: string } | undefined {
  const raiFixture = fixtures.find((fixture) =>
    isClubTeamMatch(
      {
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeTeam: fixture.homeTeamName,
        awayTeam: fixture.awayTeamName,
      } as Match,
      clubTeamIds,
    ),
  );
  if (!raiFixture) return undefined;
  const clubSide = resolveClubSideInMatch(
    {
      homeTeamId: raiFixture.homeTeamId,
      awayTeamId: raiFixture.awayTeamId,
      homeTeam: raiFixture.homeTeamName,
      awayTeam: raiFixture.awayTeamName,
    } as Match,
    clubTeamIds,
  );
  if (!clubSide) return undefined;
  const isHome = clubSide.isHome;
  return {
    teamId: isHome ? raiFixture.awayTeamId : raiFixture.homeTeamId,
    name: isHome ? raiFixture.awayTeamName : raiFixture.homeTeamName,
  };
}

function enrichRoundSummary(
  summary: JornadaRoundSummary,
  grupo1: JornadaFixture[],
  grupo2: JornadaFixture[],
  clubTeamIds: readonly string[],
): JornadaRoundSummary {
  const fixturesForSummary = grupo1.length > 0 ? grupo1 : [...grupo1, ...grupo2];
  const date = representativeDateFromFixtures(fixturesForSummary, clubTeamIds);
  const opponent = opponentFromFixtures(fixturesForSummary, clubTeamIds);

  return {
    ...summary,
    date,
    shortDate: formatShortDate(date),
    opponentTeamId: opponent?.teamId,
    opponentName: opponent?.name,
  };
}

function applyOverridesToRound(
  roundData: JornadaRoundData,
  getOverride: <T>(key: string) => T | undefined,
  gender: PrimerEquipoGender,
): { grupo1: JornadaFixture[]; grupo2: JornadaFixture[] } {
  const grupo1 = roundData.matchesByGrupo["1"].map((fixture) =>
    applyJornadaFixtureOverride(
      fixture,
      readMatchResultOverride<Partial<JornadaFixture>>(getOverride, gender, fixture.id),
    ),
  );
  const grupo2 = roundData.matchesByGrupo["2"].map((fixture) =>
    applyJornadaFixtureOverride(
      fixture,
      readMatchResultOverride<Partial<JornadaFixture>>(getOverride, gender, fixture.id),
    ),
  );
  return { grupo1, grupo2 };
}

/** Aplica overrides de edición en línea al dataset de jornadas (carrusel, agrupación por día, filas). */
export function useEditedJornadasDataset(
  dataset: JornadasDataset,
  gender: PrimerEquipoGender,
  clubTeamIds: readonly string[],
): JornadasDataset {
  const { getOverride } = useInlineEditing();

  return useMemo(() => {
    const editedRounds = dataset.rounds.map((summary) => {
      const { grupo1, grupo2 } = applyOverridesToRound(dataset.getRound(summary.id), getOverride, gender);
      return enrichRoundSummary(summary, grupo1, grupo2, clubTeamIds);
    });

    const getRound = (roundId: Parameters<JornadasDataset["getRound"]>[0]) => {
      const base = dataset.getRound(roundId);
      const { grupo1, grupo2 } = applyOverridesToRound(base, getOverride, gender);
      const summary =
        editedRounds.find((round) => round.id === roundId) ??
        enrichRoundSummary(base.summary, grupo1, grupo2, clubTeamIds);

      return {
        summary,
        matchesByGrupo: { "1": grupo1, "2": grupo2 },
      };
    };

    return {
      ...dataset,
      rounds: editedRounds,
      getRound,
    };
  }, [clubTeamIds, dataset, gender, getOverride]);
}

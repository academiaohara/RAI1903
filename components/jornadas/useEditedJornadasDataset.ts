"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyJornadaFixtureOverride } from "@/lib/jornada-fixture-overrides";
import { formatShortDate, representativeDateFromFixtures } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type {
  JornadaFixture,
  JornadaRoundData,
  JornadaRoundSummary,
  JornadasDataset,
  JornadasGetRoundOptions,
} from "@/types/jornadas";
import { useMemo } from "react";

function opponentFromFixtures(
  fixtures: JornadaFixture[],
  raiId: string,
): { teamId: string; name: string } | undefined {
  const raiFixture = fixtures.find((fixture) => fixture.homeTeamId === raiId || fixture.awayTeamId === raiId);
  if (!raiFixture) return undefined;
  const isHome = raiFixture.homeTeamId === raiId;
  return {
    teamId: isHome ? raiFixture.awayTeamId : raiFixture.homeTeamId,
    name: isHome ? raiFixture.awayTeamName : raiFixture.homeTeamName,
  };
}

function enrichRoundSummary(
  summary: JornadaRoundSummary,
  grupo1: JornadaFixture[],
  grupo2: JornadaFixture[],
  raiId: string,
): JornadaRoundSummary {
  const fixturesForSummary = grupo1.length > 0 ? grupo1 : [...grupo1, ...grupo2];
  const date = representativeDateFromFixtures(fixturesForSummary, raiId);
  const opponent = opponentFromFixtures(fixturesForSummary, raiId);

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
): { grupo1: JornadaFixture[]; grupo2: JornadaFixture[] } {
  const grupo1 = roundData.matchesByGrupo["1"].map((fixture) =>
    applyJornadaFixtureOverride(fixture, getOverride<Partial<JornadaFixture>>(`match-result:${fixture.id}`)),
  );
  const grupo2 = roundData.matchesByGrupo["2"].map((fixture) =>
    applyJornadaFixtureOverride(fixture, getOverride<Partial<JornadaFixture>>(`match-result:${fixture.id}`)),
  );
  return { grupo1, grupo2 };
}

/** Aplica overrides de edición en línea al dataset de jornadas (carrusel, agrupación por día, filas). */
export function useEditedJornadasDataset(
  dataset: JornadasDataset,
  gender: PrimerEquipoGender,
): JornadasDataset {
  const { getOverride } = useInlineEditing();
  const raiId = getRaiTeamId(gender);

  return useMemo(() => {
    const editedRounds = dataset.rounds.map((summary) => {
      const { grupo1, grupo2 } = applyOverridesToRound(dataset.getRound(summary.id), getOverride);
      return enrichRoundSummary(summary, grupo1, grupo2, raiId);
    });

    const getRound = (roundId: Parameters<JornadasDataset["getRound"]>[0], options?: JornadasGetRoundOptions) => {
      const base = dataset.getRound(roundId, options);
      const { grupo1, grupo2 } = applyOverridesToRound(base, getOverride);
      const summary =
        editedRounds.find((round) => round.id === roundId) ??
        enrichRoundSummary(base.summary, grupo1, grupo2, raiId);

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
  }, [dataset, getOverride, raiId]);
}

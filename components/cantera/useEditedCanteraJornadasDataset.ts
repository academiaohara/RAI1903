"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyJornadaFixtureOverride } from "@/lib/jornada-fixture-overrides";
import { readCanteraMatchResultOverride } from "@/lib/fixture-inline-keys";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import type { JornadaFixture, JornadaRoundData, JornadasDataset } from "@/types/jornadas";
import { useMemo } from "react";

function applyOverridesToRound(
  roundData: JornadaRoundData,
  getOverride: <T>(key: string) => T | undefined,
  scope: CanteraCmsScope,
): JornadaFixture[] {
  return roundData.matchesByGrupo["1"].map((fixture) =>
    applyJornadaFixtureOverride(
      fixture,
      readCanteraMatchResultOverride<Partial<JornadaFixture>>(getOverride, scope, fixture.id),
    ),
  );
}

/** Aplica overrides de edición en línea al dataset de jornadas cantera. */
export function useEditedCanteraJornadasDataset(
  dataset: JornadasDataset,
  scope: CanteraCmsScope,
): JornadasDataset {
  const { getOverride } = useInlineEditing();

  return useMemo(() => {
    const getRound = (roundId: Parameters<JornadasDataset["getRound"]>[0]) => {
      const base = dataset.getRound(roundId);
      const fixtures = applyOverridesToRound(base, getOverride, scope);
      return {
        summary: base.summary,
        matchesByGrupo: { "1": fixtures, "2": [] as JornadaFixture[] },
      };
    };

    return {
      ...dataset,
      getRound,
    };
  }, [dataset, getOverride, scope]);
}

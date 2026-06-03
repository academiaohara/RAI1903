"use client";

import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyMatchInlineOverride, applyMatchdayOverrides } from "@/lib/fixture-overrides";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

/** Jornadas de liga con overrides de edición en línea (resultados, horarios, equipos). */
export function useEditedMatchdays(
  matchdays: Matchday[],
  gender: PrimerEquipoGender = "masculino",
): Matchday[] {
  const { getOverride } = useInlineEditing();

  return useMemo(
    () => applyMatchdayOverrides(matchdays, getOverride, gender),
    [matchdays, getOverride, gender],
  );
}

/** Partidos sueltos con overrides de edición en línea. */
export function useEditedMatches(matches: Match[], gender: PrimerEquipoGender = "masculino"): Match[] {
  const { getOverride } = useInlineEditing();

  return useMemo(
    () => matches.map((match) => applyMatchInlineOverride(match, getOverride, gender)),
    [matches, getOverride, gender],
  );
}

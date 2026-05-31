"use client";

import { useCallback, useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import {
  applyChronicleStatsToSquad,
  aggregateAvilesStatsFromChronicles,
} from "@/lib/aviles-chronicle-stats";
import { getSquadPlayers } from "@/lib/squad-data";
import { mergeSquadPlayerOverrides, squadPlayerOverrideKey } from "@/lib/squad-overrides";
import { ageFromBirthDate } from "@/lib/squad-age";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadPlayer } from "@/types/squad";

export function useSquadPlayers(gender: PrimerEquipoGender) {
  const { getOverride, saveValue } = useInlineEditing();

  const baseSquad = useMemo(() => getSquadPlayers(gender), [gender]);

  const squad = useMemo(() => {
    const withOverrides = mergeSquadPlayerOverrides(baseSquad, getOverride);
    const withAge = withOverrides.map((player) => ({
      ...player,
      edad: player.fechaNacimiento ? ageFromBirthDate(player.fechaNacimiento) : player.edad,
    }));

    if (gender !== "masculino") return withAge;

    const chronicleStats = aggregateAvilesStatsFromChronicles(gender, withAge, getOverride);
    return applyChronicleStatsToSquad(withAge, chronicleStats);
  }, [baseSquad, gender, getOverride]);

  const updatePlayer = useCallback(
    (playerId: string, patch: Partial<SquadPlayer>) => {
      const current = getOverride<Partial<SquadPlayer>>(squadPlayerOverrideKey(playerId)) ?? {};
      const next: Partial<SquadPlayer> = { ...current, ...patch };
      if (patch.fechaNacimiento) {
        next.edad = ageFromBirthDate(patch.fechaNacimiento);
      }
      saveValue(squadPlayerOverrideKey(playerId), next);
    },
    [getOverride, saveValue],
  );

  const getPlayerById = useCallback(
    (playerId: string) => squad.find((player) => player.id === playerId),
    [squad],
  );

  return { squad, updatePlayer, getPlayerById };
}

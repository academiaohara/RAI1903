"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  applyChronicleStatsToSquad,
  aggregateAvilesStatsFromChronicles,
} from "@/lib/aviles-chronicle-stats";
import { upsertSquadPlayer } from "@/lib/cms/players";
import { mergeSquadPlayerOverrides, squadPlayerOverrideKey } from "@/lib/squad-overrides";
import { ageFromBirthDate } from "@/lib/squad-age";
import { getSquadPlayers } from "@/lib/squad-data";
import { withSquadPlayerPhoto } from "@/lib/squad-photos";
import { resolveSquadPlayers } from "@/lib/season/squad-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadPlayer } from "@/types/squad";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useSquadPlayers(gender: PrimerEquipoGender) {
  const { getOverride, saveValue } = useInlineEditing();
  const { viewedSeasonId, bundles, bundlesLoading } = useSeason();
  const [baseSquad, setBaseSquad] = useState<SquadPlayer[]>([]);

  useEffect(() => {
    let cancelled = false;
    void resolveSquadPlayers(gender, viewedSeasonId, bundles).then((players) => {
      if (!cancelled) setBaseSquad(players);
    });
    return () => {
      cancelled = true;
    };
  }, [bundles, gender, viewedSeasonId]);

  const squad = useMemo(() => {
    const source =
      baseSquad.length > 0
        ? baseSquad
        : bundlesLoading && gender === "masculino"
          ? getSquadPlayers(gender)
          : baseSquad;
    const withOverrides = mergeSquadPlayerOverrides(source, getOverride);
    const withAge = withOverrides.map((player) => {
      const withPhoto = withSquadPlayerPhoto(player);
      return {
        ...withPhoto,
        edad: withPhoto.fechaNacimiento ? ageFromBirthDate(withPhoto.fechaNacimiento) : withPhoto.edad,
      };
    });

    if (gender !== "masculino") return withAge;

    const chronicleStats = aggregateAvilesStatsFromChronicles(gender, withAge, getOverride);
    return applyChronicleStatsToSquad(withAge, chronicleStats);
  }, [baseSquad, bundlesLoading, gender, getOverride]);

  const updatePlayer = useCallback(
    (playerId: string, patch: Partial<SquadPlayer>) => {
      const current = getOverride<Partial<SquadPlayer>>(squadPlayerOverrideKey(playerId)) ?? {};
      const next: Partial<SquadPlayer> = { ...current, ...patch };
      if (patch.fechaNacimiento) {
        next.edad = ageFromBirthDate(patch.fechaNacimiento);
      }
      saveValue(squadPlayerOverrideKey(playerId), next);

      if (isSupabaseConfigured()) {
        const player = squad.find((entry) => entry.id === playerId);
        if (player) {
          void upsertSquadPlayer(gender, viewedSeasonId, { ...player, ...next });
        }
      }
    },
    [gender, getOverride, saveValue, squad, viewedSeasonId],
  );

  const getPlayerById = useCallback(
    (playerId: string) => squad.find((player) => player.id === playerId),
    [squad],
  );

  return { squad, updatePlayer, getPlayerById, loading: bundlesLoading };
}

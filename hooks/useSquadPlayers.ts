"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  applyChronicleStatsToSquad,
  aggregateAvilesStatsFromChronicles,
  buildChronicleAggregationMatches,
} from "@/lib/aviles-chronicle-stats";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { deleteSquadPlayer, upsertSquadPlayer, upsertSquadPlayersBatch } from "@/lib/cms/players";
import { getSquadBundle, upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { mergeSquadPlayerOverrides, squadPlayerOverrideKey } from "@/lib/squad-overrides";
import { ageFromBirthDate } from "@/lib/squad-age";
import { createEmptySquadPlayer } from "@/lib/squad-defaults";
import { getSquadPlayers } from "@/lib/squad-data";
import { withSquadPlayerPhoto } from "@/lib/squad-photos";
import { resolveSquadPlayers, seasonSquadBundlePayload } from "@/lib/season/squad-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useSquadPlayers(gender: PrimerEquipoGender) {
  const { getOverride, saveValue, clearValue, overrides } = useInlineEditing();
  const { viewedSeasonId, bundles, bundlesLoading, refreshBundles, getFixtureSource } = useSeason();
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

    const seasonMatches = getAvilesMatchesFromSource(getFixtureSource(gender), gender);
    const aggregationMatches = buildChronicleAggregationMatches({
      gender,
      seasonMatches,
      overrides,
      bundles,
      getOverride,
    });
    const chronicleStats = aggregateAvilesStatsFromChronicles(
      gender,
      withAge,
      getOverride,
      aggregationMatches,
    );
    return applyChronicleStatsToSquad(withAge, chronicleStats);
  }, [baseSquad, bundles, bundlesLoading, gender, getFixtureSource, getOverride, overrides]);

  const persistSquadToCms = useCallback(
    async (players: SquadPlayer[]) => {
      if (!isSupabaseConfigured()) return { ok: true as const };

      const bundle = getSquadBundle(bundles, gender);
      const payload = seasonSquadBundlePayload(players, bundle?.clubInfo);
      const batchResult = await upsertSquadPlayersBatch(gender, viewedSeasonId, players);
      if (!batchResult.ok) return batchResult;

      const bundleResult = await upsertSeasonBundle(viewedSeasonId, gender, "squad", payload);
      if (!bundleResult.ok) return bundleResult;

      await refreshBundles();
      return { ok: true as const };
    },
    [bundles, gender, refreshBundles, viewedSeasonId],
  );

  const updatePlayer = useCallback(
    (playerId: string, patch: Partial<SquadPlayer>) => {
      const current = getOverride<Partial<SquadPlayer>>(squadPlayerOverrideKey(playerId)) ?? {};
      const next: Partial<SquadPlayer> = { ...current, ...patch };
      if (patch.fechaNacimiento) {
        next.edad = ageFromBirthDate(patch.fechaNacimiento);
      }
      saveValue(squadPlayerOverrideKey(playerId), next);

      setBaseSquad((prev) =>
        prev.map((entry) => (entry.id === playerId ? { ...entry, ...next } : entry)),
      );

      if (isSupabaseConfigured()) {
        const player = squad.find((entry) => entry.id === playerId);
        if (player) {
          const merged = { ...player, ...next };
          void upsertSquadPlayer(gender, viewedSeasonId, merged);
          void persistSquadToCms(
            baseSquad.map((entry) => (entry.id === playerId ? merged : entry)),
          );
        }
      }
    },
    [baseSquad, gender, getOverride, persistSquadToCms, saveValue, squad, viewedSeasonId],
  );

  const addPlayer = useCallback(
    async (posicion: SquadPosition) => {
      const newPlayer = createEmptySquadPlayer(posicion);
      const nextSquad = [...baseSquad, newPlayer];
      setBaseSquad(nextSquad);
      const result = await persistSquadToCms(nextSquad);
      return { player: newPlayer, ...result };
    },
    [baseSquad, persistSquadToCms],
  );

  const removePlayer = useCallback(
    async (playerId: string) => {
      const nextSquad = baseSquad.filter((entry) => entry.id !== playerId);
      setBaseSquad(nextSquad);
      clearValue(squadPlayerOverrideKey(playerId));

      if (isSupabaseConfigured()) {
        await deleteSquadPlayer(gender, viewedSeasonId, playerId);
      }

      return persistSquadToCms(nextSquad);
    },
    [baseSquad, clearValue, gender, persistSquadToCms, viewedSeasonId],
  );

  const getPlayerById = useCallback(
    (playerId: string) => squad.find((player) => player.id === playerId),
    [squad],
  );

  return { squad, updatePlayer, addPlayer, removePlayer, getPlayerById, loading: bundlesLoading };
}

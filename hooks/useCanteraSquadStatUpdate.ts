"use client";

import { useCallback, useState } from "react";
import { useCanteraSeason } from "@/components/cantera/CanteraSeasonContext";
import { useSeason } from "@/components/season/SeasonProvider";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { cmsScopeToCanteraTeamId } from "@/lib/cantera/cantera-cms";
import { getCanteraSquadPlayersFromImport } from "@/lib/cantera-squad";
import { upsertSeasonBundlesBatch } from "@/lib/cms/season-bundles";
import type { CanteraSquadImportPlayer } from "@/types/cantera-squad-import";

export function useCanteraSquadStatUpdate(scope: CanteraCmsScope) {
  const { viewedSeasonId, refreshBundles } = useSeason();
  const season = useCanteraSeason();
  const [saving, setSaving] = useState(false);

  const updatePlayerStat = useCallback(
    async (playerId: string, patch: Partial<CanteraSquadImportPlayer>) => {
      const teamId = cmsScopeToCanteraTeamId(scope);
      const mapped = getCanteraSquadPlayersFromImport(season.squad, teamId);
      const mappedPlayer = mapped.find((p) => p.id === playerId);
      if (!mappedPlayer) return;

      const plantillaIdx = season.squad.plantilla.findIndex((p) => p.jugador === mappedPlayer.jugador);
      if (plantillaIdx < 0) return;

      const squad = structuredClone(season.squad);
      squad.plantilla[plantillaIdx] = { ...squad.plantilla[plantillaIdx]!, ...patch };

      setSaving(true);
      const result = await upsertSeasonBundlesBatch(viewedSeasonId, [
        { scope, bundleKey: "squad", payload: squad },
      ]);
      setSaving(false);

      if (result.ok) {
        await refreshBundles();
      }
    },
    [scope, season.squad, viewedSeasonId, refreshBundles],
  );

  return { updatePlayerStat, saving };
}

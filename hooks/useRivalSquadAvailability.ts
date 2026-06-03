"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getRivalSquadsBundle,
  withRivalSquadInBundle,
} from "@/lib/cms/rival-squads-bundle";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
import { buildSquadFromImport } from "@/lib/rival-squad-imports";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { PlayerStatus } from "@/types";
import type { Team } from "@/types";
import type { RivalSquadImport } from "@/types/rival-squad-import";

function parseRivalPlayerDorsal(teamId: string, playerId: string): number | null {
  const prefix = `${teamId}-d`;
  if (!playerId.startsWith(prefix)) return null;
  const dorsal = Number(playerId.slice(prefix.length));
  return Number.isFinite(dorsal) ? dorsal : null;
}

export function useRivalSquadAvailability(gender: PrimerEquipoGender, team: Team) {
  const { viewedSeasonId, bundles, refreshBundles } = useSeason();

  const storedImport = useMemo(() => {
    const bundle = getRivalSquadsBundle(bundles, gender).squads[team.id];
    if (bundle?.plantilla?.length) return bundle;
    return buildDefaultRivalSquadImport(team);
  }, [bundles, gender, team]);

  const [importDraft, setImportDraft] = useState<RivalSquadImport>(storedImport);

  useEffect(() => {
    queueMicrotask(() => setImportDraft(storedImport));
  }, [storedImport]);

  const squad = useMemo(
    () => buildSquadFromImport(team, importDraft),
    [importDraft, team],
  );

  const persistEstado = useCallback(
    async (nextImport: RivalSquadImport) => {
      const bundle = withRivalSquadInBundle(getRivalSquadsBundle(bundles, gender), team.id, nextImport);
      const result = await upsertSeasonBundle(viewedSeasonId, gender, "rival_squads", bundle);
      if (result.ok) await refreshBundles();
      return result;
    },
    [bundles, gender, refreshBundles, team.id, viewedSeasonId],
  );

  const setPlayerEstado = useCallback(
    (playerId: string, estado: PlayerStatus) => {
      const dorsal = parseRivalPlayerDorsal(team.id, playerId);
      if (dorsal == null) return;

      setImportDraft((prev) => {
        const plantilla = prev.plantilla.map((entry) =>
          entry.dorsal === dorsal ? { ...entry, estado } : entry,
        );
        const next = { ...prev, plantilla };
        void persistEstado(next);
        return next;
      });
    },
    [persistEstado, team.id],
  );

  return { squad, setPlayerEstado };
}

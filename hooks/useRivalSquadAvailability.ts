"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getRivalSquadsBundle,
  withRivalSquadInBundle,
} from "@/lib/cms/rival-squads-bundle";
import { upsertSeasonBundle } from "@/lib/cms/season-bundles";
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
import { buildSquadFromImport, rivalImportPlayerId } from "@/lib/rival-squad-imports";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { PlayerStatus } from "@/types";
import type { Team } from "@/types";
import type { RivalSquadImport } from "@/types/rival-squad-import";

function findImportPlayerIndex(
  plantilla: RivalSquadImport["plantilla"],
  teamId: string,
  playerId: string,
): number {
  return plantilla.findIndex((entry, index) => rivalImportPlayerId(teamId, entry, index) === playerId);
}

const ENTRADOR_SAVE_DEBOUNCE_MS = 450;

export function useRivalSquadAvailability(gender: PrimerEquipoGender, team: Team) {
  const { viewedSeasonId, bundles, refreshBundles } = useSeason();

  const storedImport = useMemo(() => {
    const bundle = getRivalSquadsBundle(bundles, gender).squads[team.id];
    if (bundle?.plantilla?.length) return bundle;
    return buildDefaultRivalSquadImport(team);
  }, [bundles, gender, team]);

  const [importDraft, setImportDraft] = useState<RivalSquadImport>(storedImport);
  const entrenadorSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setImportDraft(storedImport));
  }, [storedImport]);

  useEffect(() => {
    return () => {
      if (entrenadorSaveTimerRef.current != null) {
        window.clearTimeout(entrenadorSaveTimerRef.current);
      }
    };
  }, []);

  const squad = useMemo(
    () => buildSquadFromImport(team, importDraft),
    [importDraft, team],
  );

  const persistImport = useCallback(
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
      setImportDraft((prev) => {
        const index = findImportPlayerIndex(prev.plantilla, team.id, playerId);
        if (index < 0) return prev;

        const plantilla = prev.plantilla.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, estado } : entry,
        );
        const next = { ...prev, plantilla };
        void persistImport(next);
        return next;
      });
    },
    [persistImport, team.id],
  );

  const setEntrenador = useCallback(
    (entrenador: string) => {
      setImportDraft((prev) => {
        const next = { ...prev, entrenador };

        if (entrenadorSaveTimerRef.current != null) {
          window.clearTimeout(entrenadorSaveTimerRef.current);
        }
        entrenadorSaveTimerRef.current = window.setTimeout(() => {
          entrenadorSaveTimerRef.current = null;
          void persistImport(next);
        }, ENTRADOR_SAVE_DEBOUNCE_MS);

        return next;
      });
    },
    [persistImport],
  );

  return { squad, entrenador: importDraft.entrenador, setPlayerEstado, setEntrenador };
}

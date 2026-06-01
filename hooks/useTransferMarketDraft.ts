"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { formatSeasonBundleSaveError } from "@/lib/cms/bundle-save-error";
import {
  getTransfersBundle,
  upsertSeasonBundle,
  type CmsTransferEntry,
  type SeasonTransfersBundle,
} from "@/lib/cms/season-bundles";
import { TRANSFER_MARKET_WINDOWS, inferTransferMarketWindowId } from "@/lib/transfer-market-windows";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferKind } from "@/types";

export function newTransferEntryId(): string {
  return `tm-${Date.now().toString(36)}`;
}

export const TRANSFER_KIND_OPTIONS: Array<{ value: TransferKind; label: string }> = [
  { value: "fichaje", label: "Fichaje" },
  { value: "cesion", label: "Cesión" },
  { value: "renovacion", label: "Renovación" },
];

export function useTransferMarketDraft() {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const { squad, loading: squadLoading } = useSquadPlayers("masculino");
  const [draft, setDraft] = useState<CmsTransferEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const bundleEntries = useMemo(() => getTransfersBundle(bundles)?.entries ?? [], [bundles]);
  const entries = draft ?? bundleEntries;
  const hasDraft = draft !== null;

  useEffect(() => {
    queueMicrotask(() => setDraft(null));
  }, [bundles, viewedSeasonId]);

  const squadById = useMemo(() => new Map(squad.map((player) => [player.id, player])), [squad]);

  const playerLabel = useCallback(
    (id: string) => {
      const player = squadById.get(id);
      return player ? getPlayerDisplayName(player) : id;
    },
    [squadById],
  );

  const getEntry = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<CmsTransferEntry>) => {
      setDraft((current) => {
        const base = current ?? bundleEntries;
        return base.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
      });
      setMessage(null);
    },
    [bundleEntries],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setDraft((current) => (current ?? bundleEntries).filter((entry) => entry.id !== id));
      setMessage(null);
    },
    [bundleEntries],
  );

  const addEntry = useCallback(
    (entry: Omit<CmsTransferEntry, "id"> & { id?: string }) => {
      const current = draft ?? bundleEntries;
      if (current.some((item) => item.playerId === entry.playerId)) {
        setMessage("Ese jugador ya está en el mercado de esta temporada");
        return false;
      }
      const fullEntry: CmsTransferEntry = {
        id: entry.id ?? newTransferEntryId(),
        ...entry,
        marketWindowId: entry.marketWindowId ?? inferTransferMarketWindowId(entry.date),
      };
      setDraft([fullEntry, ...current]);
      setMessage(null);
      return true;
    },
    [bundleEntries, draft],
  );

  const save = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const payload: SeasonTransfersBundle = { entries };
    const result = await upsertSeasonBundle(viewedSeasonId, "global", "transfers", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(formatSeasonBundleSaveError(result.error ?? "Error al guardar"));
      return false;
    }
    setMessage(`Mercado guardado para ${viewedSeason.label}`);
    setDraft(null);
    await refreshBundles();
    return true;
  }, [entries, refreshBundles, viewedSeason.label, viewedSeasonId]);

  return {
    entries,
    bundleEntries,
    squad,
    squadLoading,
    squadById,
    playerLabel,
    getEntry,
    updateEntry,
    removeEntry,
    addEntry,
    save,
    busy,
    message,
    setMessage,
    hasDraft,
    marketWindows: TRANSFER_MARKET_WINDOWS,
    inferWindow: inferTransferMarketWindowId,
  };
}

export type UseTransferMarketDraftResult = ReturnType<typeof useTransferMarketDraft>;

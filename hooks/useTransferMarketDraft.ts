"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { formatSeasonBundleSaveError } from "@/lib/cms/bundle-save-error";
import {
  getTransfersBundle,
  upsertSeasonBundle,
  type CmsTransferEntry,
  type CmsTransferMarketWindow,
  type SeasonTransfersBundle,
} from "@/lib/cms/season-bundles";
import {
  DEFAULT_TRANSFER_MARKET_WINDOWS,
  countEntriesForMarketWindow,
  inferTransferMarketWindowId,
  isTransferMarketWindowIdValid,
  mergeTransferMarketWindows,
  resolveTransferMarketWindows,
  slugifyTransferMarketWindowId,
} from "@/lib/transfer-market-windows";
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
  const [windowsDraft, setWindowsDraft] = useState<CmsTransferMarketWindow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const bundle = useMemo(() => getTransfersBundle(bundles), [bundles]);
  const bundleEntries = useMemo(() => bundle?.entries ?? [], [bundle]);
  const bundleWindows = bundle?.windows ?? null;
  const entries = draft ?? bundleEntries;
  const configuredWindows = windowsDraft ?? bundleWindows ?? DEFAULT_TRANSFER_MARKET_WINDOWS;
  const hasDraft = draft !== null || windowsDraft !== null;

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(null);
      setWindowsDraft(null);
    });
  }, [bundles, viewedSeasonId]);

  const marketWindows = useMemo(
    () => mergeTransferMarketWindows(configuredWindows, entries),
    [configuredWindows, entries],
  );

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

  const addWindow = useCallback(
    (label: string, idOverride?: string) => {
      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        setMessage("Escribe un nombre para la ventana");
        return false;
      }
      const id = (idOverride?.trim() || slugifyTransferMarketWindowId(trimmedLabel)).toLowerCase();
      if (!id) {
        setMessage("No se pudo generar un identificador válido");
        return false;
      }
      if (!isTransferMarketWindowIdValid(id)) {
        setMessage("El identificador solo puede usar letras minúsculas, números y guiones");
        return false;
      }
      const current = windowsDraft ?? bundleWindows ?? [...DEFAULT_TRANSFER_MARKET_WINDOWS];
      if (current.some((window) => window.id === id)) {
        setMessage("Ya existe una ventana con ese identificador");
        return false;
      }
      setWindowsDraft([...current, { id, label: trimmedLabel }]);
      setMessage(null);
      return true;
    },
    [bundleWindows, windowsDraft],
  );

  const updateWindow = useCallback(
    (id: string, patch: Partial<Pick<CmsTransferMarketWindow, "label">>) => {
      setWindowsDraft((current) => {
        const base = current ?? bundleWindows ?? [...DEFAULT_TRANSFER_MARKET_WINDOWS];
        return base.map((window) => (window.id === id ? { ...window, ...patch } : window));
      });
      setMessage(null);
    },
    [bundleWindows],
  );

  const removeWindow = useCallback(
    (id: string) => {
      const current = windowsDraft ?? bundleWindows ?? [...DEFAULT_TRANSFER_MARKET_WINDOWS];
      if (current.length <= 1) {
        setMessage("Debe quedar al menos una ventana de mercado");
        return false;
      }
      const usage = countEntriesForMarketWindow(entries, id);
      if (usage > 0) {
        setMessage(`Hay ${usage} movimiento(s) en esta ventana. Reasígnalos antes de borrarla.`);
        return false;
      }
      setWindowsDraft(current.filter((window) => window.id !== id));
      setMessage(null);
      return true;
    },
    [bundleWindows, entries, windowsDraft],
  );

  const moveWindow = useCallback(
    (id: string, direction: "up" | "down") => {
      setWindowsDraft((current) => {
        const base = [...(current ?? bundleWindows ?? DEFAULT_TRANSFER_MARKET_WINDOWS)];
        const index = base.findIndex((window) => window.id === id);
        if (index < 0) return base;
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= base.length) return base;
        const next = [...base];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
      setMessage(null);
    },
    [bundleWindows],
  );

  const save = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const windows = resolveTransferMarketWindows(configuredWindows, entries).map((window) => ({
      id: window.id,
      label: window.label,
    }));
    const payload: SeasonTransfersBundle = { entries, windows };
    const result = await upsertSeasonBundle(viewedSeasonId, "global", "transfers", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(formatSeasonBundleSaveError(result.error ?? "Error al guardar"));
      return false;
    }
    setMessage(`Mercado guardado para ${viewedSeason.label}`);
    setDraft(null);
    setWindowsDraft(null);
    await refreshBundles();
    return true;
  }, [configuredWindows, entries, refreshBundles, viewedSeason.label, viewedSeasonId]);

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
    addWindow,
    updateWindow,
    removeWindow,
    moveWindow,
    save,
    busy,
    message,
    setMessage,
    hasDraft,
    marketWindows,
    configuredWindows,
    inferWindow: inferTransferMarketWindowId,
    slugifyWindowId: slugifyTransferMarketWindowId,
  };
}

export type UseTransferMarketDraftResult = ReturnType<typeof useTransferMarketDraft>;

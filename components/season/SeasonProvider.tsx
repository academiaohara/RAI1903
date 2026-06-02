"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { fetchSeasonBundles, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { fetchPublishedSeasons, type CmsSeason } from "@/lib/cms/seasons";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import { fetchPublishedTransfersSnapshot } from "@/lib/season/published-transfers";
import type { TransferMarketWindow } from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import { loadSeasonId, saveSeasonId } from "@/lib/storage";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type SeasonContextValue = {
  seasons: CmsSeason[];
  activeSeasonId: CompetitionSeasonId;
  viewedSeasonId: CompetitionSeasonId;
  viewedSeason: CmsSeason;
  isViewingArchive: boolean;
  bundles: SeasonBundlesMap;
  bundlesLoading: boolean;
  transfers: TransferRumor[];
  transfersLoading: boolean;
  /** Ventanas de mercado de todas las temporadas publicadas (activas). */
  marketWindows: TransferMarketWindow[];
  setViewedSeasonId: (id: CompetitionSeasonId) => void;
  refreshSeasons: () => Promise<void>;
  refreshBundles: () => Promise<void>;
  getFixtureSource: (gender: PrimerEquipoGender) => JornadasFixtureSource;
};

const SeasonContext = createContext<SeasonContextValue | null>(null);

type SeasonProviderProps = {
  children: ReactNode;
  defaultSeasonId?: CompetitionSeasonId;
};

function pickViewedSeasonId(rows: CmsSeason[], activeId: CompetitionSeasonId): CompetitionSeasonId {
  const stored = loadSeasonId();
  if (rows.some((row) => row.id === stored)) return stored;
  return activeId;
}

export function SeasonProvider({ children, defaultSeasonId = DEFAULT_COMPETITION_SEASON_ID }: SeasonProviderProps) {
  const [seasons, setSeasons] = useState<CmsSeason[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<CompetitionSeasonId>(defaultSeasonId);
  const [viewedSeasonId, setViewedSeasonIdState] = useState<CompetitionSeasonId>(defaultSeasonId);
  const [bundles, setBundles] = useState<SeasonBundlesMap>({});
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRumor[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [marketWindows, setMarketWindows] = useState<TransferMarketWindow[]>([]);

  const refreshPublishedTransfers = useCallback(async (publishedRows: CmsSeason[]) => {
    setTransfersLoading(true);
    const snapshot = await fetchPublishedTransfersSnapshot(publishedRows);
    setTransfers(snapshot.transfers);
    setMarketWindows(snapshot.marketWindows);
    setTransfersLoading(false);
  }, []);

  const refreshSeasons = useCallback(async () => {
    const rows = await fetchPublishedSeasons();
    if (!rows.length) {
      setTransfersLoading(false);
      return;
    }
    setSeasons(rows);
    const active = rows.find((row) => row.isDefault) ?? rows[rows.length - 1];
    if (!active) return;
    const activeId = active.id as CompetitionSeasonId;
    setActiveSeasonId(activeId);
    setViewedSeasonIdState((current) => {
      if (rows.some((row) => row.id === current)) return current;
      return pickViewedSeasonId(rows, activeId);
    });
    await refreshPublishedTransfers(rows);
  }, [refreshPublishedTransfers]);

  const refreshBundles = useCallback(async () => {
    setBundlesLoading(true);
    const map = await fetchSeasonBundles(viewedSeasonId);
    setBundles(map);
    setBundlesLoading(false);
    const publishedRows = seasons.length > 0 ? seasons : await fetchPublishedSeasons();
    if (publishedRows.length > 0) {
      if (!seasons.length) setSeasons(publishedRows);
      await refreshPublishedTransfers(publishedRows);
    }
  }, [refreshPublishedTransfers, seasons, viewedSeasonId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshSeasons();
    });
  }, [refreshSeasons]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      setBundlesLoading(true);
    });
    void fetchSeasonBundles(viewedSeasonId).then((map) => {
      if (cancelled) return;
      setBundles(map);
      setBundlesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [viewedSeasonId]);

  const setViewedSeasonId = useCallback((id: CompetitionSeasonId) => {
    setViewedSeasonIdState(id);
    saveSeasonId(id);
  }, []);

  const viewedSeason = useMemo(() => {
    return (
      seasons.find((row) => row.id === viewedSeasonId) ?? {
        id: viewedSeasonId,
        label: viewedSeasonId.replace("-", "/"),
        isDefault: viewedSeasonId === activeSeasonId,
        sortOrder: 0,
        published: true,
      }
    );
  }, [activeSeasonId, seasons, viewedSeasonId]);

  const getFixtureSource = useCallback(
    (gender: PrimerEquipoGender) => fixtureSourceFromBundles(bundles, gender),
    [bundles],
  );

  const value = useMemo<SeasonContextValue>(
    () => ({
      seasons,
      activeSeasonId,
      viewedSeasonId,
      viewedSeason,
      isViewingArchive: viewedSeasonId !== activeSeasonId,
      bundles,
      bundlesLoading,
      transfers,
      transfersLoading,
      marketWindows,
      setViewedSeasonId,
      refreshSeasons,
      refreshBundles,
      getFixtureSource,
    }),
    [
      activeSeasonId,
      bundles,
      bundlesLoading,
      transfers,
      transfersLoading,
      marketWindows,
      getFixtureSource,
      refreshBundles,
      refreshSeasons,
      seasons,
      setViewedSeasonId,
      viewedSeason,
      viewedSeasonId,
    ],
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error("useSeason debe usarse dentro de SeasonProvider");
  }
  return context;
}

export function useSeasonOptional() {
  return useContext(SeasonContext);
}

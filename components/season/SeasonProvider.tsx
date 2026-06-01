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
import { fetchSeasonBundles, getSquadBundle, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { fetchPublishedSeasons, type CmsSeason } from "@/lib/cms/seasons";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import { getMockCarouselTransfers } from "@/lib/season/mock-transfers-bundle";
import { resolveTransfersFromBundles } from "@/lib/season/transfer-source";
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

function resolveSeasonTransfers(map: SeasonBundlesMap) {
  const squadPlayers = getSquadBundle(map, "masculino")?.players ?? [];
  return resolveTransfersFromBundles(map, squadPlayers, getMockCarouselTransfers());
}

export function SeasonProvider({ children, defaultSeasonId = DEFAULT_COMPETITION_SEASON_ID }: SeasonProviderProps) {
  const [seasons, setSeasons] = useState<CmsSeason[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<CompetitionSeasonId>(defaultSeasonId);
  const [viewedSeasonId, setViewedSeasonIdState] = useState<CompetitionSeasonId>(defaultSeasonId);
  const [bundles, setBundles] = useState<SeasonBundlesMap>({});
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRumor[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);

  const refreshSeasons = useCallback(async () => {
    const rows = await fetchPublishedSeasons();
    if (!rows.length) return;
    setSeasons(rows);
    const active = rows.find((row) => row.isDefault) ?? rows[rows.length - 1];
    if (!active) return;
    const activeId = active.id as CompetitionSeasonId;
    setActiveSeasonId(activeId);
    setViewedSeasonIdState((current) => {
      if (rows.some((row) => row.id === current)) return current;
      return pickViewedSeasonId(rows, activeId);
    });
  }, []);

  const refreshBundles = useCallback(async () => {
    setBundlesLoading(true);
    setTransfersLoading(true);
    const map = await fetchSeasonBundles(viewedSeasonId);
    setBundles(map);
    setTransfers(resolveSeasonTransfers(map));
    setBundlesLoading(false);
    setTransfersLoading(false);
  }, [viewedSeasonId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshSeasons();
    });
  }, [refreshSeasons]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      setBundlesLoading(true);
      setTransfersLoading(true);
    });
    void fetchSeasonBundles(viewedSeasonId).then((map) => {
      if (cancelled) return;
      setBundles(map);
      setTransfers(resolveSeasonTransfers(map));
      setBundlesLoading(false);
      setTransfersLoading(false);
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

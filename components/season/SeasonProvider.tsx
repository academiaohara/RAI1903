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
import { enrichFixtureSource, type EnrichedFixtureSource } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import { fetchPublishedTransfersSnapshot } from "@/lib/season/published-transfers";
import type { TransferMarketWindow } from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import { loadSeasonId, saveSeasonId } from "@/lib/storage";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type SeasonDataScope = "viewed" | "active";

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
  getBundles: (seasonId: CompetitionSeasonId) => SeasonBundlesMap;
  isBundlesLoading: (seasonId: CompetitionSeasonId) => boolean;
  resolveSeasonId: (scope?: SeasonDataScope) => CompetitionSeasonId;
  getFixtureSource: (gender: PrimerEquipoGender, scope?: SeasonDataScope) => JornadasFixtureSource;
  getEnrichedFixtureSource: (gender: PrimerEquipoGender, scope?: SeasonDataScope) => EnrichedFixtureSource;
  getCompetitionConfig: (
    gender: PrimerEquipoGender,
    scope?: SeasonDataScope,
  ) => ReturnType<typeof resolveCompetitionConfig>;
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
  const [bundleCache, setBundleCache] = useState<Partial<Record<CompetitionSeasonId, SeasonBundlesMap>>>({});
  const [pendingBundleLoads, setPendingBundleLoads] = useState<Set<CompetitionSeasonId>>(() => new Set());
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
    const previousActiveId = activeSeasonId;

    setActiveSeasonId(activeId);
    setViewedSeasonIdState((current) => {
      const stored = loadSeasonId();
      if (stored === previousActiveId && activeId !== previousActiveId) {
        saveSeasonId(activeId);
        return activeId;
      }
      if (rows.some((row) => row.id === current)) return current;
      return pickViewedSeasonId(rows, activeId);
    });
    await refreshPublishedTransfers(rows);
  }, [activeSeasonId, refreshPublishedTransfers]);

  const refreshBundles = useCallback(async () => {
    const map = await fetchSeasonBundles(viewedSeasonId);
    setBundleCache((current) => ({ ...current, [viewedSeasonId]: map }));
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

  const viewedBundlesLoaded = bundleCache[viewedSeasonId] !== undefined;
  const activeBundlesLoaded = bundleCache[activeSeasonId] !== undefined;

  useEffect(() => {
    if (viewedBundlesLoaded) return;

    let cancelled = false;
    const seasonId = viewedSeasonId;

    queueMicrotask(() => {
      if (cancelled) return;
      setPendingBundleLoads((current) => {
        if (current.has(seasonId)) return current;
        const next = new Set(current);
        next.add(seasonId);
        return next;
      });
    });

    void fetchSeasonBundles(seasonId).then((map) => {
      if (cancelled) return;
      setBundleCache((current) => ({ ...current, [seasonId]: map }));
      setPendingBundleLoads((current) => {
        if (!current.has(seasonId)) return current;
        const next = new Set(current);
        next.delete(seasonId);
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [viewedBundlesLoaded, viewedSeasonId]);

  useEffect(() => {
    if (activeSeasonId === viewedSeasonId || activeBundlesLoaded) return;

    let cancelled = false;
    const seasonId = activeSeasonId;

    queueMicrotask(() => {
      if (cancelled) return;
      setPendingBundleLoads((current) => {
        if (current.has(seasonId)) return current;
        const next = new Set(current);
        next.add(seasonId);
        return next;
      });
    });

    void fetchSeasonBundles(seasonId).then((map) => {
      if (cancelled) return;
      setBundleCache((current) => ({ ...current, [seasonId]: map }));
      setPendingBundleLoads((current) => {
        if (!current.has(seasonId)) return current;
        const next = new Set(current);
        next.delete(seasonId);
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeBundlesLoaded, activeSeasonId, viewedSeasonId]);

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

  const bundles = useMemo(() => bundleCache[viewedSeasonId] ?? {}, [bundleCache, viewedSeasonId]);
  const bundlesLoading = pendingBundleLoads.has(viewedSeasonId) || !viewedBundlesLoaded;

  const getBundles = useCallback(
    (seasonId: CompetitionSeasonId) => bundleCache[seasonId] ?? {},
    [bundleCache],
  );

  const isBundlesLoading = useCallback(
    (seasonId: CompetitionSeasonId) => pendingBundleLoads.has(seasonId) || bundleCache[seasonId] === undefined,
    [bundleCache, pendingBundleLoads],
  );

  const resolveSeasonId = useCallback(
    (scope: SeasonDataScope = "viewed") => (scope === "active" ? activeSeasonId : viewedSeasonId),
    [activeSeasonId, viewedSeasonId],
  );

  const getFixtureSource = useCallback(
    (gender: PrimerEquipoGender, scope: SeasonDataScope = "viewed") =>
      fixtureSourceFromBundles(getBundles(resolveSeasonId(scope)), gender),
    [getBundles, resolveSeasonId],
  );

  const getEnrichedFixtureSource = useCallback(
    (gender: PrimerEquipoGender, scope: SeasonDataScope = "viewed") => {
      const seasonId = resolveSeasonId(scope);
      const seasonBundles = getBundles(seasonId);
      return enrichFixtureSource(fixtureSourceFromBundles(seasonBundles, gender), seasonBundles, gender);
    },
    [getBundles, resolveSeasonId],
  );

  const getCompetitionConfig = useCallback(
    (gender: PrimerEquipoGender, scope: SeasonDataScope = "viewed") =>
      resolveCompetitionConfig(getBundles(resolveSeasonId(scope)), gender),
    [getBundles, resolveSeasonId],
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
      getBundles,
      isBundlesLoading,
      resolveSeasonId,
      getFixtureSource,
      getEnrichedFixtureSource,
      getCompetitionConfig,
    }),
    [
      activeSeasonId,
      bundles,
      bundlesLoading,
      transfers,
      transfersLoading,
      marketWindows,
      getFixtureSource,
      getEnrichedFixtureSource,
      getCompetitionConfig,
      getBundles,
      isBundlesLoading,
      refreshBundles,
      refreshSeasons,
      resolveSeasonId,
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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import {
  readAllCachedSeasonBundles,
  readCachedPublishedSeasons,
  readCachedSeasonBundles,
  readCachedTransfersSnapshot,
  writeCachedPublishedSeasons,
  writeCachedSeasonBundles,
  writeCachedTransfersSnapshot,
} from "@/lib/cms/client-cache";
import { fetchSeasonBundles, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { fetchPublishedSeasons, type CmsSeason } from "@/lib/cms/seasons";
import { enrichFixtureSource, type EnrichedFixtureSource } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import { fetchPublishedTransfersSnapshot } from "@/lib/season/published-transfers";
import type { TransferMarketWindow } from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";
import {
  findSeasonIdsForMatchInBundles,
  pickCanonicalSeasonIdForMatch,
} from "@/lib/season/resolve-match-season";
import { loadSeasonId, saveSeasonId } from "@/lib/storage";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { resolveTransferSeasonId } from "@/lib/transfer-market-windows";
import type { SquadPlayer } from "@/types/squad";

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
  /** Plantilla masculina por temporada (fotos de fichajes). */
  transferSquadsBySeasonId: Record<string, SquadPlayer[]>;
  resolveTransferSeasonIdForTransfer: (transfer: TransferRumor) => string;
  getTransferSquadForSeason: (seasonId: string) => SquadPlayer[];
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
  /** Temporada CMS que contiene el partido (fixtures), no el selector del usuario. */
  resolveSeasonIdForMatch: (matchId: string, gender: PrimerEquipoGender) => Promise<CompetitionSeasonId>;
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
  const [transfers, setTransfers] = useState<TransferRumor[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [marketWindows, setMarketWindows] = useState<TransferMarketWindow[]>([]);
  const [transferSquadsBySeasonId, setTransferSquadsBySeasonId] = useState<Record<string, SquadPlayer[]>>({});
  const cacheHydratedRef = useRef(false);
  const prefetchedSeasonIdsRef = useRef<Set<CompetitionSeasonId>>(new Set());

  const persistSeasonBundles = useCallback(async (seasonId: CompetitionSeasonId, map: SeasonBundlesMap) => {
    if (!Object.keys(map).length) return;
    await writeCachedSeasonBundles(seasonId, map);
  }, []);

  const fetchSeasonBundlesWithCache = useCallback(
    async (seasonId: CompetitionSeasonId): Promise<SeasonBundlesMap> => {
      const map = await fetchSeasonBundles(seasonId);
      if (Object.keys(map).length) {
        await persistSeasonBundles(seasonId, map);
      }
      return map;
    },
    [persistSeasonBundles],
  );

  useEffect(() => {
    if (cacheHydratedRef.current) return;
    cacheHydratedRef.current = true;

    let cancelled = false;

    void (async () => {
      const [cachedSeasons, cachedBundles, cachedTransfers] = await Promise.all([
        readCachedPublishedSeasons(),
        readAllCachedSeasonBundles(),
        readCachedTransfersSnapshot(),
      ]);

      if (cancelled) return;

      if (cachedSeasons?.length) {
        setSeasons(cachedSeasons);
        const active = cachedSeasons.find((row) => row.isDefault) ?? cachedSeasons[cachedSeasons.length - 1];
        if (active) {
          const activeId = active.id as CompetitionSeasonId;
          setActiveSeasonId(activeId);
          setViewedSeasonIdState((current) =>
            cachedSeasons.some((row) => row.id === current) ? current : pickViewedSeasonId(cachedSeasons, activeId),
          );
        }
      }

      if (Object.keys(cachedBundles).length) {
        setBundleCache((current) => ({ ...cachedBundles, ...current }));
        for (const seasonId of Object.keys(cachedBundles)) {
          prefetchedSeasonIdsRef.current.add(seasonId as CompetitionSeasonId);
        }
      }

      if (cachedTransfers) {
        setTransfers(cachedTransfers.transfers);
        setMarketWindows(cachedTransfers.marketWindows);
        setTransferSquadsBySeasonId(cachedTransfers.squadsBySeasonId);
        setTransfersLoading(false);
        if (Object.keys(cachedTransfers.bundlesBySeasonId).length) {
          setBundleCache((current) => ({ ...current, ...cachedTransfers.bundlesBySeasonId }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPublishedTransfers = useCallback(async (publishedRows: CmsSeason[]) => {
    setTransfersLoading(true);
    const snapshot = await fetchPublishedTransfersSnapshot(publishedRows);
    setTransfers(snapshot.transfers);
    setMarketWindows(snapshot.marketWindows);
    setTransferSquadsBySeasonId(snapshot.squadsBySeasonId);
    if (Object.keys(snapshot.bundlesBySeasonId).length) {
      setBundleCache((current) => ({ ...current, ...snapshot.bundlesBySeasonId }));
      await Promise.all(
        Object.entries(snapshot.bundlesBySeasonId).map(([seasonId, map]) =>
          writeCachedSeasonBundles(seasonId, map),
        ),
      );
    }
    await writeCachedTransfersSnapshot(snapshot);
    setTransfersLoading(false);
  }, []);

  const refreshSeasons = useCallback(async () => {
    const rows = await fetchPublishedSeasons();
    if (!rows.length) {
      setTransfersLoading(false);
      return;
    }
    setSeasons(rows);
    await writeCachedPublishedSeasons(rows);
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
  }, [activeSeasonId]);

  useEffect(() => {
    if (!seasons.length) return;

    const loadTransfers = () => {
      void refreshPublishedTransfers(seasons);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(loadTransfers, { timeout: 2500 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(loadTransfers, 800);
    return () => window.clearTimeout(timeoutId);
  }, [refreshPublishedTransfers, seasons]);

  const refreshBundles = useCallback(async () => {
    const map = await fetchSeasonBundlesWithCache(viewedSeasonId);
    setBundleCache((current) => ({ ...current, [viewedSeasonId]: map }));
    const publishedRows = seasons.length > 0 ? seasons : await fetchPublishedSeasons();
    if (publishedRows.length > 0) {
      if (!seasons.length) {
        setSeasons(publishedRows);
        await writeCachedPublishedSeasons(publishedRows);
      }
      await refreshPublishedTransfers(publishedRows);
    }
  }, [fetchSeasonBundlesWithCache, refreshPublishedTransfers, seasons, viewedSeasonId]);

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

    void readCachedSeasonBundles(seasonId).then((cached) => {
      if (cancelled || !cached || !Object.keys(cached).length) return;
      setBundleCache((current) => (current[seasonId] ? current : { ...current, [seasonId]: cached }));
    });

    void fetchSeasonBundlesWithCache(seasonId).then((map) => {
      if (cancelled) return;
      setBundleCache((current) => ({ ...current, [seasonId]: map }));
    });

    return () => {
      cancelled = true;
    };
  }, [fetchSeasonBundlesWithCache, viewedBundlesLoaded, viewedSeasonId]);

  useEffect(() => {
    if (activeSeasonId === viewedSeasonId || activeBundlesLoaded) return;

    let cancelled = false;
    const seasonId = activeSeasonId;

    void readCachedSeasonBundles(seasonId).then((cached) => {
      if (cancelled || !cached || !Object.keys(cached).length) return;
      setBundleCache((current) => (current[seasonId] ? current : { ...current, [seasonId]: cached }));
    });

    void fetchSeasonBundlesWithCache(seasonId).then((map) => {
      if (cancelled) return;
      setBundleCache((current) => ({ ...current, [seasonId]: map }));
    });

    return () => {
      cancelled = true;
    };
  }, [activeBundlesLoaded, activeSeasonId, fetchSeasonBundlesWithCache, viewedSeasonId]);

  useEffect(() => {
    if (!seasons.length) return;

    const prefetchRemainingSeasons = () => {
      for (const season of seasons) {
        const seasonId = season.id as CompetitionSeasonId;
        if (prefetchedSeasonIdsRef.current.has(seasonId)) continue;
        prefetchedSeasonIdsRef.current.add(seasonId);

        void fetchSeasonBundlesWithCache(seasonId)
          .then((map) => {
            setBundleCache((current) => ({ ...current, [seasonId]: map }));
          })
          .catch(() => {
            prefetchedSeasonIdsRef.current.delete(seasonId);
          });
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(prefetchRemainingSeasons, { timeout: 6000 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(prefetchRemainingSeasons, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [fetchSeasonBundlesWithCache, seasons]);

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
  const bundlesLoading = !viewedBundlesLoaded;

  const getBundles = useCallback(
    (seasonId: CompetitionSeasonId) => bundleCache[seasonId] ?? {},
    [bundleCache],
  );

  const isBundlesLoading = useCallback(
    (seasonId: CompetitionSeasonId) => bundleCache[seasonId] === undefined,
    [bundleCache],
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

  const resolveTransferSeasonIdForTransfer = useCallback(
    (transfer: TransferRumor) => resolveTransferSeasonId(transfer, viewedSeasonId),
    [viewedSeasonId],
  );

  const getTransferSquadForSeason = useCallback(
    (seasonId: string) => transferSquadsBySeasonId[seasonId] ?? [],
    [transferSquadsBySeasonId],
  );

  const resolveSeasonIdForMatch = useCallback(
    async (matchId: string, gender: PrimerEquipoGender): Promise<CompetitionSeasonId> => {
      const publishedIds = seasons.length
        ? seasons.map((season) => season.id as CompetitionSeasonId)
        : [activeSeasonId, viewedSeasonId];

      const cachedHits = findSeasonIdsForMatchInBundles(bundleCache, matchId, gender);
      const candidates = new Set<CompetitionSeasonId>(cachedHits);

      for (const seasonId of publishedIds) {
        if (candidates.has(seasonId)) continue;

        let bundles = getBundles(seasonId);
        if (Object.keys(bundles).length === 0) {
          const cached = await readCachedSeasonBundles(seasonId);
          if (cached && Object.keys(cached).length) {
            setBundleCache((current) => ({ ...current, [seasonId]: cached }));
            bundles = cached;
          } else {
            const fetched = await fetchSeasonBundlesWithCache(seasonId);
            setBundleCache((current) => ({ ...current, [seasonId]: fetched }));
            bundles = fetched;
          }
        }

        if (findMatchInBundles(bundles, matchId, { gender })) {
          candidates.add(seasonId);
        }
      }

      const picked = pickCanonicalSeasonIdForMatch(
        [...candidates],
        seasons,
        activeSeasonId,
        viewedSeasonId,
      );
      return picked ?? viewedSeasonId;
    },
    [activeSeasonId, bundleCache, fetchSeasonBundlesWithCache, getBundles, seasons, viewedSeasonId],
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
      transferSquadsBySeasonId,
      resolveTransferSeasonIdForTransfer,
      getTransferSquadForSeason,
      setViewedSeasonId,
      refreshSeasons,
      refreshBundles,
      getBundles,
      isBundlesLoading,
      resolveSeasonId,
      getFixtureSource,
      getEnrichedFixtureSource,
      getCompetitionConfig,
      resolveSeasonIdForMatch,
    }),
    [
      activeSeasonId,
      bundles,
      bundlesLoading,
      transfers,
      transfersLoading,
      marketWindows,
      transferSquadsBySeasonId,
      resolveTransferSeasonIdForTransfer,
      getTransferSquadForSeason,
      getFixtureSource,
      getEnrichedFixtureSource,
      getCompetitionConfig,
      getBundles,
      isBundlesLoading,
      refreshBundles,
      refreshSeasons,
      resolveSeasonId,
      resolveSeasonIdForMatch,
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

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
import { useSeason } from "@/components/season/SeasonProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { upsertInlineOverride } from "@/lib/cms/inline-overrides";
import {
  DEFAULT_HOME_SECTION_ORDER,
  HOME_SECTION_ORDER_KEY,
  normalizeHomeSectionOrder,
  type HomeSectionId,
} from "@/lib/home-layout";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LOCAL_STORAGE_KEY = "rai1903:home-section-order";

type HomeLayoutContextValue = {
  sectionOrder: HomeSectionId[];
  setSectionOrder: (order: HomeSectionId[]) => void;
  persistSectionOrder: (order: HomeSectionId[]) => Promise<{ ok: boolean; error?: string }>;
};

const HomeLayoutContext = createContext<HomeLayoutContextValue | null>(null);

function readLocalOrder(): HomeSectionId[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? normalizeHomeSectionOrder(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocalOrder(order: HomeSectionId[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(order));
}

export function HomeLayoutProvider({ children }: { children: ReactNode }) {
  const { getValue, ready } = useInlineEditing();
  const { activeSeasonId } = useSeason();
  const [sectionOrder, setSectionOrderState] = useState<HomeSectionId[]>(DEFAULT_HOME_SECTION_ORDER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ready) return;

    const fromInline = getValue<HomeSectionId[] | undefined>(HOME_SECTION_ORDER_KEY, undefined);
    const fromLocal = readLocalOrder();
    const next = normalizeHomeSectionOrder(fromInline ?? fromLocal ?? DEFAULT_HOME_SECTION_ORDER);
    queueMicrotask(() => {
      setSectionOrderState(next);
      setHydrated(true);
    });
  }, [getValue, ready]);

  const setSectionOrder = useCallback((order: HomeSectionId[]) => {
    setSectionOrderState(normalizeHomeSectionOrder(order));
  }, []);

  const persistSectionOrder = useCallback(
    async (order: HomeSectionId[]) => {
      const normalized = normalizeHomeSectionOrder(order);
      setSectionOrderState(normalized);
      writeLocalOrder(normalized);

      if (!isSupabaseConfigured()) {
        return { ok: true };
      }

      return upsertInlineOverride(HOME_SECTION_ORDER_KEY, normalized, null, activeSeasonId);
    },
    [activeSeasonId],
  );

  const value = useMemo<HomeLayoutContextValue>(
    () => ({
      sectionOrder: hydrated ? sectionOrder : DEFAULT_HOME_SECTION_ORDER,
      setSectionOrder,
      persistSectionOrder,
    }),
    [hydrated, persistSectionOrder, sectionOrder, setSectionOrder],
  );

  return <HomeLayoutContext.Provider value={value}>{children}</HomeLayoutContext.Provider>;
}

export function useHomeLayout() {
  const context = useContext(HomeLayoutContext);
  if (!context) {
    throw new Error("useHomeLayout debe usarse dentro de HomeLayoutProvider");
  }
  return context;
}

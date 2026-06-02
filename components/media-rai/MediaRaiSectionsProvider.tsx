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
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { upsertInlineOverride } from "@/lib/cms/inline-overrides";
import {
  DEFAULT_MEDIA_RAI_SECTIONS,
  MEDIA_RAI_SECTIONS_KEY,
  normalizeMediaRaiSections,
  type MediaRaiSectionEntry,
} from "@/lib/media-rai-sections";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LOCAL_STORAGE_KEY = "rai1903:media-rai-sections";

type MediaRaiSectionsContextValue = {
  sections: MediaRaiSectionEntry[];
  setSections: (sections: MediaRaiSectionEntry[]) => void;
  persistSections: (sections: MediaRaiSectionEntry[]) => Promise<{ ok: boolean; error?: string }>;
};

const MediaRaiSectionsContext = createContext<MediaRaiSectionsContextValue | null>(null);

function readLocalSections(): MediaRaiSectionEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? normalizeMediaRaiSections(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocalSections(sections: MediaRaiSectionEntry[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sections));
}

export function MediaRaiSectionsProvider({ children }: { children: ReactNode }) {
  const { getValue, ready } = useInlineEditing();
  const { activeSeasonId } = useSeason();
  const [sections, setSectionsState] = useState<MediaRaiSectionEntry[]>(DEFAULT_MEDIA_RAI_SECTIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ready) return;

    const fromInline = getValue<MediaRaiSectionEntry[] | undefined>(MEDIA_RAI_SECTIONS_KEY, undefined);
    const fromLocal = readLocalSections();
    const next = normalizeMediaRaiSections(fromInline ?? fromLocal ?? DEFAULT_MEDIA_RAI_SECTIONS);
    queueMicrotask(() => {
      setSectionsState(next);
      setHydrated(true);
    });
  }, [getValue, ready]);

  const setSections = useCallback((next: MediaRaiSectionEntry[]) => {
    setSectionsState(normalizeMediaRaiSections(next));
  }, []);

  const persistSections = useCallback(async (next: MediaRaiSectionEntry[]) => {
    const normalized = normalizeMediaRaiSections(next);
    setSectionsState(normalized);
    writeLocalSections(normalized);

    if (!isSupabaseConfigured()) {
      return { ok: true };
    }

    return upsertInlineOverride(MEDIA_RAI_SECTIONS_KEY, normalized, null, activeSeasonId);
  }, [activeSeasonId]);

  const value = useMemo<MediaRaiSectionsContextValue>(
    () => ({
      sections: hydrated ? sections : DEFAULT_MEDIA_RAI_SECTIONS,
      setSections,
      persistSections,
    }),
    [hydrated, persistSections, sections, setSections],
  );

  return <MediaRaiSectionsContext.Provider value={value}>{children}</MediaRaiSectionsContext.Provider>;
}

export function useMediaRaiSections() {
  const context = useContext(MediaRaiSectionsContext);
  if (!context) {
    throw new Error("useMediaRaiSections debe usarse dentro de MediaRaiSectionsProvider");
  }
  return context;
}

export function useMediaRaiSectionsOptional() {
  return useContext(MediaRaiSectionsContext);
}

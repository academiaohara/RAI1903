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

function initialSectionsState(): MediaRaiSectionEntry[] {
  return normalizeMediaRaiSections(readLocalSections() ?? DEFAULT_MEDIA_RAI_SECTIONS);
}

export function MediaRaiSectionsProvider({ children }: { children: ReactNode }) {
  const { getValue, ready, saveValue, saveNow } = useInlineEditing();
  const inlineSections = getValue<MediaRaiSectionEntry[] | undefined>(MEDIA_RAI_SECTIONS_KEY, undefined);
  const [sections, setSectionsState] = useState<MediaRaiSectionEntry[]>(initialSectionsState);

  useEffect(() => {
    if (!ready) return;

    const fromLocal = readLocalSections();
    const next = normalizeMediaRaiSections(inlineSections ?? fromLocal ?? DEFAULT_MEDIA_RAI_SECTIONS);
    queueMicrotask(() => {
      setSectionsState(next);
    });
  }, [inlineSections, ready]);

  const setSections = useCallback((next: MediaRaiSectionEntry[]) => {
    setSectionsState(normalizeMediaRaiSections(next));
  }, []);

  const persistSections = useCallback(
    async (next: MediaRaiSectionEntry[]) => {
      const normalized = normalizeMediaRaiSections(next);
      setSectionsState(normalized);
      writeLocalSections(normalized);
      saveValue(MEDIA_RAI_SECTIONS_KEY, normalized);

      if (!isSupabaseConfigured()) {
        return { ok: true };
      }

      const ok = await saveNow();
      return ok ? { ok: true } : { ok: false, error: "No se pudo guardar en Supabase" };
    },
    [saveNow, saveValue],
  );

  const value = useMemo<MediaRaiSectionsContextValue>(
    () => ({
      sections,
      setSections,
      persistSections,
    }),
    [persistSections, sections, setSections],
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

"use client";

import type { User } from "@supabase/supabase-js";
import { Check, Clipboard, Pencil, Trash2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSeasonOptional } from "@/components/season/SeasonProvider";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { isEditorSession } from "@/lib/auth/editor";
import {
  clearInlineOverrides,
  deleteInlineOverride,
  fetchInlineOverrides,
  upsertInlineOverride,
  upsertInlineOverridesBatch,
} from "@/lib/cms/inline-overrides";
import { SeasonManagerPanel } from "@/components/editor/SeasonManagerPanel";
import { TeamCrestEditorPanel } from "@/components/editor/TeamCrestEditorPanel";
import { HomeLayoutEditorPanel } from "@/components/editor/HomeLayoutEditorPanel";
import { TransferMarketEditorPanel } from "@/components/editor/TransferMarketEditorPanel";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LEGACY_STORAGE_KEY = "rai1903:inline-edits:v1";
const MODE_KEY = "rai1903:inline-edit-mode";
const SAVE_DEBOUNCE_MS = 450;

type InlineOverrides = Record<string, unknown>;

type InlineEditingContextValue = {
  canEdit: boolean;
  editMode: boolean;
  ready: boolean;
  localOnly: boolean;
  syncError: string | null;
  setEditMode: (enabled: boolean) => void;
  getOverride: <T,>(key: string) => T | undefined;
  getValue: <T,>(key: string, fallback: T) => T;
  saveValue: <T,>(key: string, value: T) => void;
  clearValue: (key: string) => void;
  clearAll: () => void;
  exportJson: () => Promise<boolean>;
};

const InlineEditingContext = createContext<InlineEditingContextValue | null>(null);

function readLegacyOverrides(): InlineOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InlineOverrides) : {};
  } catch {
    return {};
  }
}

function persistLegacyOverrides(overrides: InlineOverrides) {
  window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(overrides));
}

function clearLegacyOverrides() {
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function canCurrentUserEdit(user: User | null): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  return isEditorSession(user);
}

function mergeOverrideMaps(...maps: InlineOverrides[]): InlineOverrides {
  return Object.assign({}, ...maps);
}

export function InlineEditingProvider({
  children,
  initialOverrides = {},
}: {
  children: React.ReactNode;
  initialOverrides?: InlineOverrides;
}) {
  const seasonId = useSeasonOptional()?.viewedSeasonId ?? DEFAULT_COMPETITION_SEASON_ID;
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(false);
  const [canEdit, setCanEdit] = useState(!configured);
  const [editMode, setEditModeState] = useState(false);
  const [overrides, setOverrides] = useState<InlineOverrides>(() =>
    configured ? initialOverrides : readLegacyOverrides(),
  );
  const [syncError, setSyncError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const saveTimersRef = useRef<Map<string, number>>(new Map());
  const pendingValuesRef = useRef<Map<string, unknown>>(new Map());
  const overridesRef = useRef<InlineOverrides>({});

  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  const flushSave = useCallback(
    async (key: string, value: unknown) => {
      if (!configured) return;

      pendingValuesRef.current.delete(key);
      const result = await upsertInlineOverride(key, value, userIdRef.current, seasonId);
      if (!result.ok) {
        setSyncError(result.error ?? "No se pudo guardar en Supabase");
      } else {
        setSyncError(null);
      }
    },
    [configured, seasonId],
  );

  const flushPendingSaves = useCallback(() => {
    for (const timer of saveTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    saveTimersRef.current.clear();

    for (const [key, value] of pendingValuesRef.current.entries()) {
      void flushSave(key, value);
    }
  }, [flushSave]);

  const scheduleCloudSave = useCallback(
    (key: string, value: unknown) => {
      if (!configured) return;

      pendingValuesRef.current.set(key, value);

      const pending = saveTimersRef.current.get(key);
      if (pending) window.clearTimeout(pending);

      saveTimersRef.current.set(
        key,
        window.setTimeout(() => {
          saveTimersRef.current.delete(key);
          void flushSave(key, value);
        }, SAVE_DEBOUNCE_MS),
      );
    },
    [configured, flushSave],
  );

  const migrateLegacyToCloud = useCallback(async () => {
    const legacy = readLegacyOverrides();
    const legacyKeys = Object.keys(legacy).filter((key) => legacy[key] !== undefined);
    if (!legacyKeys.length) return;

    const current = overridesRef.current;
    const toUpload: InlineOverrides = {};
    for (const key of legacyKeys) {
      if (!(key in current)) toUpload[key] = legacy[key];
    }

    if (!Object.keys(toUpload).length) {
      clearLegacyOverrides();
      return;
    }

    const result = await upsertInlineOverridesBatch(toUpload, userIdRef.current, seasonId);
    if (result.ok) {
      setOverrides((prev) => ({ ...prev, ...toUpload }));
      clearLegacyOverrides();
    } else {
      setSyncError(result.error ?? "No se pudo migrar cambios locales");
    }
  }, [seasonId]);

  useEffect(() => {
    queueMicrotask(() => {
      setEditModeState(window.localStorage.getItem(MODE_KEY) === "1");
    });
  }, []);

  useEffect(() => {
    if (!configured) {
      queueMicrotask(() => {
        setOverrides(readLegacyOverrides());
        setReady(true);
      });
      return;
    }

    void fetchInlineOverrides(seasonId).then(({ overrides: cloud, error }) => {
      const legacy = readLegacyOverrides();
      setOverrides(mergeOverrideMaps(legacy, seasonId === DEFAULT_COMPETITION_SEASON_ID ? initialOverrides : {}, cloud));
      if (error) {
        setSyncError(`No se pudieron cargar cambios de Supabase: ${error}`);
      }
      setReady(true);
    });
  }, [configured, initialOverrides, seasonId]);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const syncUser = async (user: User | null) => {
      userIdRef.current = user?.id ?? null;
      const allowed = await canCurrentUserEdit(user);
      setCanEdit(allowed);
      if (!allowed) setEditModeState(false);
      if (allowed) await migrateLegacyToCloud();
    };

    void supabase.auth.getUser().then(({ data }) => void syncUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured, migrateLegacyToCloud]);

  useEffect(() => {
    if (!configured) return;

    const handlePageHide = () => {
      flushPendingSaves();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      flushPendingSaves();
    };
  }, [configured, flushPendingSaves]);

  const setEditMode = useCallback(
    (enabled: boolean) => {
      if (!canEdit && enabled) return;
      if (!enabled) flushPendingSaves();
      setEditModeState(enabled);
      window.localStorage.setItem(MODE_KEY, enabled ? "1" : "0");
    },
    [canEdit, flushPendingSaves],
  );

  const saveValue = useCallback(
    <T,>(key: string, value: T) => {
      setOverrides((current) => {
        const next = { ...current, [key]: value };
        if (!configured) persistLegacyOverrides(next);
        return next;
      });
      scheduleCloudSave(key, value);
    },
    [configured, scheduleCloudSave],
  );

  const clearValue = useCallback(
    (key: string) => {
      const pending = saveTimersRef.current.get(key);
      if (pending) {
        window.clearTimeout(pending);
        saveTimersRef.current.delete(key);
      }

      setOverrides((current) => {
        const next = { ...current };
        delete next[key];
        if (!configured) persistLegacyOverrides(next);
        return next;
      });

      if (configured) {
        void deleteInlineOverride(key, seasonId).then((result) => {
          if (!result.ok) setSyncError(result.error ?? "No se pudo borrar en Supabase");
          else setSyncError(null);
        });
      }
    },
    [configured, seasonId],
  );

  const clearAll = useCallback(() => {
    for (const timer of saveTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    saveTimersRef.current.clear();
    pendingValuesRef.current.clear();

    setOverrides({});
    clearLegacyOverrides();

    if (configured) {
      void clearInlineOverrides(seasonId).then((result) => {
        if (!result.ok) setSyncError(result.error ?? "No se pudo limpiar Supabase");
        else setSyncError(null);
      });
    }
  }, [configured, seasonId]);

  const exportJson = useCallback(async () => {
    const payload = JSON.stringify(overridesRef.current, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<InlineEditingContextValue>(
    () => ({
      canEdit,
      editMode: canEdit && editMode,
      ready,
      localOnly: !configured,
      syncError,
      setEditMode,
      getOverride: <T,>(key: string) => overrides[key] as T | undefined,
      getValue: <T,>(key: string, fallback: T) => (overrides[key] as T | undefined) ?? fallback,
      saveValue,
      clearValue,
      clearAll,
      exportJson,
    }),
    [
      canEdit,
      clearAll,
      clearValue,
      configured,
      editMode,
      exportJson,
      overrides,
      ready,
      saveValue,
      setEditMode,
      syncError,
    ],
  );

  return <InlineEditingContext.Provider value={value}>{children}</InlineEditingContext.Provider>;
}

export function useInlineEditing() {
  const context = useContext(InlineEditingContext);
  if (!context) {
    throw new Error("useInlineEditing debe usarse dentro de InlineEditingProvider");
  }
  return context;
}

export function InlineEditingToolbar() {
  const seasonContext = useSeasonOptional();
  const { canEdit, editMode, ready, localOnly, syncError, setEditMode, clearAll, exportJson } =
    useInlineEditing();
  const seasonLabel = seasonContext?.viewedSeason.label;
  const isArchive = seasonContext?.isViewingArchive;
  const [copied, setCopied] = useState(false);
  const [seasonPanelOpen, setSeasonPanelOpen] = useState(false);
  const [crestPanelOpen, setCrestPanelOpen] = useState(false);
  const [transfersPanelOpen, setTransfersPanelOpen] = useState(false);
  const [homePanelOpen, setHomePanelOpen] = useState(false);

  if (!ready || !canEdit) return null;

  const handleExport = async () => {
    const ok = await exportJson();
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const statusLabel = syncError
    ? syncError
    : localOnly
      ? "Solo en este navegador (sin Supabase)"
      : isArchive
        ? `Editando archivo ${seasonLabel ?? ""} · Supabase`
        : `Temporada ${seasonLabel ?? ""} · Supabase`;

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {editMode && (
        <div
          className={`max-w-xs rounded-2xl border bg-white/95 p-2 text-xs font-bold shadow-xl backdrop-blur ${
            syncError ? "border-[#981915]/30 text-[#981915]" : "border-[#214C9B]/20 text-slate-600"
          }`}
        >
          {statusLabel}
        </div>
      )}
      {editMode && seasonPanelOpen && (
        <SeasonManagerPanel onClose={() => setSeasonPanelOpen(false)} />
      )}
      {editMode && crestPanelOpen && (
        <TeamCrestEditorPanel onClose={() => setCrestPanelOpen(false)} />
      )}
      {editMode && transfersPanelOpen && (
        <TransferMarketEditorPanel onClose={() => setTransfersPanelOpen(false)} />
      )}
      {editMode && homePanelOpen && (
        <HomeLayoutEditorPanel onClose={() => setHomePanelOpen(false)} />
      )}
      <div className="flex flex-wrap justify-end gap-2 rounded-full border border-[#214C9B]/20 bg-white/95 p-2 shadow-2xl backdrop-blur">
        {editMode && (
          <>
            <button
              type="button"
              onClick={() => {
                setCrestPanelOpen(false);
                setTransfersPanelOpen(false);
                setHomePanelOpen(false);
                setSeasonPanelOpen((open) => !open);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              Temporadas
            </button>
            <button
              type="button"
              onClick={() => {
                setSeasonPanelOpen(false);
                setTransfersPanelOpen(false);
                setHomePanelOpen(false);
                setCrestPanelOpen((open) => !open);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              Escudos
            </button>
            <button
              type="button"
              onClick={() => {
                setSeasonPanelOpen(false);
                setCrestPanelOpen(false);
                setTransfersPanelOpen(false);
                setHomePanelOpen((open) => !open);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => {
                setSeasonPanelOpen(false);
                setCrestPanelOpen(false);
                setHomePanelOpen(false);
                setTransfersPanelOpen((open) => !open);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              Mercado
            </button>
            <button
              type="button"
              onClick={() => void handleExport()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              {copied ? <Check size={14} /> : <Clipboard size={14} />}
              {copied ? "Copiado" : "Exportar"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#981915]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#981915] hover:bg-red-50"
            >
              <Trash2 size={14} />
              Limpiar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white shadow-lg shadow-blue-950/20 hover:bg-[#173a78]"
        >
          {editMode ? <X size={14} /> : <Pencil size={14} />}
          {editMode ? "Salir" : "Editar"}
        </button>
      </div>
    </div>
  );
}

"use client";

import type { User } from "@supabase/supabase-js";
import { Check, Clipboard, Pencil, Trash2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isEditorSession } from "@/lib/auth/editor";
import {
  clearInlineOverrides,
  deleteInlineOverride,
  fetchInlineOverrides,
  upsertInlineOverride,
  upsertInlineOverridesBatch,
} from "@/lib/cms/inline-overrides";
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

export function InlineEditingProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(false);
  const [canEdit, setCanEdit] = useState(!configured);
  const [editMode, setEditModeState] = useState(false);
  const [overrides, setOverrides] = useState<InlineOverrides>({});
  const [syncError, setSyncError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const saveTimersRef = useRef<Map<string, number>>(new Map());
  const overridesRef = useRef<InlineOverrides>({});

  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  const flushSave = useCallback(
    async (key: string, value: unknown) => {
      if (!configured) return;

      const result = await upsertInlineOverride(key, value, userIdRef.current);
      if (!result.ok) {
        setSyncError(result.error ?? "No se pudo guardar en Supabase");
      } else {
        setSyncError(null);
      }
    },
    [configured],
  );

  const scheduleCloudSave = useCallback(
    (key: string, value: unknown) => {
      if (!configured) return;

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

    const result = await upsertInlineOverridesBatch(toUpload, userIdRef.current);
    if (result.ok) {
      setOverrides((prev) => ({ ...prev, ...toUpload }));
      clearLegacyOverrides();
    } else {
      setSyncError(result.error ?? "No se pudo migrar cambios locales");
    }
  }, []);

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

    void fetchInlineOverrides().then((cloud) => {
      setOverrides(cloud);
      setReady(true);
    });
  }, [configured]);

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
    const timers = saveTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const setEditMode = useCallback(
    (enabled: boolean) => {
      if (!canEdit && enabled) return;
      setEditModeState(enabled);
      window.localStorage.setItem(MODE_KEY, enabled ? "1" : "0");
    },
    [canEdit],
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
        void deleteInlineOverride(key).then((result) => {
          if (!result.ok) setSyncError(result.error ?? "No se pudo borrar en Supabase");
          else setSyncError(null);
        });
      }
    },
    [configured],
  );

  const clearAll = useCallback(() => {
    for (const timer of saveTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    saveTimersRef.current.clear();

    setOverrides({});
    clearLegacyOverrides();

    if (configured) {
      void clearInlineOverrides().then((result) => {
        if (!result.ok) setSyncError(result.error ?? "No se pudo limpiar Supabase");
        else setSyncError(null);
      });
    }
  }, [configured]);

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

  return (
    <InlineEditingContext.Provider value={value}>
      {children}
      <InlineEditingToolbar />
    </InlineEditingContext.Provider>
  );
}

export function useInlineEditing() {
  const context = useContext(InlineEditingContext);
  if (!context) {
    throw new Error("useInlineEditing debe usarse dentro de InlineEditingProvider");
  }
  return context;
}

function InlineEditingToolbar() {
  const { canEdit, editMode, ready, localOnly, syncError, setEditMode, clearAll, exportJson } =
    useInlineEditing();
  const [copied, setCopied] = useState(false);

  if (!ready || !canEdit) return null;

  const handleExport = async () => {
    const ok = await exportJson();
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const statusLabel = syncError
    ? syncError
    : localOnly
      ? "Autoguardado local (sin Supabase)"
      : "Guardado en Supabase";

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
      <div className="flex flex-wrap justify-end gap-2 rounded-full border border-[#214C9B]/20 bg-white/95 p-2 shadow-2xl backdrop-blur">
        {editMode && (
          <>
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

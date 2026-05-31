"use client";

import type { User } from "@supabase/supabase-js";
import { Check, Clipboard, Pencil, Trash2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isEditorSession } from "@/lib/auth/editor";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const STORAGE_KEY = "rai1903:inline-edits:v1";
const MODE_KEY = "rai1903:inline-edit-mode";

type InlineOverrides = Record<string, unknown>;

type InlineEditingContextValue = {
  canEdit: boolean;
  editMode: boolean;
  ready: boolean;
  localOnly: boolean;
  setEditMode: (enabled: boolean) => void;
  getOverride: <T,>(key: string) => T | undefined;
  getValue: <T,>(key: string, fallback: T) => T;
  saveValue: <T,>(key: string, value: T) => void;
  clearValue: (key: string) => void;
  clearAll: () => void;
  exportJson: () => Promise<boolean>;
};

const InlineEditingContext = createContext<InlineEditingContextValue | null>(null);

function readOverrides(): InlineOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InlineOverrides) : {};
  } catch {
    return {};
  }
}

function persistOverrides(overrides: InlineOverrides) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

async function canCurrentUserEdit(user: User | null): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  return isEditorSession(user);
}

export function InlineEditingProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [canEdit, setCanEdit] = useState(!configured);
  const [editMode, setEditModeState] = useState(false);
  const [overrides, setOverrides] = useState<InlineOverrides>({});

  useEffect(() => {
    setOverrides(readOverrides());
    setEditModeState(window.localStorage.getItem(MODE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();

    const syncUser = async (user: User | null) => {
      const allowed = await canCurrentUserEdit(user);
      setCanEdit(allowed);
      if (!allowed) setEditModeState(false);
      setReady(true);
    };

    void supabase.auth.getUser().then(({ data }) => void syncUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const setEditMode = useCallback(
    (enabled: boolean) => {
      if (!canEdit && enabled) return;
      setEditModeState(enabled);
      window.localStorage.setItem(MODE_KEY, enabled ? "1" : "0");
    },
    [canEdit],
  );

  const saveValue = useCallback(<T,>(key: string, value: T) => {
    setOverrides((current) => {
      const next = { ...current, [key]: value };
      persistOverrides(next);
      return next;
    });
  }, []);

  const clearValue = useCallback((key: string) => {
    setOverrides((current) => {
      const next = { ...current };
      delete next[key];
      persistOverrides(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setOverrides({});
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportJson = useCallback(async () => {
    const payload = JSON.stringify(readOverrides(), null, 2);
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
      setEditMode,
      getOverride: <T,>(key: string) => overrides[key] as T | undefined,
      getValue: <T,>(key: string, fallback: T) => (overrides[key] as T | undefined) ?? fallback,
      saveValue,
      clearValue,
      clearAll,
      exportJson,
    }),
    [canEdit, clearAll, clearValue, configured, editMode, exportJson, overrides, ready, saveValue, setEditMode],
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
  const { canEdit, editMode, ready, localOnly, setEditMode, clearAll, exportJson } = useInlineEditing();
  const [copied, setCopied] = useState(false);

  if (!ready || !canEdit) return null;

  const handleExport = async () => {
    const ok = await exportJson();
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {editMode && (
        <div className="rounded-2xl border border-[#214C9B]/20 bg-white/95 p-2 text-xs font-bold text-slate-600 shadow-xl backdrop-blur">
          {localOnly ? "Autoguardado local" : "Modo editor"}
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

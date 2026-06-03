"use client";

import type { User } from "@supabase/supabase-js";
import { Check, ChevronRight, Clipboard, CloudUpload, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type WheelEvent,
} from "react";
import { useSeasonOptional } from "@/components/season/SeasonProvider";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { isEditorSession } from "@/lib/auth/editor";
import {
  clearInlineOverrides,
  deleteInlineOverride,
  fetchInlineOverrides,
  fetchMediaRaiInlineOverrides,
  resolveInlineOverrideSeasonId,
  upsertInlineOverride,
  upsertInlineOverridesBatch,
} from "@/lib/cms/inline-overrides";
import { SeasonManagerPanel } from "@/components/editor/SeasonManagerPanel";
import { TeamCrestEditorPanel } from "@/components/editor/TeamCrestEditorPanel";
import { HomeLayoutEditorPanel } from "@/components/editor/HomeLayoutEditorPanel";
import { MediaRaiSectionsEditorPanel } from "@/components/editor/MediaRaiSectionsEditorPanel";
import { CompetitionEditorPanel } from "@/components/editor/CompetitionEditorPanel";
import { TeamsEditorPanel } from "@/components/editor/TeamsEditorPanel";
import {
  EDITOR_PAGE_LINKS,
  isFichajesPath,
  isFilialPath,
  isJuvenilPath,
  isPlantillaPath,
  plantillaEditorLink,
} from "@/lib/editor-routes";
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
  cloudSaving: boolean;
  saveNow: () => Promise<boolean>;
  setEditMode: (enabled: boolean) => void;
  overrides: InlineOverrides;
  getOverride: <T,>(key: string) => T | undefined;
  getValue: <T,>(key: string, fallback: T) => T;
  saveValue: <T,>(key: string, value: T) => void;
  mergeSaveValue: <T extends Record<string, unknown>>(key: string, patch: Partial<T>) => void;
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
  const [cloudSaving, setCloudSaving] = useState(false);

  const userIdRef = useRef<string | null>(null);
  const saveTimersRef = useRef<Map<string, number>>(new Map());
  const pendingValuesRef = useRef<Map<string, unknown>>(new Map());
  const overridesRef = useRef<InlineOverrides>({});

  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  const flushSave = useCallback(
    async (key: string, value: unknown): Promise<boolean> => {
      if (!configured) return true;

      pendingValuesRef.current.delete(key);
      const result = await upsertInlineOverride(key, value, userIdRef.current, resolveInlineOverrideSeasonId(key, seasonId));
      if (!result.ok) {
        setSyncError(result.error ?? "No se pudo guardar en Supabase");
        return false;
      }
      setSyncError(null);
      return true;
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

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!configured) return true;

    for (const timer of saveTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    saveTimersRef.current.clear();

    const entries = [...pendingValuesRef.current.entries()];
    if (!entries.length) return true;

    setCloudSaving(true);
    const results = await Promise.all(entries.map(([key, value]) => flushSave(key, value)));
    setCloudSaving(false);
    return results.every(Boolean);
  }, [configured, flushSave]);

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

    const bySeason = new Map<string, InlineOverrides>();
    for (const [key, value] of Object.entries(toUpload)) {
      const targetSeasonId = resolveInlineOverrideSeasonId(key, seasonId);
      const bucket = bySeason.get(targetSeasonId) ?? {};
      bucket[key] = value;
      bySeason.set(targetSeasonId, bucket);
    }

    const results = await Promise.all(
      [...bySeason.entries()].map(([targetSeasonId, entries]) =>
        upsertInlineOverridesBatch(entries, userIdRef.current, targetSeasonId),
      ),
    );
    const result = results.find((item) => !item.ok) ?? { ok: true };
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

    void Promise.all([fetchInlineOverrides(seasonId), fetchMediaRaiInlineOverrides()]).then(
      ([seasonResult, mediaRaiResult]) => {
        const legacy = readLegacyOverrides();
        setOverrides(
          mergeOverrideMaps(
            legacy,
            seasonId === DEFAULT_COMPETITION_SEASON_ID ? initialOverrides : {},
            seasonResult.overrides,
            mediaRaiResult.overrides,
          ),
        );
        const error = seasonResult.error ?? mediaRaiResult.error;
        if (error) {
          setSyncError(`No se pudieron cargar cambios de Supabase: ${error}`);
        }
        setReady(true);
      },
    );
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

  const mergeSaveValue = useCallback(
    <T extends Record<string, unknown>>(key: string, patch: Partial<T>) => {
      const previous = (overridesRef.current[key] as T | undefined) ?? ({} as T);
      const merged = { ...previous, ...patch } as T;

      setOverrides((current) => {
        const next = { ...current, [key]: merged };
        if (!configured) persistLegacyOverrides(next);
        return next;
      });
      scheduleCloudSave(key, merged);
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
        void deleteInlineOverride(key, resolveInlineOverrideSeasonId(key, seasonId)).then((result) => {
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
      cloudSaving,
      saveNow,
      setEditMode,
      overrides,
      getOverride: <T,>(key: string) => overrides[key] as T | undefined,
      getValue: <T,>(key: string, fallback: T) => (overrides[key] as T | undefined) ?? fallback,
      saveValue,
      mergeSaveValue,
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
      mergeSaveValue,
      overrides,
      ready,
      saveValue,
      setEditMode,
      syncError,
      cloudSaving,
      saveNow,
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

function useHorizontalScrollHint(
  scrollRef: RefObject<HTMLDivElement | null>,
  editMode: boolean,
  pathname: string,
) {
  const [hint, setHint] = useState({ left: false, right: false });

  const refresh = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setHint({ left: false, right: false });
      return;
    }

    const overflow = el.scrollWidth - el.clientWidth > 4;
    setHint({
      left: overflow && el.scrollLeft > 4,
      right: overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    refresh();
    el.addEventListener("scroll", refresh, { passive: true });
    const observer = new ResizeObserver(refresh);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", refresh);
      observer.disconnect();
    };
  }, [editMode, pathname, refresh, scrollRef]);

  return hint;
}

const editorToolbarButtonClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50";

export function InlineEditingToolbar() {
  const seasonContext = useSeasonOptional();
  const { canEdit, editMode, ready, localOnly, syncError, cloudSaving, saveNow, setEditMode, clearAll, exportJson } =
    useInlineEditing();
  const seasonLabel = seasonContext?.viewedSeason.label;
  const isArchive = seasonContext?.isViewingArchive;
  const [copied, setCopied] = useState(false);
  const [saveAck, setSaveAck] = useState(false);
  const [seasonPanelOpen, setSeasonPanelOpen] = useState(false);
  const [crestPanelOpen, setCrestPanelOpen] = useState(false);
  const [homePanelOpen, setHomePanelOpen] = useState(false);
  const [mediaRaiPanelOpen, setMediaRaiPanelOpen] = useState(false);
  const [competitionPanelOpen, setCompetitionPanelOpen] = useState(false);
  const [teamsPanelOpen, setTeamsPanelOpen] = useState(false);
  const pathname = usePathname();
  const toolbarScrollRef = useRef<HTMLDivElement>(null);
  const scrollHint = useHorizontalScrollHint(toolbarScrollRef, editMode, pathname);

  const handleToolbarWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const list = event.currentTarget;
    if (list.scrollWidth <= list.clientWidth) return;

    event.preventDefault();
    list.scrollLeft += event.deltaY;
  };

  const closeEditorPanels = useCallback(() => {
    setSeasonPanelOpen(false);
    setCrestPanelOpen(false);
    setHomePanelOpen(false);
    setMediaRaiPanelOpen(false);
    setCompetitionPanelOpen(false);
    setTeamsPanelOpen(false);
  }, []);

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
      : cloudSaving
        ? "Guardando en Supabase…"
        : saveAck
          ? "Cambios guardados en Supabase"
          : isArchive
            ? `Editando archivo ${seasonLabel ?? ""}. Pulsa «Guardar en Supabase» para confirmar.`
            : `Temporada ${seasonLabel ?? ""}. Pulsa «Guardar en Supabase» para confirmar.`;

  const handleSaveNow = async () => {
    const ok = await saveNow();
    if (ok) {
      setSaveAck(true);
      window.setTimeout(() => setSaveAck(false), 2500);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] flex flex-col items-stretch gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-[calc(100vw-2rem)] sm:items-end sm:px-0 sm:pb-0 sm:pt-0">
      {editMode && (
        <div
          className={`rounded-2xl border bg-white/95 p-2 text-xs font-bold shadow-xl backdrop-blur sm:max-w-xs ${
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
      {editMode && homePanelOpen && (
        <HomeLayoutEditorPanel onClose={() => setHomePanelOpen(false)} />
      )}
      {editMode && mediaRaiPanelOpen && (
        <MediaRaiSectionsEditorPanel onClose={() => setMediaRaiPanelOpen(false)} />
      )}
      {editMode && competitionPanelOpen && (
        <CompetitionEditorPanel onClose={() => setCompetitionPanelOpen(false)} />
      )}
      {editMode && teamsPanelOpen && <TeamsEditorPanel onClose={() => setTeamsPanelOpen(false)} />}
      <div className="relative min-w-0 sm:max-w-[min(100vw-2rem,42rem)]">
        {editMode && scrollHint.right && (
          <p
            className="pointer-events-none absolute -top-5 right-0 z-10 flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]/80 sm:hidden"
            aria-hidden
          >
            Desliza
            <ChevronRight size={12} className="animate-pulse" aria-hidden />
          </p>
        )}
        {scrollHint.left && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 rounded-l-2xl bg-gradient-to-r from-white/95 to-transparent sm:rounded-l-full"
            aria-hidden
          />
        )}
        {scrollHint.right && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-white/95 to-transparent sm:rounded-r-full"
            aria-hidden
          />
        )}
        <div
          ref={toolbarScrollRef}
          onWheel={handleToolbarWheel}
          className="no-scrollbar flex min-w-0 touch-pan-x flex-nowrap items-center justify-end gap-2 overflow-x-auto overscroll-x-contain rounded-2xl border border-[#214C9B]/20 bg-white/95 p-2 shadow-2xl backdrop-blur sm:max-w-[min(100vw-2rem,42rem)] sm:rounded-full"
        >
          {editMode && (
            <>
              {!localOnly && (
                <button
                  type="button"
                  onClick={() => void handleSaveNow()}
                  disabled={cloudSaving}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs font-extrabold uppercase text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                >
                  <CloudUpload size={14} />
                  {cloudSaving ? "Guardando…" : saveAck ? "Guardado" : "Guardar en Supabase"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setSeasonPanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Temporadas
              </button>
              {!isPlantillaPath(pathname) && (
                <Link
                  href={plantillaEditorLink(pathname)}
                  onClick={closeEditorPanels}
                  className={editorToolbarButtonClass}
                >
                  <ExternalLink size={14} aria-hidden />
                  Plantilla
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setCompetitionPanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Competición
              </button>
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setTeamsPanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Equipos
              </button>
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setCrestPanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Escudos
              </button>
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setHomePanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Inicio
              </button>
              <button
                type="button"
                onClick={() => {
                  closeEditorPanels();
                  setMediaRaiPanelOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
              >
                Media RAI
              </button>
              {!isFichajesPath(pathname) && (
                <Link href={EDITOR_PAGE_LINKS.fichajes} onClick={closeEditorPanels} className={editorToolbarButtonClass}>
                  <ExternalLink size={14} aria-hidden />
                  Mercado
                </Link>
              )}
              {!isFilialPath(pathname) && (
                <Link href={EDITOR_PAGE_LINKS.filial} onClick={closeEditorPanels} className={editorToolbarButtonClass}>
                  <ExternalLink size={14} aria-hidden />
                  Filial
                </Link>
              )}
              {!isJuvenilPath(pathname) && (
                <Link href={EDITOR_PAGE_LINKS.juvenil} onClick={closeEditorPanels} className={editorToolbarButtonClass}>
                  <ExternalLink size={14} aria-hidden />
                  Juvenil
                </Link>
              )}
              <button
                type="button"
                onClick={() => void handleExport()}
                className={editorToolbarButtonClass}
              >
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? "Copiado" : "Exportar"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#981915]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#981915] hover:bg-red-50"
              >
                <Trash2 size={14} />
                Limpiar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#214C9B] px-4 py-2 text-xs font-extrabold uppercase text-white shadow-lg shadow-blue-950/20 hover:bg-[#173a78]"
          >
            {editMode ? <X size={14} /> : <Pencil size={14} />}
            {editMode ? "Salir" : "Editar"}
          </button>
        </div>
        {editMode && scrollHint.right && (
          <span className="sr-only">Desliza horizontalmente para ver más opciones del editor</span>
        )}
      </div>
    </div>
  );
}

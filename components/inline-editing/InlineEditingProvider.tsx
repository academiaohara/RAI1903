"use client";

import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CloudUpload,
  Pencil,
  X,
} from "lucide-react";
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
  fetchHomeGlobalInlineOverrides,
  fetchInlineOverrides,
  fetchMediaRaiInlineOverrides,
  isHomeGlobalInlineKey,
  resolveInlineOverrideSeasonId,
  upsertInlineOverride,
  upsertInlineOverridesBatch,
} from "@/lib/cms/inline-overrides";
import { isMediaRaiGlobalInlineKey } from "@/lib/fan-videos";
import { isJornadasPath } from "@/lib/editor-routes";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const SeasonManagerPanel = dynamic(() =>
  import("@/components/editor/SeasonManagerPanel").then((m) => ({ default: m.SeasonManagerPanel })),
);
const SectionStatusEditorPanel = dynamic(() =>
  import("@/components/editor/SectionStatusEditorPanel").then((m) => ({ default: m.SectionStatusEditorPanel })),
);
const TeamCrestEditorPanel = dynamic(() =>
  import("@/components/editor/TeamCrestEditorPanel").then((m) => ({ default: m.TeamCrestEditorPanel })),
);
const HomeLayoutEditorPanel = dynamic(() =>
  import("@/components/editor/HomeLayoutEditorPanel").then((m) => ({ default: m.HomeLayoutEditorPanel })),
);
const MediaRaiSectionsEditorPanel = dynamic(() =>
  import("@/components/editor/MediaRaiSectionsEditorPanel").then((m) => ({ default: m.MediaRaiSectionsEditorPanel })),
);
const CompetitionEditorPanel = dynamic(() =>
  import("@/components/editor/CompetitionEditorPanel").then((m) => ({ default: m.CompetitionEditorPanel })),
);
const FemeninoEditorPanel = dynamic(() =>
  import("@/components/editor/FemeninoEditorPanel").then((m) => ({ default: m.FemeninoEditorPanel })),
);
const PublishFixturesBundleButton = dynamic(() =>
  import("@/components/editor/PublishFixturesBundleButton").then((m) => ({ default: m.PublishFixturesBundleButton })),
);
const EditorMobileMoreMenu = dynamic(() =>
  import("@/components/editor/EditorMobileMoreMenu").then((m) => ({ default: m.EditorMobileMoreMenu })),
);
const TeamsEditorPanel = dynamic(() =>
  import("@/components/editor/TeamsEditorPanel").then((m) => ({ default: m.TeamsEditorPanel })),
);

const LEGACY_STORAGE_KEY = "rai1903:inline-edits:v1";
const MODE_KEY = "rai1903:inline-edit-mode";
const TOOLBAR_COLLAPSED_KEY = "rai1903:editor-toolbar-collapsed";
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

function globalOverridesFromInitial(initial: InlineOverrides): InlineOverrides {
  const result: InlineOverrides = {};
  for (const [key, value] of Object.entries(initial)) {
    if (isMediaRaiGlobalInlineKey(key) || isHomeGlobalInlineKey(key)) {
      result[key] = value;
    }
  }
  return result;
}

export function InlineEditingProvider({
  children,
  initialOverrides = {},
}: {
  children: React.ReactNode;
  initialOverrides?: InlineOverrides;
}) {
  const seasonContext = useSeasonOptional();
  const viewedSeasonId = seasonContext?.viewedSeasonId ?? DEFAULT_COMPETITION_SEASON_ID;
  const activeSeasonId = seasonContext?.activeSeasonId ?? DEFAULT_COMPETITION_SEASON_ID;
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(configured);
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
      const result = await upsertInlineOverride(
        key,
        value,
        userIdRef.current,
        resolveInlineOverrideSeasonId(key, viewedSeasonId, activeSeasonId),
      );
      if (!result.ok) {
        setSyncError(result.error ?? "No se pudo guardar en Supabase");
        return false;
      }
      setSyncError(null);
      return true;
    },
    [configured, viewedSeasonId, activeSeasonId],
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
      const targetSeasonId = resolveInlineOverrideSeasonId(key, viewedSeasonId, activeSeasonId);
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
  }, [activeSeasonId, viewedSeasonId]);

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

    const legacy = readLegacyOverrides();
    const serverBaseline = mergeOverrideMaps(
      legacy,
      viewedSeasonId === activeSeasonId ? initialOverrides : globalOverridesFromInitial(initialOverrides),
    );
    queueMicrotask(() => {
      setOverrides((current) => (Object.keys(current).length ? current : serverBaseline));
      setReady(true);
    });

    void Promise.all([fetchInlineOverrides(viewedSeasonId), fetchMediaRaiInlineOverrides(), fetchHomeGlobalInlineOverrides()]).then(
      ([seasonResult, mediaRaiResult, homeGlobalResult]) => {
        setOverrides(
          mergeOverrideMaps(
            legacy,
            viewedSeasonId === activeSeasonId ? initialOverrides : globalOverridesFromInitial(initialOverrides),
            seasonResult.overrides,
            mediaRaiResult.overrides,
            homeGlobalResult.overrides,
          ),
        );
        const error = seasonResult.error ?? mediaRaiResult.error ?? homeGlobalResult.error;
        if (error) {
          setSyncError(`No se pudieron cargar cambios de Supabase: ${error}`);
        }
      },
    );
  }, [activeSeasonId, configured, initialOverrides, viewedSeasonId]);

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
        void deleteInlineOverride(key, resolveInlineOverrideSeasonId(key, viewedSeasonId, activeSeasonId)).then((result) => {
          if (!result.ok) setSyncError(result.error ?? "No se pudo borrar en Supabase");
          else setSyncError(null);
        });
      }
    },
    [configured, viewedSeasonId, activeSeasonId],
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
      void clearInlineOverrides(viewedSeasonId).then((result) => {
        if (!result.ok) setSyncError(result.error ?? "No se pudo limpiar Supabase");
        else setSyncError(null);
      });
    }
  }, [configured, viewedSeasonId]);

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
    }),
    [
      canEdit,
      clearAll,
      clearValue,
      configured,
      editMode,
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
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-[#214C9B]/20 px-3 py-2 min-h-[44px] text-[11px] font-extrabold uppercase leading-none text-[#214C9B] hover:bg-blue-50 active:bg-blue-100 sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

const editorToolbarSaveButtonClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-2 min-h-[44px] text-[11px] font-extrabold uppercase leading-none text-emerald-800 hover:bg-emerald-100 active:bg-emerald-200 disabled:opacity-60 sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

const editorToolbarToggleClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full bg-[#214C9B] px-3 py-2 min-h-[44px] text-[11px] font-extrabold uppercase leading-none text-white shadow-lg shadow-blue-950/20 hover:bg-[#173a78] active:bg-[#0f2d5c] sm:min-h-0 sm:px-4 sm:text-xs";

const editorToolbarFemButtonClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-[#981915]/25 px-3 py-2 min-h-[44px] text-[11px] font-extrabold uppercase leading-none text-[#981915] hover:bg-red-50 active:bg-red-100 sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

export function InlineEditingToolbar() {
  const seasonContext = useSeasonOptional();
  const marketEdit = useTransferMarketEditOptional();
  const { canEdit, editMode, ready, localOnly, syncError, cloudSaving, saveNow, setEditMode } =
    useInlineEditing();
  const seasonLabel = seasonContext?.viewedSeason.label;
  const isArchive = seasonContext?.isViewingArchive;
  const [saveAck, setSaveAck] = useState(false);
  const [seasonPanelOpen, setSeasonPanelOpen] = useState(false);
  const [crestPanelOpen, setCrestPanelOpen] = useState(false);
  const [homePanelOpen, setHomePanelOpen] = useState(false);
  const [mediaRaiPanelOpen, setMediaRaiPanelOpen] = useState(false);
  const [competitionPanelOpen, setCompetitionPanelOpen] = useState(false);
  const [femeninoPanelOpen, setFemeninoPanelOpen] = useState(false);
  const [teamsPanelOpen, setTeamsPanelOpen] = useState(false);
  const [sectionStatusPanelOpen, setSectionStatusPanelOpen] = useState(false);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const pathname = usePathname();
  const toolbarScrollRef = useRef<HTMLDivElement>(null);
  const scrollHint = useHorizontalScrollHint(
    toolbarScrollRef,
    editMode && !toolbarCollapsed,
    pathname,
  );

  useEffect(() => {
    queueMicrotask(() => {
      setToolbarCollapsed(window.localStorage.getItem(TOOLBAR_COLLAPSED_KEY) === "1");
    });
  }, []);

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
    setFemeninoPanelOpen(false);
    setTeamsPanelOpen(false);
    setSectionStatusPanelOpen(false);
    setMobileMoreOpen(false);
  }, []);

  const setToolbarCollapsedPersisted = useCallback(
    (collapsed: boolean) => {
      setToolbarCollapsed(collapsed);
      if (collapsed) closeEditorPanels();
      window.localStorage.setItem(TOOLBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    },
    [closeEditorPanels],
  );

  if (!ready || !canEdit) return null;

  const marketDraftPending = Boolean(marketEdit?.hasDraft);
  const marketBusy = Boolean(marketEdit?.busy);
  const marketMessage = marketEdit?.message ?? null;

  const statusLabel = syncError
    ? syncError
    : marketMessage && (marketMessage.includes("Error") || marketMessage.includes("Selecciona") || marketMessage.includes("ya está"))
      ? marketMessage
      : localOnly
        ? "Solo en este navegador (sin Supabase)"
        : cloudSaving || marketBusy
          ? "Guardando en Supabase…"
          : saveAck
            ? marketMessage ?? "Cambios guardados en Supabase"
            : marketDraftPending
              ? isArchive
                ? `Editando archivo ${seasonLabel ?? ""}. Hay cambios en el mercado sin guardar.`
                : `Temporada ${seasonLabel ?? ""}. Hay cambios en el mercado sin guardar.`
              : isArchive
                ? `Editando archivo ${seasonLabel ?? ""}. Pulsa «Guardar en Supabase» para confirmar.`
                : `Temporada ${seasonLabel ?? ""}. Pulsa «Guardar en Supabase» para confirmar.`;

  const handleSaveNow = async () => {
    const inlineOk = await saveNow();
    const marketOk = marketEdit?.hasDraft ? await marketEdit.save() : true;
    if (inlineOk && marketOk) {
      setSaveAck(true);
      window.setTimeout(() => setSaveAck(false), 2500);
    }
  };

  return (
    <>
      {editMode && !toolbarCollapsed && seasonPanelOpen && (
        <SeasonManagerPanel onClose={() => setSeasonPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && crestPanelOpen && (
        <TeamCrestEditorPanel onClose={() => setCrestPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && homePanelOpen && (
        <HomeLayoutEditorPanel onClose={() => setHomePanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && mediaRaiPanelOpen && (
        <MediaRaiSectionsEditorPanel onClose={() => setMediaRaiPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && competitionPanelOpen && (
        <CompetitionEditorPanel onClose={() => setCompetitionPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && femeninoPanelOpen && (
        <FemeninoEditorPanel onClose={() => setFemeninoPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && teamsPanelOpen && (
        <TeamsEditorPanel onClose={() => setTeamsPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && sectionStatusPanelOpen && (
        <SectionStatusEditorPanel onClose={() => setSectionStatusPanelOpen(false)} />
      )}
      {editMode && !toolbarCollapsed && mobileMoreOpen && (
        <EditorMobileMoreMenu
          onClose={() => setMobileMoreOpen(false)}
          closeEditorPanels={closeEditorPanels}
          onOpenPanel={(panel) => {
            if (panel === "sectionStatus") setSectionStatusPanelOpen(true);
            if (panel === "femenino") setFemeninoPanelOpen(true);
            if (panel === "teams") setTeamsPanelOpen(true);
            if (panel === "home") setHomePanelOpen(true);
            if (panel === "mediaRai") setMediaRaiPanelOpen(true);
          }}
        />
      )}
      <div className="fixed bottom-0 left-0 right-0 z-[80] flex flex-col items-stretch gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-[calc(100vw-2rem)] sm:items-end sm:px-0 sm:pb-0 sm:pt-0">
        {editMode && !toolbarCollapsed && (
          <div
            className={`rounded-2xl border bg-white/95 p-2.5 text-xs font-bold shadow-xl backdrop-blur sm:max-w-xs ${
              syncError ? "border-[#981915]/30 text-[#981915]" : "border-[#214C9B]/20 text-slate-600"
            }`}
          >
            <p className="line-clamp-3 sm:line-clamp-none">{statusLabel}</p>
          </div>
        )}
      <div className="relative min-w-0 sm:max-w-[calc(100vw-2rem)]">
        {editMode && !toolbarCollapsed && scrollHint.right && (
          <p
            className="pointer-events-none absolute -top-5 right-14 z-10 flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]/80"
            aria-hidden
          >
            Desliza
            <ChevronRight size={12} className="animate-pulse" aria-hidden />
          </p>
        )}
        {editMode && !toolbarCollapsed && scrollHint.left && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 rounded-l-full bg-gradient-to-r from-white/95 to-transparent"
            aria-hidden
          />
        )}
        {editMode && !toolbarCollapsed && scrollHint.right && (
          <div
            className="pointer-events-none absolute inset-y-0 right-24 z-10 w-8 rounded-r-full bg-gradient-to-l from-white/95 to-transparent"
            aria-hidden
          />
        )}
        {editMode ? (
          toolbarCollapsed ? (
            <div className="flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 bg-white/95 p-1.5 shadow-2xl backdrop-blur">
              <span className="inline-flex shrink-0 items-center gap-1 px-2 text-[11px] font-extrabold uppercase leading-none text-[#214C9B] sm:text-xs">
                <Pencil size={13} aria-hidden />
                Editando
              </span>
              {!localOnly && (
                <button
                  type="button"
                  onClick={() => void handleSaveNow()}
                  disabled={cloudSaving || marketBusy}
                  className={editorToolbarSaveButtonClass}
                >
                  <CloudUpload size={13} />
                  {cloudSaving || marketBusy ? "…" : saveAck ? "OK" : "Guardar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setToolbarCollapsedPersisted(false)}
                className={editorToolbarButtonClass}
                aria-expanded={false}
              >
                <ChevronUp size={13} aria-hidden />
                Mostrar
              </button>
              <button type="button" onClick={() => setEditMode(false)} className={editorToolbarToggleClass}>
                <X size={13} />
                Salir
              </button>
            </div>
          ) : (
          <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-[#214C9B]/20 bg-white/95 p-1.5 shadow-2xl backdrop-blur">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:hidden">
              {!localOnly && (
                <button
                  type="button"
                  onClick={() => void handleSaveNow()}
                  disabled={cloudSaving || marketBusy}
                  className={editorToolbarSaveButtonClass}
                >
                  <CloudUpload size={13} />
                  {cloudSaving || marketBusy ? "…" : saveAck ? "OK" : "Guardar"}
                </button>
              )}
              {isJornadasPath(pathname) && <PublishFixturesBundleButton />}
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
                  setMobileMoreOpen((open) => !open);
                }}
                className={editorToolbarButtonClass}
                aria-expanded={mobileMoreOpen}
              >
                Más
              </button>
            </div>
            <div
              ref={toolbarScrollRef}
              onWheel={handleToolbarWheel}
              className="no-scrollbar hidden min-w-0 flex-1 touch-pan-x flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain sm:flex"
            >
                {!localOnly && (
                  <button
                    type="button"
                    onClick={() => void handleSaveNow()}
                    disabled={cloudSaving || marketBusy}
                    className={editorToolbarSaveButtonClass}
                  >
                    <CloudUpload size={13} />
                    {cloudSaving || marketBusy ? "Guardando…" : saveAck ? "Guardado" : "Guardar"}
                  </button>
                )}
                {isJornadasPath(pathname) && <PublishFixturesBundleButton />}
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
                <button
                  type="button"
                  onClick={() => {
                    closeEditorPanels();
                    setSectionStatusPanelOpen((open) => !open);
                  }}
                  className={editorToolbarButtonClass}
                >
                  Secciones
                </button>
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
                    setFemeninoPanelOpen((open) => !open);
                  }}
                  className={editorToolbarFemButtonClass}
                >
                  Femenino
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
            </div>
            <button
              type="button"
              onClick={() => setToolbarCollapsedPersisted(true)}
              className={editorToolbarButtonClass}
              aria-expanded
            >
              <ChevronDown size={13} aria-hidden />
              Ocultar
            </button>
            <button type="button" onClick={() => setEditMode(false)} className={editorToolbarToggleClass}>
              <X size={13} />
              Salir
            </button>
          </div>
          )
        ) : (
          <button type="button" onClick={() => setEditMode(true)} className={editorToolbarToggleClass}>
            <Pencil size={13} />
            Editar
          </button>
        )}
        {editMode && !toolbarCollapsed && scrollHint.right && (
          <span className="sr-only">Desliza horizontalmente para ver más opciones del editor</span>
        )}
      </div>
    </div>
    </>
  );
}

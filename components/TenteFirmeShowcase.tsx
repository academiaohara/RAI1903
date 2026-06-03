"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { TenteFirmeSpaceCard } from "@/components/TenteFirmeSpaceCard";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { deleteMediaRaiSpaceOverrides } from "@/lib/cms/inline-overrides";
import {
  collectMediaRaiSpaces,
  isDefaultFanSpaceName,
  mediaRaiSpacesStorageKey,
  newFanSpace,
  sortFanSpacesByDate,
} from "@/lib/fan-spaces";
import type { FanMediaLink, FanYouTubeVideo } from "@/types";

type TenteFirmeShowcaseProps = {
  section: string;
  spaces: FanMediaLink[];
  videos?: FanYouTubeVideo[];
};

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm outline-none focus:border-[#214C9B]";

export function TenteFirmeShowcase({ section, spaces, videos = [] }: TenteFirmeShowcaseProps) {
  const { editMode, getValue, saveValue, clearValue, overrides } = useInlineEditing();
  const storageKey = mediaRaiSpacesStorageKey(section);

  const collected = collectMediaRaiSpaces(section, overrides, spaces);
  const hasCustomList = collected.hasCustomList || overrides[storageKey] !== undefined;
  const currentSpaces =
    (overrides[storageKey] as FanMediaLink[] | undefined) ?? getValue(storageKey, collected.spaces);
  const sortedSpaces = sortFanSpacesByDate(currentSpaces);

  const showSpaces = sortedSpaces.length > 0 || editMode;
  const showYoutube = videos.length > 0 || editMode;

  const restoreDefaultSpaces = useCallback(() => {
    clearValue(storageKey);
    void deleteMediaRaiSpaceOverrides(section);
  }, [clearValue, section, storageKey]);

  const updateSpaces = (next: FanMediaLink[]) => {
    saveValue(storageKey, next);
  };

  const updateSpace = (id: string, patch: Partial<FanMediaLink>) => {
    updateSpaces(currentSpaces.map((space) => (space.id === id ? { ...space, ...patch } : space)));
  };

  const removeSpace = (id: string) => {
    updateSpaces(currentSpaces.filter((space) => space.id !== id));
  };

  const fetchSpaceTitle = async (spaceId: string, url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    try {
      const response = await fetch("/api/url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = (await response.json()) as { title?: string | null; error?: string };
      if (!response.ok || !data.title) return;

      const latestSpaces = getValue(storageKey, spaces);
      const space = latestSpaces.find((item) => item.id === spaceId);
      if (!space || space.url.trim() !== trimmedUrl || !isDefaultFanSpaceName(space.name)) return;

      saveValue(
        storageKey,
        latestSpaces.map((item) => (item.id === spaceId ? { ...item, name: data.title! } : item)),
      );
    } catch {
      // Sin título automático si falla la red o X.
    }
  };

  const handleUrlChange = (space: FanMediaLink, url: string) => {
    updateSpace(space.id, { url });
    if (isDefaultFanSpaceName(space.name)) {
      void fetchSpaceTitle(space.id, url);
    }
  };

  const addSpace = () => {
    updateSpaces([newFanSpace(section), ...currentSpaces]);
  };

  if (!showSpaces && !showYoutube) return null;

  return (
    <div className="space-y-10">
      {showSpaces && (
        <section className="space-y-5 overflow-visible">
          <p className="text-sm font-bold uppercase text-[#214C9B]">X Spaces</p>

          {editMode && (
            <div className="space-y-4 rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-slate-600">Modo edición de espacios</p>
                <div className="flex flex-wrap gap-2">
                  {hasCustomList && (
                    <button
                      type="button"
                      onClick={restoreDefaultSpaces}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
                    >
                      Restaurar lista por defecto
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addSpace}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
                  >
                    <Plus size={14} aria-hidden />
                    Añadir nuevo espacio
                  </button>
                </div>
              </div>

              {sortedSpaces.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No hay espacios. Pulsa «Añadir nuevo espacio» para crear uno.
                </p>
              ) : (
                <ol className="space-y-3">
                  {sortedSpaces.map((space) => (
                    <li
                      key={space.id}
                      className="grid gap-2 rounded-xl border border-[#214C9B]/15 bg-white p-3 sm:grid-cols-[7rem_1fr_1fr_auto]"
                    >
                      <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
                        Fecha
                        <input
                          type="text"
                          value={space.date ?? ""}
                          onChange={(event) => updateSpace(space.id, { date: event.target.value })}
                          placeholder="DD/MM/AAAA"
                          aria-label="Fecha del espacio"
                          className={fieldClassName}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-bold uppercase text-slate-500 sm:col-span-1">
                        Título
                        <input
                          type="text"
                          value={space.name}
                          onChange={(event) => updateSpace(space.id, { name: event.target.value })}
                          aria-label="Título del espacio"
                          className={fieldClassName}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
                        URL X Spaces
                        <input
                          type="url"
                          value={space.url}
                          onChange={(event) => handleUrlChange(space, event.target.value)}
                          placeholder="https://x.com/i/spaces/..."
                          aria-label="URL del espacio de X"
                          className={fieldClassName}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSpace(space.id)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 sm:self-center"
                        aria-label="Eliminar espacio"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                      <label className="grid gap-1 text-xs font-bold uppercase text-slate-500 sm:col-span-4">
                        Descripción
                        <textarea
                          value={space.description}
                          onChange={(event) => updateSpace(space.id, { description: event.target.value })}
                          rows={2}
                          aria-label="Descripción del espacio"
                          className={fieldClassName}
                        />
                      </label>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {sortedSpaces.length > 0 && (
            <ul className="grid list-none grid-cols-1 gap-4 overflow-visible p-1 sm:grid-cols-2 lg:grid-cols-4">
              {sortedSpaces.map((link) => (
                <li key={link.id} className="min-h-0 overflow-visible">
                  <TenteFirmeSpaceCard link={link} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showYoutube && (
        <section className="space-y-5">
          <p className="text-sm font-bold uppercase text-[#214C9B]">YouTube</p>
          <ZonaMixtaVideoShowcase section={section} videos={videos} />
        </section>
      )}
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchVideoBlock } from "@/components/match-center/MatchVideoBlock";
import { youtubeVideoId } from "@/lib/youtube";
import type { MatchVideo } from "@/types";

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-3 py-2 text-sm outline-none focus:border-[#214C9B]";

type MatchVideoField = "rdpPrevia" | "rdpPostpartido" | "resumenVideo";

function matchVideoStorageKey(matchId: string, field: MatchVideoField) {
  return `match:${matchId}:${field}`;
}

function emptyVideo(label: string): MatchVideo {
  return { id: "", title: "", url: "", label };
}

export function EditableMatchVideoBlock({
  matchId,
  field,
  videoLabel,
  fallback,
  emptyMessage,
}: {
  matchId: string;
  field: MatchVideoField;
  videoLabel: string;
  fallback: MatchVideo | null;
  emptyMessage?: string;
}) {
  const { editMode, getValue, saveValue, clearValue } = useInlineEditing();
  const storageKey = matchVideoStorageKey(matchId, field);
  const video = getValue(storageKey, fallback);
  const resolved = video && video.url.trim() ? { ...video, label: video.label || videoLabel } : null;
  const videoId = resolved ? youtubeVideoId(resolved.url) : null;

  const saveVideo = (patch: Partial<MatchVideo>) => {
    const base = getValue(storageKey, fallback) ?? emptyVideo(videoLabel);
    const next: MatchVideo = {
      ...base,
      ...patch,
      label: videoLabel,
      id: base.id || `${matchId}-${field}`,
    };
    if (!next.url.trim() && !next.title.trim()) {
      clearValue(storageKey);
      return;
    }
    saveValue(storageKey, next);
  };

  const clearVideo = () => {
    clearValue(storageKey);
  };

  const fetchTitle = async (url: string) => {
    const trimmedUrl = url.trim();
    if (!youtubeVideoId(trimmedUrl)) return;
    const current = getValue(storageKey, fallback);
    if (current?.title.trim()) return;

    try {
      const response = await fetch("/api/url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = (await response.json()) as { title?: string | null };
      if (!response.ok || !data.title) return;
      const latest = getValue(storageKey, fallback);
      if (!latest || latest.url.trim() !== trimmedUrl) return;
      saveValue(storageKey, { ...latest, label: videoLabel, title: data.title });
    } catch {
      // Sin título automático si falla la red.
    }
  };

  if (!editMode) {
    if (!resolved || !videoId) {
      return emptyMessage ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null;
    }
    return <MatchVideoBlock video={resolved} />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-slate-600">Vídeo · {videoLabel}</p>
          {(video?.url.trim() || getValue(storageKey, fallback)) && (
            <button
              type="button"
              onClick={clearVideo}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={14} aria-hidden />
              Quitar vídeo
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500 sm:col-span-2">
            URL de YouTube
            <input
              type="url"
              value={video?.url ?? ""}
              onChange={(event) => {
                const url = event.target.value;
                saveVideo({ url });
                if (!video?.title.trim()) void fetchTitle(url);
              }}
              placeholder="https://youtu.be/..."
              aria-label={`URL de YouTube (${videoLabel})`}
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-1 text-xs font-bold uppercase text-slate-500 sm:col-span-2">
            Título
            <input
              type="text"
              value={video?.title ?? ""}
              onChange={(event) => saveVideo({ title: event.target.value })}
              placeholder="Título del vídeo"
              aria-label={`Título (${videoLabel})`}
              className={fieldClassName}
            />
          </label>
        </div>
      </div>

      {videoId && resolved ? (
        <MatchVideoBlock video={resolved} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-dashed border-[#214C9B]/25 bg-slate-900/90 shadow-[0_16px_40px_rgba(17,24,39,0.12)]">
          <div className="flex aspect-video w-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-400">
            Pega una URL de YouTube válida para previsualizar el vídeo.
          </div>
        </div>
      )}
    </div>
  );
}

export { matchVideoStorageKey };

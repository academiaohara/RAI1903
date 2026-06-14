"use client";

import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSeasonOptional } from "@/components/season/SeasonProvider";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { deleteMediaRaiVideoOverrides } from "@/lib/cms/inline-overrides";
import {
  collectMediaRaiVideos,
  fanVideosStorageKey,
  isDefaultFanVideoTitle,
  isLegacyMediaRaiVideoKey,
  newFanVideo,
  sortFanVideosByDate,
} from "@/lib/fan-videos";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { scrollElementHorizontally } from "@/lib/scroll-horizontal";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import { youtubeEmbedUrl, youtubeThumbnailUrl, youtubeVideoId } from "@/lib/youtube";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { FanYouTubeVideo } from "@/types";

type ZonaMixtaVideoShowcaseProps = {
  section: string;
  videos: FanYouTubeVideo[];
  /** Alcance por equipo en crónicas (masculino/femenino); omitir en Media RAI global. */
  gender?: PrimerEquipoGender;
  featuredLabel?: string;
  carouselLabel?: string;
};

function resolveVideo(video: FanYouTubeVideo) {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;
  return { ...video, videoId };
}

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm outline-none focus:border-[#214C9B]";

type ResolvedFanVideo = NonNullable<ReturnType<typeof resolveVideo>>;

function ZonaMixtaVideoPlayer({
  resolved,
  featuredLabel,
  carouselLabel,
}: {
  resolved: ResolvedFanVideo[];
  featuredLabel: string;
  carouselLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailTrackRef = useRef<HTMLDivElement>(null);
  const { onWheel: handleWheel } = useHorizontalWheelScroll();

  const videoCount = resolved.length;
  const activeVideo = resolved[activeIndex] ?? resolved[0];

  const scrollThumbnailIntoView = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = thumbnailTrackRef.current;
    if (!track) return;

    const slide = track.children[index];
    if (!(slide instanceof HTMLElement)) return;

    scrollElementHorizontally(track, slide, { behavior, align: "start" });
  }, []);

  const selectVideo = useCallback(
    (index: number) => {
      if (videoCount === 0) return;
      const nextIndex = ((index % videoCount) + videoCount) % videoCount;
      setActiveIndex(nextIndex);
      scrollThumbnailIntoView(nextIndex);
    },
    [scrollThumbnailIntoView, videoCount],
  );

  const goPrev = useCallback(() => {
    if (videoCount <= 1) return;
    selectVideo(activeIndex - 1);
  }, [activeIndex, selectVideo, videoCount]);

  const goNext = useCallback(() => {
    if (videoCount <= 1) return;
    selectVideo(activeIndex + 1);
  }, [activeIndex, selectVideo, videoCount]);

  const playerLabel = activeIndex === 0 ? featuredLabel : carouselLabel;

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[#214C9B]/25 bg-black shadow-[0_16px_40px_rgba(17,24,39,0.12)]">
        <div className="aspect-video w-full">
          <iframe
            key={activeVideo.videoId}
            src={`${youtubeEmbedUrl(activeVideo.videoId)}?rel=0`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="border-t border-white/10 bg-[#0f1f3d] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{playerLabel}</p>
          {activeVideo.date && (
            <time dateTime={activeVideo.date} className="mt-1 block text-xs font-semibold text-white/70">
              {activeVideo.date}
            </time>
          )}
          <h3 className="mt-1 text-lg font-extrabold uppercase text-white sm:text-xl">{activeVideo.title}</h3>
        </div>
      </div>

      {videoCount > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase text-[#214C9B]">{carouselLabel}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                aria-label="Episodio anterior"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <span className="min-w-[3.5rem] text-center text-xs font-bold tabular-nums text-slate-500">
                {activeIndex + 1} / {videoCount}
              </span>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                aria-label="Episodio siguiente"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div
            ref={thumbnailTrackRef}
            onWheel={handleWheel}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1"
          >
            {resolved.map((video, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => selectVideo(index)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Reproducir ${video.title}`}
                  className={`w-[min(100%,220px)] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition ${
                    isActive
                      ? "border-[#214C9B] ring-2 ring-[#214C9B]/25"
                      : "border-[#214C9B]/20 hover:border-[#214C9B]/45"
                  }`}
                >
                  <div
                    className="aspect-video w-full bg-black bg-cover bg-center"
                    style={{ backgroundImage: `url(${youtubeThumbnailUrl(video.videoId)})` }}
                    role="img"
                    aria-hidden
                  />
                  <div className="px-3 py-2.5">
                    {video.date && (
                      <time dateTime={video.date} className="text-[10px] font-bold uppercase text-[#981915]">
                        {video.date}
                      </time>
                    )}
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-[#214C9B]">{video.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export function ZonaMixtaVideoShowcase({
  section,
  videos,
  gender,
  featuredLabel = "Último episodio",
  carouselLabel = "Más episodios",
}: ZonaMixtaVideoShowcaseProps) {
  const seasonContext = useSeasonOptional();
  const seasonId = seasonContext?.viewedSeasonId ?? DEFAULT_COMPETITION_SEASON_ID;
  const isGlobalMediaRai = !gender;
  const { editMode, getValue, saveValue, clearValue, overrides } = useInlineEditing();
  const storageKey = fanVideosStorageKey(section, seasonId, gender);

  const collected = isGlobalMediaRai ? collectMediaRaiVideos(section, overrides, videos) : null;
  const hasCustomList = isGlobalMediaRai
    ? collected!.hasCustomList || overrides[storageKey] !== undefined
    : overrides[storageKey] !== undefined;

  const currentVideos = isGlobalMediaRai
    ? ((overrides[storageKey] as FanYouTubeVideo[] | undefined) ?? collected!.videos)
    : getValue(storageKey, videos);

  const restoreDefaultVideos = useCallback(() => {
    if (isGlobalMediaRai) {
      clearValue(storageKey);
      for (const key of Object.keys(overrides)) {
        if (isLegacyMediaRaiVideoKey(key, section)) clearValue(key);
      }
      void deleteMediaRaiVideoOverrides(section);
      return;
    }
    clearValue(storageKey);
  }, [clearValue, isGlobalMediaRai, overrides, section, storageKey]);
  const sorted = sortFanVideosByDate(currentVideos);
  const resolved = sorted.map(resolveVideo).filter((video): video is NonNullable<typeof video> => video !== null);
  const unresolved = sorted.filter((video) => resolveVideo(video) === null);

  const updateVideos = (next: FanYouTubeVideo[]) => {
    saveValue(storageKey, next);
  };

  const updateVideo = (id: string, patch: Partial<FanYouTubeVideo>) => {
    updateVideos(currentVideos.map((video) => (video.id === id ? { ...video, ...patch } : video)));
  };

  const removeVideo = (id: string) => {
    updateVideos(currentVideos.filter((video) => video.id !== id));
  };

  const fetchVideoTitle = async (videoId: string, url: string) => {
    const trimmedUrl = url.trim();
    if (!youtubeVideoId(trimmedUrl)) return;

    try {
      const response = await fetch("/api/url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = (await response.json()) as { title?: string | null; error?: string };
      if (!response.ok || !data.title) return;

      const latestVideos = getValue(storageKey, videos);
      const video = latestVideos.find((item) => item.id === videoId);
      if (!video || video.url.trim() !== trimmedUrl || !isDefaultFanVideoTitle(video.title)) return;

      saveValue(
        storageKey,
        latestVideos.map((item) => (item.id === videoId ? { ...item, title: data.title! } : item)),
      );
    } catch {
      // Sin título automático si falla la red o YouTube.
    }
  };

  const handleUrlChange = (video: FanYouTubeVideo, url: string) => {
    updateVideo(video.id, { url });
    if (isDefaultFanVideoTitle(video.title)) {
      void fetchVideoTitle(video.id, url);
    }
  };

  const addVideo = () => {
    updateVideos([newFanVideo(section), ...currentVideos]);
  };

  if (currentVideos.length === 0 && !editMode) return null;

  const playlistKey = resolved.map((video) => video.id).join("|");

  return (
    <div className="space-y-5">
      {editMode && (
        <div className="space-y-4 rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-slate-600">Modo edición de vídeos</p>
            <div className="flex flex-wrap gap-2">
              {hasCustomList && (
                <button
                  type="button"
                  onClick={restoreDefaultVideos}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-50"
                >
                  Restaurar lista por defecto
                </button>
              )}
              <button
                type="button"
                onClick={addVideo}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
              >
                <Plus size={14} aria-hidden />
                Añadir nuevo vídeo
              </button>
            </div>
          </div>

          {sorted.length === 0 ? (
            <p className="text-sm text-slate-600">No hay vídeos. Pulsa «Añadir nuevo vídeo» para crear uno.</p>
          ) : (
            <ol className="space-y-3">
              {sorted.map((video) => (
                <li
                  key={video.id}
                  className="grid gap-2 rounded-xl border border-[#214C9B]/15 bg-white p-3 sm:grid-cols-[7rem_1fr_1fr_auto]"
                >
                  <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
                    Fecha
                    <input
                      type="text"
                      value={video.date ?? ""}
                      onChange={(event) => updateVideo(video.id, { date: event.target.value })}
                      placeholder="DD/MM/AAAA"
                      aria-label="Fecha del vídeo"
                      className={fieldClassName}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase text-slate-500 sm:col-span-1">
                    Título
                    <input
                      type="text"
                      value={video.title}
                      onChange={(event) => updateVideo(video.id, { title: event.target.value })}
                      aria-label="Título del vídeo"
                      className={fieldClassName}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">
                    URL YouTube
                    <input
                      type="url"
                      value={video.url}
                      onChange={(event) => handleUrlChange(video, event.target.value)}
                      placeholder="https://youtu.be/..."
                      aria-label="URL de YouTube"
                      className={fieldClassName}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeVideo(video.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 sm:self-center"
                    aria-label="Eliminar vídeo"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {resolved.length === 0 ? (
        editMode ? (
          <p className="text-sm text-slate-500">Añade una URL de YouTube válida para previsualizar el vídeo.</p>
        ) : unresolved.length > 0 ? (
          <ul className="space-y-3">
            {unresolved.map((video) => (
              <li
                key={video.id}
                className="rounded-2xl border border-[#214C9B]/20 bg-white px-4 py-3 shadow-sm"
              >
                {video.date && (
                  <time dateTime={video.date} className="text-xs font-bold uppercase text-[#981915]">
                    {video.date}
                  </time>
                )}
                <p className="text-sm font-bold text-[#214C9B]">{video.title}</p>
                {video.url.trim() ? (
                  <a
                    href={video.url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-[#214C9B] underline"
                  >
                    Abrir enlace del vídeo
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Falta la URL de YouTube.</p>
                )}
              </li>
            ))}
          </ul>
        ) : null
      ) : (
        <ZonaMixtaVideoPlayer
          key={playlistKey}
          resolved={resolved}
          featuredLabel={featuredLabel}
          carouselLabel={carouselLabel}
        />
      )}
    </div>
  );
}

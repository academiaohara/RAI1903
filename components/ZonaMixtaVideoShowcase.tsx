"use client";

import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { ContenidoFanSlug } from "@/lib/contenido-fan";
import {
  fanVideosStorageKey,
  isDefaultFanVideoTitle,
  newFanVideo,
  sortFanVideosByDate,
} from "@/lib/fan-videos";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { FanYouTubeVideo } from "@/types";

type ZonaMixtaVideoShowcaseProps = {
  section: ContenidoFanSlug;
  videos: FanYouTubeVideo[];
};

function resolveVideo(video: FanYouTubeVideo) {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;
  return { ...video, videoId };
}

const fieldClassName =
  "w-full rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm outline-none focus:border-[#214C9B]";

export function ZonaMixtaVideoShowcase({ section, videos }: ZonaMixtaVideoShowcaseProps) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const storageKey = fanVideosStorageKey(section);
  const currentVideos = getValue(storageKey, videos);
  const sorted = sortFanVideosByDate(currentVideos);
  const resolved = sorted.map(resolveVideo).filter((video): video is NonNullable<typeof video> => video !== null);
  const featured = resolved.length > 0 ? resolved[0] : null;
  const carouselItems = resolved.length > 1 ? resolved.slice(1) : [];
  const carouselCount = carouselItems.length;
  const { trackRef, goPrev, goNext } = useHorizontalCarousel(carouselCount);
  const { onWheel: handleWheel } = useHorizontalWheelScroll();

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

  return (
    <div className="space-y-5">
      {editMode && (
        <div className="space-y-4 rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-slate-600">Modo edición de vídeos</p>
            <button
              type="button"
              onClick={addVideo}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
            >
              <Plus size={14} aria-hidden />
              Añadir nuevo vídeo
            </button>
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

      {!featured ? (
        editMode ? (
          <p className="text-sm text-slate-500">Añade una URL de YouTube válida para previsualizar el vídeo.</p>
        ) : null
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-[#214C9B]/25 bg-black shadow-[0_16px_40px_rgba(17,24,39,0.12)]">
            <div className="aspect-video w-full">
              <iframe
                src={`${youtubeEmbedUrl(featured.videoId)}?rel=0`}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="border-t border-white/10 bg-[#0f1f3d] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">Último episodio</p>
              {featured.date && (
                <time dateTime={featured.date} className="mt-1 block text-xs font-semibold text-white/70">
                  {featured.date}
                </time>
              )}
              <h3 className="mt-1 text-lg font-extrabold uppercase text-white sm:text-xl">{featured.title}</h3>
            </div>
          </div>

          {carouselCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase text-[#214C9B]">Más episodios</p>
                {carouselCount > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                      aria-label="Episodio anterior"
                    >
                      <ChevronLeft size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                      aria-label="Episodio siguiente"
                    >
                      <ChevronRight size={18} aria-hidden />
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={trackRef}
                onWheel={handleWheel}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1"
              >
                {carouselItems.map((video) => (
                  <article
                    key={video.id}
                    className="w-[min(100%,380px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white shadow-sm"
                  >
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={`${youtubeEmbedUrl(video.videoId)}?rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    <div className="px-3 py-3">
                      {video.date && (
                        <time dateTime={video.date} className="text-xs font-bold uppercase text-[#981915]">
                          {video.date}
                        </time>
                      )}
                      <p className="text-sm font-bold leading-snug text-[#214C9B]">{video.title}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube";
import type { FanYouTubeVideo } from "@/types";

type ZonaMixtaVideoShowcaseProps = {
  videos: FanYouTubeVideo[];
};

function resolveVideo(video: FanYouTubeVideo) {
  const videoId = youtubeVideoId(video.url);
  if (!videoId) return null;
  return { ...video, videoId };
}

export function ZonaMixtaVideoShowcase({ videos }: ZonaMixtaVideoShowcaseProps) {
  const resolved = videos.map(resolveVideo).filter((video): video is NonNullable<typeof video> => video !== null);
  const featured = resolved.length > 0 ? resolved[resolved.length - 1] : null;
  const carouselItems = resolved.length > 0 ? resolved.slice(0, -1) : [];
  const carouselCount = carouselItems.length;
  const { trackRef, goPrev, goNext } = useHorizontalCarousel(carouselCount);
  const { onWheel: handleWheel } = useHorizontalWheelScroll();

  if (!featured) return null;

  return (
    <div className="space-y-5">
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
                <p className="px-3 py-3 text-sm font-bold leading-snug text-[#214C9B]">{video.title}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

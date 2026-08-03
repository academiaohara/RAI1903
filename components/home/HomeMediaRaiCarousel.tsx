"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import { mediaRaiSectionHref } from "@/lib/media-rai-sections";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import type { HomeMediaRaiVideo } from "@/lib/home-media-rai";

type HomeMediaRaiCarouselProps = {
  videos: HomeMediaRaiVideo[];
};

function HomeMediaRaiCard({ video }: { video: HomeMediaRaiVideo }) {
  return (
    <article className="group flex w-[min(100%,240px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white text-left shadow-sm transition hover:border-[#214C9B]/45 hover:shadow-md sm:w-[260px]">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block"
        aria-label={`Ver vídeo: ${video.title}`}
      >
        <div
          className="aspect-video w-full bg-black bg-cover bg-center"
          style={{ backgroundImage: `url(${youtubeThumbnailUrl(video.videoId)})` }}
          role="img"
          aria-hidden
        />
        <span className="pointer-events-none absolute inset-0 bg-[#214C9B]/0 transition group-hover:bg-[#214C9B]/10" />
      </a>
      <div className="flex min-h-0 flex-1 flex-col px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={mediaRaiSectionHref(video.sectionSlug) as Route}
            className="truncate text-[10px] font-bold uppercase text-[#981915] transition hover:text-[#214C9B]"
          >
            {video.sectionLabel}
          </Link>
          {video.date ? (
            <time dateTime={video.date} className="shrink-0 text-[10px] font-semibold uppercase text-slate-400">
              {video.date}
            </time>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-[#214C9B] sm:text-sm">{video.title}</p>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-semibold uppercase text-slate-400 transition hover:text-[#214C9B]"
        >
          Ver vídeo
          <ExternalLink size={10} aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function HomeMediaRaiCarousel({ videos }: HomeMediaRaiCarouselProps) {
  const { trackRef, activeIndex, goPrev, goNext } = useHorizontalCarousel(videos.length);
  const { onWheel: handleWheel } = useHorizontalWheelScroll();

  if (videos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-[#214C9B] sm:text-sm">Últimos vídeos</p>
        {videos.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Vídeo anterior"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <span className="min-w-[3.5rem] text-center text-xs font-bold tabular-nums text-slate-500">
              {activeIndex + 1} / {videos.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Vídeo siguiente"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={trackRef}
        onWheel={handleWheel}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1"
      >
        {videos.map((video) => (
          <HomeMediaRaiCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

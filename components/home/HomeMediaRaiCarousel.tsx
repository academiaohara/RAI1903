"use client";

import { ExternalLink, Mic2 } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useHorizontalWheelScroll,
  useHorizontalWheelScrollListener,
} from "@/lib/use-horizontal-wheel-scroll";
import { mediaRaiSectionHref } from "@/lib/media-rai-sections";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import type { HomeMediaRaiItem } from "@/lib/home-media-rai";

type HomeMediaRaiCarouselProps = {
  items: HomeMediaRaiItem[];
};

function HomeMediaRaiCard({ item }: { item: HomeMediaRaiItem }) {
  const actionLabel = item.kind === "space" ? "Escuchar espacio" : "Ver vídeo";

  return (
    <article className="news-ticker-item flex w-[min(72vw,260px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white shadow-sm sm:w-[min(82vw,320px)]">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`${actionLabel}: ${item.title}`}
      >
        {item.kind === "video" ? (
          <div
            className="aspect-video w-full bg-black bg-cover bg-center"
            style={{ backgroundImage: `url(${youtubeThumbnailUrl(item.videoId)})` }}
            role="img"
            aria-hidden
          />
        ) : (
          <div
            className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#0f1f3d] to-[#214C9B] bg-cover bg-center"
            style={item.avatarUrl ? { backgroundImage: `url(${item.avatarUrl})` } : undefined}
          >
            {!item.avatarUrl ? <Mic2 size={36} className="text-white/80" aria-hidden /> : null}
          </div>
        )}
      </a>
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={mediaRaiSectionHref(item.sectionSlug) as Route}
            className="news-ticker-source min-w-0 truncate text-[10px] font-bold uppercase text-[#981915] sm:text-xs"
          >
            {item.sectionLabel}
          </Link>
          {item.date ? (
            <time dateTime={item.date} className="news-ticker-date shrink-0 text-[10px] font-bold uppercase text-[#214C9B]/70 sm:text-xs">
              {item.date}
            </time>
          ) : null}
        </div>
        <h3 className="news-ticker-title mt-1 line-clamp-3 text-sm font-extrabold uppercase leading-snug text-[#214C9B]">
          {item.title}
        </h3>
        {item.kind === "space" && item.description ? (
          <p className="news-ticker-excerpt mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600 sm:mt-1.5 sm:text-xs sm:leading-5">
            {item.description}
          </p>
        ) : null}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-ticker-excerpt mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-semibold uppercase text-slate-400"
        >
          {actionLabel}
          <ExternalLink size={10} aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function HomeMediaRaiCarousel({ items }: HomeMediaRaiCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [manualScroll, setManualScroll] = useState(false);

  const useTicker = items.length > 1;
  const loop = useTicker ? [...items, ...items] : items;

  const getLoopWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track || !useTicker) return 0;
    return track.scrollWidth / 2;
  }, [useTicker]);

  const { onWheel: handleScrollWheel, smoothScroll } = useHorizontalWheelScroll({
    blockPageScroll: true,
    smooth: true,
    getLoopWidth: useTicker ? getLoopWidth : undefined,
  });

  const resetManualScroll = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!track) return;

    smoothScroll.cancel();
    if (container) {
      container.scrollLeft = 0;
    }

    track.style.animation = "";
    track.style.transform = "";
    track.style.animationPlayState = "";
    setManualScroll(false);
  }, [smoothScroll]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const track = trackRef.current;

      if (useTicker && !manualScroll && track) {
        event.preventDefault();

        const transform = window.getComputedStyle(track).transform;
        let currentX = 0;
        if (transform && transform !== "none") {
          currentX = new DOMMatrixReadOnly(transform).m41;
        }
        const loopWidth = track.scrollWidth / 2;
        let offset = Math.max(0, -currentX);
        if (loopWidth > 0) {
          offset %= loopWidth;
        }

        track.style.animation = "none";
        track.style.transform = "none";
        track.style.animationPlayState = "";

        const container = containerRef.current;
        if (container) {
          container.scrollLeft = offset;
          smoothScroll.syncTarget(container);
          if (event.deltaY !== 0) {
            smoothScroll.addDelta(container, event.deltaY);
          }
        }
        setManualScroll(true);
        return;
      }

      handleScrollWheel(event);
    },
    [handleScrollWheel, manualScroll, smoothScroll, useTicker],
  );

  useHorizontalWheelScrollListener(containerRef, handleWheel);

  useEffect(() => {
    if (!manualScroll || !useTicker) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const onScroll = () => {
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth <= 0) return;

      if (container.scrollLeft >= loopWidth) {
        container.scrollLeft -= loopWidth;
        smoothScroll.syncTarget(container);
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [manualScroll, smoothScroll, useTicker]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseLeave={manualScroll ? resetManualScroll : undefined}
      className={`py-1 no-scrollbar overflow-x-auto overscroll-x-contain overscroll-y-none${
        useTicker && !manualScroll ? " news-ticker" : ""
      }`}
    >
      <div
        ref={trackRef}
        className={`flex w-max gap-4${useTicker && !manualScroll ? " news-ticker-track" : ""}`}
      >
        {loop.map((item, index) => (
          <HomeMediaRaiCard key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

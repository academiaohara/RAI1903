"use client";

import { NewsMedia } from "@/components/NewsMedia";
import { sortNewsByDate } from "@/lib/noticias";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";
import { useCallback, useRef, useState, type WheelEvent } from "react";
import { flushSync } from "react-dom";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  const sorted = sortNewsByDate(items);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [manualScroll, setManualScroll] = useState(false);

  const useTicker = sorted.length > 1;
  const loop = useTicker ? [...sorted, ...sorted] : sorted;

  const handleScrollWheel = useHorizontalWheelScroll();

  const resetManualScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.animation = "";
    track.style.transform = "";
    track.style.animationPlayState = "";
    setManualScroll(false);
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const container = event.currentTarget;
      const track = trackRef.current;

      if (useTicker && !manualScroll && track) {
        event.preventDefault();

        const transform = window.getComputedStyle(track).transform;
        let currentX = 0;
        if (transform && transform !== "none") {
          currentX = new DOMMatrixReadOnly(transform).m41;
        }
        const nextOffset = Math.max(0, -currentX - event.deltaY);

        track.style.animation = "none";
        track.style.transform = "none";
        track.style.animationPlayState = "";

        flushSync(() => setManualScroll(true));
        container.scrollLeft = nextOffset;
        return;
      }

      handleScrollWheel(event);
    },
    [handleScrollWheel, manualScroll, useTicker],
  );

  if (sorted.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseLeave={manualScroll ? resetManualScroll : undefined}
      className={`py-1${
        useTicker
          ? manualScroll
            ? " no-scrollbar overflow-x-auto overscroll-x-contain"
            : " news-ticker overflow-hidden"
          : " no-scrollbar overflow-x-auto overscroll-x-contain"
      }`}
    >
      <div
        ref={trackRef}
        className={`flex w-max gap-4${useTicker && !manualScroll ? " news-ticker-track" : ""}`}
      >
        {loop.map((item, index) => (
          <a
            key={`${item.id}-${index}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="news-ticker-item w-[min(72vw,260px)] shrink-0 overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white shadow-sm sm:w-[min(82vw,320px)]"
          >
            <div className="overflow-hidden">
              <NewsMedia item={item} variant="ticker" />
            </div>
            <div className="px-3 pb-3 pt-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="news-ticker-date shrink-0 text-[10px] font-bold uppercase text-[#214C9B]/70 sm:text-xs">
                  {formatDate(item.date, { day: "numeric", month: "short" })}
                </p>
                <p className="news-ticker-source min-w-0 truncate text-right text-[10px] font-bold uppercase text-[#981915] sm:text-xs">
                  {item.source}
                </p>
              </div>
              <h3 className="news-ticker-title mt-1 line-clamp-3 text-sm font-extrabold uppercase leading-snug text-[#214C9B]">
                {item.title}
              </h3>
              {item.excerpt ? (
                <p className="news-ticker-excerpt mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600 sm:mt-1.5 sm:text-xs sm:leading-5">
                  {item.excerpt}
                </p>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

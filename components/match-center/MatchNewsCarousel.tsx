"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { NewsMedia } from "@/components/NewsMedia";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

type MatchNewsCarouselProps = {
  items: NewsItem[];
  title?: string;
};

export function MatchNewsCarousel({ items, title = "Noticias de prensa" }: MatchNewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track || items.length === 0) return;
      const wrapped = ((next % items.length) + items.length) % items.length;
      const slide = track.children[wrapped] as HTMLElement | undefined;
      if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      setIndex(wrapped);
    },
    [items.length],
  );

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">{title}</h3>
        {items.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollToIndex(index - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Noticia anterior"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(index + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Noticia siguiente"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        )}
      </div>

      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="w-[min(100%,320px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white shadow-sm transition hover:border-[#214C9B]"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <NewsMedia item={item} variant="ticker" />
            </div>
            <div className="space-y-1 p-3">
              <p className="text-[10px] font-bold uppercase text-[#981915]">
                {item.source} · {formatDate(item.date, { day: "numeric", month: "short" })}
              </p>
              <p className="line-clamp-3 text-sm font-extrabold leading-snug text-[#214C9B]">{item.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

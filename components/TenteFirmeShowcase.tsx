"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { TenteFirmeSpaceCard } from "@/components/TenteFirmeSpaceCard";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import type { FanMediaLink, FanYouTubeVideo } from "@/types";

type TenteFirmeShowcaseProps = {
  spaces: FanMediaLink[];
  videos?: FanYouTubeVideo[];
};

export function TenteFirmeShowcase({ spaces, videos = [] }: TenteFirmeShowcaseProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleWheel = useHorizontalWheelScroll();

  const carouselItems = spaces;
  const carouselCount = carouselItems.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || carouselCount === 0) return;

      const nextIndex = ((index % carouselCount) + carouselCount) % carouselCount;
      const slide = track.children[nextIndex] as HTMLElement | undefined;
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      }
      setCarouselIndex(nextIndex);
    },
    [carouselCount],
  );

  if (carouselCount === 0 && videos.length === 0) return null;

  return (
    <div className="space-y-10">
      {carouselCount > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase text-[#214C9B]">X Spaces</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(carouselIndex - 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                aria-label="Espacio anterior"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(carouselIndex + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                aria-label="Espacio siguiente"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            onWheel={handleWheel}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1"
          >
            {carouselItems.map((link) => (
              <TenteFirmeSpaceCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="space-y-5">
          <p className="text-sm font-bold uppercase text-[#214C9B]">YouTube</p>
          <ZonaMixtaVideoShowcase videos={videos} />
        </section>
      )}
    </div>
  );
}

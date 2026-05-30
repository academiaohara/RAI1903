"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { TenteFirmeSpaceCard } from "@/components/TenteFirmeSpaceCard";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { useHorizontalCarousel } from "@/lib/use-horizontal-carousel";
import { useHorizontalWheelScroll } from "@/lib/use-horizontal-wheel-scroll";
import type { FanMediaLink, FanYouTubeVideo } from "@/types";

type TenteFirmeShowcaseProps = {
  spaces: FanMediaLink[];
  videos?: FanYouTubeVideo[];
};

export function TenteFirmeShowcase({ spaces, videos = [] }: TenteFirmeShowcaseProps) {
  const carouselItems = spaces;
  const carouselCount = carouselItems.length;
  const { trackRef, goPrev, goNext } = useHorizontalCarousel(carouselCount);
  const handleWheel = useHorizontalWheelScroll();

  if (carouselCount === 0 && videos.length === 0) return null;

  return (
    <div className="space-y-10">
      {carouselCount > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase text-[#214C9B]">X Spaces</p>
            {carouselCount > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                  aria-label="Espacio anterior"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                  aria-label="Espacio siguiente"
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

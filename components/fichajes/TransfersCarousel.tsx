"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { Route } from "next";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import type { TransferRumor } from "@/types";

type TransfersCarouselProps = {
  transfers: TransferRumor[];
};

export function TransfersCarousel({ transfers }: TransfersCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || transfers.length === 0) return;

      const nextIndex = ((index % transfers.length) + transfers.length) % transfers.length;
      const slide = track.children[nextIndex] as HTMLElement | undefined;
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      }
      setCarouselIndex(nextIndex);
    },
    [transfers.length],
  );

  if (transfers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase text-[#214C9B]">Mercado blanquiazul</p>
        <div className="flex items-center gap-2">
          <Link
            href={"/fichajes" as Route}
            className="hidden text-xs font-bold uppercase tracking-wide text-[#214C9B] transition hover:underline sm:inline"
          >
            Ver todos
          </Link>
          <button
            type="button"
            onClick={() => scrollToIndex(carouselIndex - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            aria-label="Fichaje anterior"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(carouselIndex + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            aria-label="Fichaje siguiente"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">
        {transfers.map((transfer, index) => (
          <TransferFichaCard key={transfer.id} transfer={transfer} index={index} />
        ))}
      </div>

      <Link href={"/fichajes" as Route} className="text-xs font-bold uppercase tracking-wide text-[#214C9B] transition hover:underline sm:hidden">
        Ver todos los fichajes
      </Link>
    </div>
  );
}

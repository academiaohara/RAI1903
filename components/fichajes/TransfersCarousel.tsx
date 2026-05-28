"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Route } from "next";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import type { TransferRumor } from "@/types";

type TransfersCarouselProps = {
  transfers: TransferRumor[];
};

export function TransfersCarousel({ transfers }: TransfersCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [tickerDuration, setTickerDuration] = useState("45s");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const useTicker = shouldScroll && !prefersReducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const measureOverflow = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || transfers.length === 0) return;

    const singleWidth =
      track.children.length > transfers.length ? track.scrollWidth / 2 : track.scrollWidth;
    const overflows = singleWidth > container.clientWidth + 1;

    setShouldScroll((prev) => (prev === overflows ? prev : overflows));
    if (overflows) {
      const seconds = Math.max(35, Math.round(singleWidth / 22));
      setTickerDuration(`${seconds}s`);
    }
  }, [transfers.length]);

  useEffect(() => {
    measureOverflow();
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(container);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measureOverflow, transfers, shouldScroll]);

  if (transfers.length === 0) return null;

  const loop = useTicker ? [...transfers, ...transfers] : transfers;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase text-[#214C9B]">Mercado blanquiazul</p>
        <Link
          href={"/fichajes" as Route}
          className="hidden text-xs font-bold uppercase tracking-wide text-[#981915] transition hover:underline sm:inline"
        >
          Ver todos
        </Link>
      </div>

      <div
        ref={containerRef}
        className={`transfers-ticker py-1 ${
          useTicker
            ? "overflow-hidden"
            : shouldScroll
              ? "no-scrollbar overflow-x-auto pb-1"
              : "flex justify-start pb-1"
        }`}
      >
        <div
          ref={trackRef}
          className={
            useTicker
              ? "transfers-ticker-track flex w-max gap-4"
              : `flex w-max gap-4${shouldScroll ? " snap-x snap-mandatory" : ""}`
          }
          style={
            useTicker
              ? ({ "--transfers-ticker-duration": tickerDuration } as CSSProperties)
              : undefined
          }
        >
          {loop.map((transfer, index) => (
            <TransferFichaCard
              key={`${transfer.id}-${index}`}
              transfer={transfer}
              index={index % transfers.length}
            />
          ))}
        </div>
      </div>

      <Link href={"/fichajes" as Route} className="text-xs font-bold uppercase tracking-wide text-[#981915] transition hover:underline sm:hidden">
        Ver todos los fichajes
      </Link>
    </div>
  );
}

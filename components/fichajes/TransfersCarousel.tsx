"use client";

import Link from "next/link";
import {
  useHorizontalWheelScroll,
  useHorizontalWheelScrollListener,
  useSmoothHorizontalWheelScroll,
} from "@/lib/use-horizontal-wheel-scroll";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Route } from "next";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import type { TransferRumor } from "@/types";

type TransferCarouselMode = "mercado" | "cesiones";

const MODE_OPTIONS = [
  { id: "mercado" as const, label: "Fichajes y renovaciones" },
  { id: "cesiones" as const, label: "Cesiones" },
];

type TransfersCarouselProps = {
  mercadoTransfers: TransferRumor[];
  loanTransfers: TransferRumor[];
};

export function TransfersCarousel({ mercadoTransfers, loanTransfers }: TransfersCarouselProps) {
  const hasMercado = mercadoTransfers.length > 0;
  const hasCesiones = loanTransfers.length > 0;

  const visibleModes = useMemo(
    () => MODE_OPTIONS.filter((option) => (option.id === "cesiones" ? hasCesiones : hasMercado)),
    [hasCesiones, hasMercado],
  );

  const [mode, setMode] = useState<TransferCarouselMode>("mercado");

  const activeMode = visibleModes.some((option) => option.id === mode)
    ? mode
    : (visibleModes[0]?.id ?? "mercado");

  const transfers = activeMode === "cesiones" ? loanTransfers : mercadoTransfers;
  const useTicker = transfers.length > 1;
  const loop = useTicker ? [...transfers, ...transfers] : transfers;

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [manualScroll, setManualScroll] = useState(false);

  const getLoopWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track || !useTicker) return 0;
    return track.scrollWidth / 2;
  }, [useTicker]);

  const handleScrollWheel = useHorizontalWheelScroll({
    blockPageScroll: true,
    smooth: true,
    getLoopWidth: useTicker ? getLoopWidth : undefined,
  });
  const smoothScroll = useSmoothHorizontalWheelScroll(useTicker ? getLoopWidth : undefined);

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

      const container = event.currentTarget as HTMLDivElement;
      const track = trackRef.current;

      if (useTicker && !manualScroll && track) {
        event.preventDefault();

        const transform = window.getComputedStyle(track).transform;
        let currentX = 0;
        if (transform && transform !== "none") {
          currentX = new DOMMatrixReadOnly(transform).m41;
        }
        const loopWidth = track.scrollWidth / 2;
        let nextOffset = Math.max(0, -currentX - event.deltaY);
        if (loopWidth > 0) {
          nextOffset %= loopWidth;
        }

        track.style.animation = "none";
        track.style.transform = "none";
        track.style.animationPlayState = "";

        flushSync(() => setManualScroll(true));
        smoothScroll.setOffset(container, nextOffset);
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

  const handleModeChange = useCallback(
    (nextMode: TransferCarouselMode) => {
      setMode(nextMode);
      resetManualScroll();
    },
    [resetManualScroll],
  );

  useEffect(() => {
    resetManualScroll();
  }, [activeMode, resetManualScroll]);

  if (!hasMercado && !hasCesiones) return null;
  if (transfers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold uppercase text-[#214C9B]">Mercado blanquiazul</p>
        <Link
          href={"/fichajes" as Route}
          className="hidden text-xs font-bold uppercase tracking-wide text-[#981915] transition hover:underline sm:inline"
        >
          Ver todos
        </Link>
      </div>

      {visibleModes.length > 1 && (
        <QuinielaViewToggle
          value={activeMode}
          onChange={handleModeChange}
          options={visibleModes}
          layoutId="transfers-carousel-mode"
        />
      )}

      <div
        ref={containerRef}
        onMouseLeave={manualScroll ? resetManualScroll : undefined}
        className={`py-1${
          useTicker
            ? manualScroll
              ? " no-scrollbar overflow-x-auto overscroll-x-contain overscroll-y-none"
              : " news-ticker overflow-hidden overscroll-y-none"
            : " no-scrollbar overflow-x-auto overscroll-x-contain overscroll-y-none"
        }`}
      >
        <div
          ref={trackRef}
          className={`flex w-max gap-4${useTicker && !manualScroll ? " news-ticker-track" : ""}`}
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

      <Link
        href={"/fichajes" as Route}
        className="text-xs font-bold uppercase tracking-wide text-[#981915] transition hover:underline sm:hidden"
      >
        Ver todos los fichajes
      </Link>
    </div>
  );
}

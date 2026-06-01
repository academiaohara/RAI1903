"use client";

import Link from "next/link";
import {
  useHorizontalWheelScroll,
  useHorizontalWheelScrollListener,
} from "@/lib/use-horizontal-wheel-scroll";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import {
  getAllCarouselTransfers,
  getCarouselTransfersByMode,
  getLoanTransfers,
  getRenewalCarouselTransfers,
  getSigningCarouselTransfers,
  type TransferCarouselMode,
} from "@/lib/fichajes";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Route } from "next";
import type { TransferMarketWindowId } from "@/types";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";

const MODE_OPTIONS = [
  { id: "todos" as const, label: "Todos" },
  { id: "fichajes" as const, label: "Fichajes" },
  { id: "renovaciones" as const, label: "Renovaciones" },
  { id: "cesiones" as const, label: "Cesiones" },
];

type TransfersCarouselProps = {
  marketWindowId: TransferMarketWindowId;
};

export function TransfersCarousel({ marketWindowId }: TransfersCarouselProps) {
  const transfersByMode = useMemo(
    () => ({
      todos: getAllCarouselTransfers(marketWindowId),
      fichajes: getSigningCarouselTransfers(marketWindowId),
      renovaciones: getRenewalCarouselTransfers(marketWindowId),
      cesiones: getLoanTransfers(marketWindowId),
    }),
    [marketWindowId],
  );

  const hasCarousel = transfersByMode.todos.length > 0;

  const [mode, setMode] = useState<TransferCarouselMode>("todos");

  const activeMode = mode;

  const transfers = getCarouselTransfersByMode(activeMode, marketWindowId);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [manualScroll, setManualScroll] = useState(false);

  const useTicker = transfers.length > 1 && hasOverflow;
  const loop = useTicker ? [...transfers, ...transfers] : transfers;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const measureOverflow = () => {
      if (transfers.length <= 1) {
        setHasOverflow(false);
        return;
      }

      const singleSetWidth = track.scrollWidth / (useTicker ? 2 : 1);
      setHasOverflow(singleSetWidth > container.clientWidth + 1);
    };

    measureOverflow();

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(container);
    observer.observe(track);

    return () => observer.disconnect();
  }, [transfers, useTicker]);

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

  const pendingManualWheelRef = useRef<{ offset: number; deltaY: number } | null>(null);

  const resetManualScroll = useCallback(() => {
    pendingManualWheelRef.current = null;
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
  }, [smoothScroll, setManualScroll]);

  useLayoutEffect(() => {
    const pending = pendingManualWheelRef.current;
    if (!manualScroll || !pending) return;

    const container = containerRef.current;
    if (!container) return;

    pendingManualWheelRef.current = null;
    const { offset, deltaY } = pending;

    container.scrollLeft = offset;
    smoothScroll.syncTarget(container);
    if (deltaY !== 0) {
      smoothScroll.addDelta(container, deltaY);
    }
  }, [manualScroll, smoothScroll]);

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

        pendingManualWheelRef.current = { offset, deltaY: event.deltaY };
        flushSync(() => setManualScroll(true));
        return;
      }

      handleScrollWheel(event);
    },
    [handleScrollWheel, manualScroll, useTicker, setManualScroll],
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
  }, [activeMode, marketWindowId, resetManualScroll]);

  if (!hasCarousel) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
        No hay movimientos oficiales en esta ventana de mercado.
      </p>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="space-y-4">
        <QuinielaViewToggle
          value={activeMode}
          onChange={handleModeChange}
          options={MODE_OPTIONS}
          layoutId="transfers-carousel-mode"
          className="text-[10px] sm:text-xs"
        />
        <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-bold text-slate-500">
          No hay movimientos en esta categoria para la ventana seleccionada.
        </p>
      </div>
    );
  }

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

      <QuinielaViewToggle
        value={activeMode}
        onChange={handleModeChange}
        options={MODE_OPTIONS}
        layoutId="transfers-carousel-mode"
        className="text-[10px] sm:text-xs"
      />

      <div
        ref={containerRef}
        onMouseLeave={manualScroll ? resetManualScroll : undefined}
        className={
          useTicker
            ? `py-1 no-scrollbar overflow-x-auto overscroll-x-contain overscroll-y-none${
                !manualScroll ? " news-ticker" : ""
              }`
            : "py-1"
        }
      >
        <div
          ref={trackRef}
          className={`flex gap-4${
            useTicker
              ? ` w-max${!manualScroll ? " news-ticker-track" : ""}`
              : " w-full justify-start"
          }`}
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

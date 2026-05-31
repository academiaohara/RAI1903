"use client";

import { scrollElementHorizontally } from "@/lib/scroll-horizontal";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";

const SCROLL_EDGE_EPSILON = 4;

function getMaxScroll(track: HTMLElement): number {
  return Math.max(0, track.scrollWidth - track.clientWidth);
}

function isScrollable(track: HTMLElement): boolean {
  return getMaxScroll(track) > SCROLL_EDGE_EPSILON;
}

/** Posición de scroll al alinear el slide al inicio (igual que scrollElementHorizontally). */
function getSlideScrollTarget(track: HTMLElement, slide: HTMLElement): number {
  return Math.min(slide.offsetLeft, getMaxScroll(track));
}

function getClosestSlideIndex(track: HTMLElement, itemCount: number): number {
  if (itemCount <= 0) return 0;
  if (itemCount === 1) return 0;

  const scrollLeft = track.scrollLeft;
  const maxScroll = getMaxScroll(track);

  if (!isScrollable(track)) return 0;

  if (scrollLeft <= SCROLL_EDGE_EPSILON) return 0;
  if (scrollLeft >= maxScroll - SCROLL_EDGE_EPSILON) return itemCount - 1;

  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < itemCount; i++) {
    const slide = track.children[i];
    if (!(slide instanceof HTMLElement)) continue;

    const target = getSlideScrollTarget(track, slide);
    const distance = Math.abs(target - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

type ScrollToIndexOptions = {
  behavior?: ScrollBehavior;
};

function lockProgrammaticScroll(
  track: HTMLElement,
  programmaticScrollRef: MutableRefObject<boolean>,
  behavior: ScrollBehavior,
) {
  programmaticScrollRef.current = true;

  const releaseProgrammatic = () => {
    programmaticScrollRef.current = false;
  };

  if ("onscrollend" in window) {
    const onScrollEnd = () => {
      track.removeEventListener("scrollend", onScrollEnd);
      releaseProgrammatic();
    };
    track.addEventListener("scrollend", onScrollEnd, { once: true });
  }

  window.setTimeout(releaseProgrammatic, behavior === "smooth" ? 700 : 80);
}

/** Carrusel horizontal con flechas: sincroniza el indice con el scroll y desplaza con scroll acotado. */
export function useHorizontalCarousel(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const programmaticScrollRef = useRef(false);

  const resolveCurrentIndex = useCallback(
    (track: HTMLElement) => {
      if (!isScrollable(track)) return activeIndexRef.current;
      return getClosestSlideIndex(track, itemCount);
    },
    [itemCount],
  );

  const syncIndexFromScroll = useCallback(() => {
    if (programmaticScrollRef.current) return;

    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    const closestIndex = isScrollable(track)
      ? getClosestSlideIndex(track, itemCount)
      : activeIndexRef.current;
    if (closestIndex !== activeIndexRef.current) {
      activeIndexRef.current = closestIndex;
      setActiveIndex(closestIndex);
    }
  }, [itemCount]);

  const scrollToIndex = useCallback(
    (index: number, options?: ScrollToIndexOptions) => {
      const track = trackRef.current;
      if (!track || itemCount === 0) return;

      const nextIndex = ((index % itemCount) + itemCount) % itemCount;
      const slide = track.children[nextIndex];
      if (!(slide instanceof HTMLElement)) return;

      const behavior = options?.behavior ?? "smooth";

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      if (!isScrollable(track)) {
        slide.scrollIntoView({ behavior, block: "nearest", inline: "start" });
        return;
      }

      lockProgrammaticScroll(track, programmaticScrollRef, behavior);

      if (nextIndex === itemCount - 1) {
        track.scrollTo({ left: getMaxScroll(track), behavior });
        return;
      }

      if (nextIndex === 0) {
        track.scrollTo({ left: 0, behavior });
        return;
      }

      scrollElementHorizontally(track, slide, { behavior, align: "start" });
    },
    [itemCount],
  );

  const goPrev = useCallback(() => {
    const track = trackRef.current;
    if (!track || itemCount <= 1) return;

    const current = resolveCurrentIndex(track);
    const atStart =
      current === 0 || (isScrollable(track) && track.scrollLeft <= SCROLL_EDGE_EPSILON);

    if (atStart) {
      scrollToIndex(itemCount - 1, { behavior: "auto" });
      return;
    }

    scrollToIndex(current - 1, { behavior: "smooth" });
  }, [itemCount, resolveCurrentIndex, scrollToIndex]);

  const goNext = useCallback(() => {
    const track = trackRef.current;
    if (!track || itemCount <= 1) return;

    const current = resolveCurrentIndex(track);
    const maxScroll = getMaxScroll(track);
    const atEnd =
      current === itemCount - 1 ||
      (isScrollable(track) && track.scrollLeft >= maxScroll - SCROLL_EDGE_EPSILON);

    if (atEnd) {
      scrollToIndex(0, { behavior: "auto" });
      return;
    }

    scrollToIndex(current + 1, { behavior: "smooth" });
  }, [itemCount, resolveCurrentIndex, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncIndexFromScroll);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [itemCount, syncIndexFromScroll]);

  useLayoutEffect(() => {
    activeIndexRef.current = 0;
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
  }, [itemCount]);

  return {
    trackRef,
    activeIndex,
    scrollToIndex,
    goPrev,
    goNext,
  };
}

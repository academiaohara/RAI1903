"use client";

import { scrollElementHorizontally } from "@/lib/scroll-horizontal";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function getClosestSlideIndex(track: HTMLElement, itemCount: number): number {
  const scrollLeft = track.scrollLeft;
  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < itemCount; i++) {
    const slide = track.children[i];
    if (!(slide instanceof HTMLElement)) continue;

    const distance = Math.abs(slide.offsetLeft - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/** Carrusel horizontal con flechas: sincroniza el indice con el scroll y desplaza con scroll acotado. */
export function useHorizontalCarousel(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const programmaticScrollRef = useRef(false);

  const syncIndexFromScroll = useCallback(() => {
    if (programmaticScrollRef.current) return;

    const track = trackRef.current;
    if (!track || itemCount === 0) return;

    const closestIndex = getClosestSlideIndex(track, itemCount);
    if (closestIndex !== activeIndexRef.current) {
      activeIndexRef.current = closestIndex;
      setActiveIndex(closestIndex);
    }
  }, [itemCount]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || itemCount === 0) return;

      const nextIndex = ((index % itemCount) + itemCount) % itemCount;
      const slide = track.children[nextIndex];
      if (!(slide instanceof HTMLElement)) return;

      programmaticScrollRef.current = true;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      scrollElementHorizontally(track, slide, { behavior: "smooth", align: "start" });

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
      window.setTimeout(releaseProgrammatic, 500);
    },
    [itemCount],
  );

  const goPrev = useCallback(() => {
    scrollToIndex(activeIndexRef.current - 1);
  }, [scrollToIndex]);

  const goNext = useCallback(() => {
    scrollToIndex(activeIndexRef.current + 1);
  }, [scrollToIndex]);

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

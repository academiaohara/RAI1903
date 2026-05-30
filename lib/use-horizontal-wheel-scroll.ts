import { useCallback, useEffect, useRef, type RefObject, type WheelEvent as ReactWheelEvent } from "react";

type HorizontalWheelScrollOptions = {
  /** Bloquea el scroll vertical de la página aunque no haya overflow horizontal. */
  blockPageScroll?: boolean;
  /** Aplica interpolación al desplazamiento horizontal (rueda). */
  smooth?: boolean;
};

function isVerticalWheelIntent(event: Pick<WheelEvent, "deltaX" | "deltaY">) {
  return Math.abs(event.deltaY) > Math.abs(event.deltaX);
}

function useSmoothHorizontalScroll() {
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const syncTarget = useCallback((element: HTMLElement) => {
    targetRef.current = element.scrollLeft;
  }, []);

  const animateToTarget = useCallback((element: HTMLElement) => {
    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    targetRef.current = Math.min(maxScroll, Math.max(0, targetRef.current));

    const step = () => {
      const diff = targetRef.current - element.scrollLeft;
      if (Math.abs(diff) < 0.75) {
        element.scrollLeft = targetRef.current;
        rafRef.current = null;
        return;
      }

      element.scrollLeft += diff * 0.2;
      rafRef.current = requestAnimationFrame(step);
    };

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(step);
    }
  }, []);

  const addDelta = useCallback(
    (element: HTMLElement, delta: number) => {
      if (rafRef.current === null) {
        targetRef.current = element.scrollLeft;
      }
      targetRef.current += delta;
      animateToTarget(element);
    },
    [animateToTarget],
  );

  const setOffset = useCallback(
    (element: HTMLElement, offset: number) => {
      targetRef.current = offset;
      animateToTarget(element);
    },
    [animateToTarget],
  );

  return { addDelta, setOffset, syncTarget, cancel };
}

/** Convierte el scroll vertical de la rueda en desplazamiento horizontal del contenedor. */
export function useHorizontalWheelScroll(options?: HorizontalWheelScrollOptions) {
  const smoothScroll = useSmoothHorizontalScroll();
  const blockPageScroll = options?.blockPageScroll ?? false;
  const smooth = options?.smooth ?? false;

  return useCallback(
    (event: ReactWheelEvent<HTMLDivElement> | WheelEvent) => {
      if (!isVerticalWheelIntent(event)) return;

      const list = event.currentTarget as HTMLDivElement;
      const hasOverflow = list.scrollWidth > list.clientWidth;

      if (!hasOverflow && !blockPageScroll) return;

      event.preventDefault();
      if (!hasOverflow) return;

      if (smooth) {
        smoothScroll.addDelta(list, event.deltaY);
        return;
      }

      list.scrollLeft += event.deltaY;
    },
    [blockPageScroll, smooth, smoothScroll],
  );
}

/** Registra wheel con `{ passive: false }` para que `preventDefault` bloquee el scroll de página. */
export function useHorizontalWheelScrollListener(
  ref: RefObject<HTMLElement | null>,
  handler: (event: WheelEvent) => void,
  enabled = true,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    element.addEventListener("wheel", handler, { passive: false });
    return () => element.removeEventListener("wheel", handler);
  }, [enabled, handler, ref]);
}

export function useSmoothHorizontalWheelScroll() {
  return useSmoothHorizontalScroll();
}

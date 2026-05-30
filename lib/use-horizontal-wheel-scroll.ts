import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";

type HorizontalWheelScrollOptions = {
  /** Bloquea el scroll vertical de la página aunque no haya overflow horizontal. */
  blockPageScroll?: boolean;
  /** Aplica interpolación al desplazamiento horizontal (rueda). */
  smooth?: boolean;
  /** Ancho de un ciclo para carruseles duplicados (scroll infinito). */
  getLoopWidth?: () => number;
};

function isVerticalWheelIntent(event: Pick<WheelEvent, "deltaX" | "deltaY">) {
  return Math.abs(event.deltaY) > Math.abs(event.deltaX);
}

function applyLoopScrollCorrection(
  element: HTMLElement,
  targetRef: MutableRefObject<number>,
  loopWidth: number,
) {
  if (loopWidth <= 0) return;

  while (element.scrollLeft >= loopWidth) {
    element.scrollLeft -= loopWidth;
    targetRef.current -= loopWidth;
  }

  while (element.scrollLeft < 0) {
    element.scrollLeft += loopWidth;
    targetRef.current += loopWidth;
  }
}

function useSmoothHorizontalScroll(getLoopWidth?: () => number) {
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

  const animateToTarget = useCallback(
    (element: HTMLElement) => {
      const loopWidth = getLoopWidth?.() ?? 0;
      const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);

      if (loopWidth <= 0) {
        targetRef.current = Math.min(maxScroll, Math.max(0, targetRef.current));
      }

      const step = () => {
        const diff = targetRef.current - element.scrollLeft;
        if (Math.abs(diff) < 0.75) {
          element.scrollLeft = targetRef.current;
          applyLoopScrollCorrection(element, targetRef, loopWidth);
          rafRef.current = null;
          return;
        }

        element.scrollLeft += diff * 0.2;
        applyLoopScrollCorrection(element, targetRef, loopWidth);
        rafRef.current = requestAnimationFrame(step);
      };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(step);
      }
    },
    [getLoopWidth],
  );

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
      const loopWidth = getLoopWidth?.() ?? 0;
      let next = Math.max(0, offset);
      if (loopWidth > 0) {
        next %= loopWidth;
      }
      targetRef.current = next;
      animateToTarget(element);
    },
    [animateToTarget, getLoopWidth],
  );

  return { addDelta, setOffset, syncTarget, cancel };
}

/** Convierte el scroll vertical de la rueda en desplazamiento horizontal del contenedor. */
export function useHorizontalWheelScroll(options?: HorizontalWheelScrollOptions) {
  const smoothScroll = useSmoothHorizontalScroll(options?.getLoopWidth);
  const blockPageScroll = options?.blockPageScroll ?? false;
  const smooth = options?.smooth ?? false;
  const getLoopWidth = options?.getLoopWidth;

  return useCallback(
    (event: ReactWheelEvent<HTMLDivElement> | WheelEvent) => {
      if (!isVerticalWheelIntent(event)) return;

      const list = event.currentTarget as HTMLDivElement;
      const loopWidth = getLoopWidth?.() ?? 0;
      const hasOverflow = list.scrollWidth > list.clientWidth;

      if (!hasOverflow && !blockPageScroll) return;

      event.preventDefault();
      if (!hasOverflow) return;

      if (smooth) {
        smoothScroll.addDelta(list, event.deltaY);
        return;
      }

      list.scrollLeft += event.deltaY;
      if (loopWidth > 0) {
        while (list.scrollLeft >= loopWidth) list.scrollLeft -= loopWidth;
        while (list.scrollLeft < 0) list.scrollLeft += loopWidth;
      }
    },
    [blockPageScroll, getLoopWidth, smooth, smoothScroll],
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

export function useSmoothHorizontalWheelScroll(getLoopWidth?: () => number) {
  return useSmoothHorizontalScroll(getLoopWidth);
}

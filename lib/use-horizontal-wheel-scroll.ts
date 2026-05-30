import { useCallback, type WheelEvent } from "react";

/** Convierte el scroll vertical de la rueda en desplazamiento horizontal del contenedor. */
export function useHorizontalWheelScroll() {
  return useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const list = event.currentTarget;
    if (list.scrollWidth <= list.clientWidth) return;

    event.preventDefault();
    list.scrollLeft += event.deltaY;
  }, []);
}

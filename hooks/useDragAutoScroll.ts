import { useEffect } from "react";

const EDGE_MARGIN_PX = 80;
const MAX_SCROLL_SPEED = 18;

function scrollForPointerY(clientY: number) {
  if (clientY < EDGE_MARGIN_PX) {
    const intensity = 1 - clientY / EDGE_MARGIN_PX;
    window.scrollBy({ top: -MAX_SCROLL_SPEED * intensity, behavior: "auto" });
    return;
  }

  const distanceFromBottom = window.innerHeight - clientY;
  if (distanceFromBottom < EDGE_MARGIN_PX) {
    const intensity = 1 - distanceFromBottom / EDGE_MARGIN_PX;
    window.scrollBy({ top: MAX_SCROLL_SPEED * intensity, behavior: "auto" });
  }
}

/** Scrolls the page while dragging near the top or bottom edge of the viewport. */
export function useDragAutoScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      scrollForPointerY(event.clientY);
    };

    const onPointerMove = (event: PointerEvent) => {
      scrollForPointerY(event.clientY);
    };

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("pointermove", onPointerMove);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, [active]);
}

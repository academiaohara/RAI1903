/** Centra o alinea un hijo dentro de un contenedor con overflow horizontal, sin mover el scroll de la pagina. */
export function scrollElementHorizontally(
  container: HTMLElement,
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; align?: "start" | "center" | "end" },
): void {
  const behavior = options?.behavior ?? "auto";
  const align = options?.align ?? "center";
  const elementLeft = element.offsetLeft;
  const elementWidth = element.offsetWidth;
  const containerWidth = container.clientWidth;
  const maxScroll = Math.max(0, container.scrollWidth - containerWidth);

  let targetLeft: number;
  switch (align) {
    case "start":
      targetLeft = elementLeft;
      break;
    case "end":
      targetLeft = elementLeft + elementWidth - containerWidth;
      break;
    case "center":
    default:
      targetLeft = elementLeft - (containerWidth - elementWidth) / 2;
  }

  container.scrollTo({
    left: Math.max(0, Math.min(targetLeft, maxScroll)),
    behavior,
  });
}

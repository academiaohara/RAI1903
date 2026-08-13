import { toPng } from "html-to-image";

const GAME_TICKET_EXPORT_WIDTH = 640;

export type GameTicketShareOptions = {
  node: HTMLElement;
  fileName: string;
  shareText: string;
};

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function captureGameTicket(node: HTMLElement): Promise<Blob> {
  await waitForImages(node);

  const previousStyles = {
    width: node.style.width,
    maxWidth: node.style.maxWidth,
    minWidth: node.style.minWidth,
  };

  node.style.width = `${GAME_TICKET_EXPORT_WIDTH}px`;
  node.style.maxWidth = `${GAME_TICKET_EXPORT_WIDTH}px`;
  node.style.minWidth = `${GAME_TICKET_EXPORT_WIDTH}px`;
  node.classList.add("game-ticket--capture");
  await waitForLayout();

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      width: node.offsetWidth,
      height: node.offsetHeight,
      backgroundColor: "#fdf9f1",
      onImageErrorHandler: () => undefined,
    });
    return await (await fetch(dataUrl)).blob();
  } finally {
    node.classList.remove("game-ticket--capture");
    node.style.width = previousStyles.width;
    node.style.maxWidth = previousStyles.maxWidth;
    node.style.minWidth = previousStyles.minWidth;
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function openXIntent(text: string) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function shareGameTicket({ node, fileName, shareText }: GameTicketShareOptions) {
  const blob = await captureGameTicket(node);
  const file = new File([blob], fileName, { type: "image/png" });
  const payload = { text: shareText, files: [file] };

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare(payload))
  ) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  downloadBlob(blob, fileName);
  openXIntent(`${shareText}\n\n(Adjunta la imagen que acabamos de descargar)`);
}

export async function shareGameTicketOnX(options: GameTicketShareOptions) {
  const blob = await captureGameTicket(options.node);
  downloadBlob(blob, options.fileName);
  openXIntent(`${options.shareText}\n\n(Adjunta la imagen que acabamos de descargar)`);
}

export async function downloadGameTicket(
  options: Pick<GameTicketShareOptions, "node" | "fileName">,
) {
  downloadBlob(await captureGameTicket(options.node), options.fileName);
}

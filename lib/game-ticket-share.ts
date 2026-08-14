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

async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.ready) return;
  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading failures and continue with capture.
  }
}

function prepareCaptureNode(node: HTMLElement): HTMLElement {
  const captureNode = node.cloneNode(true) as HTMLElement;
  captureNode.querySelectorAll('[data-ticket-export-hidden="true"]').forEach((element) => {
    element.remove();
  });
  return captureNode;
}

export async function captureGameTicket(node: HTMLElement): Promise<Blob> {
  await waitForImages(node);
  await waitForFonts();
  const captureRoot = document.createElement("div");
  const captureNode = prepareCaptureNode(node);
  const innerTicket = captureNode.querySelector(".game-ticket");
  innerTicket?.classList.add("game-ticket--capture");
  captureRoot.setAttribute("aria-hidden", "true");
  captureRoot.style.position = "fixed";
  captureRoot.style.left = "-10000px";
  captureRoot.style.top = "0";
  captureRoot.style.pointerEvents = "none";
  captureRoot.style.zIndex = "-1";
  captureRoot.appendChild(captureNode);
  document.body.appendChild(captureRoot);
  await waitForImages(captureNode);
  await waitForLayout();

  const exportWidth = Math.max(captureNode.scrollWidth, GAME_TICKET_EXPORT_WIDTH);
  captureRoot.style.width = `${exportWidth}px`;
  captureNode.style.width = `${exportWidth}px`;
  captureNode.style.maxWidth = `${exportWidth}px`;

  try {
    const dataUrl = await toPng(captureNode, {
      cacheBust: true,
      pixelRatio: 2,
      width: captureNode.offsetWidth,
      height: captureNode.offsetHeight,
      backgroundColor: "#f0ebe3",
      onImageErrorHandler: () => undefined,
    });
    return await (await fetch(dataUrl)).blob();
  } finally {
    captureRoot.remove();
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

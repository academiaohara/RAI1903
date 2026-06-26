import { toPng } from "html-to-image";

const LINEUP_EXPORT_WIDTH = 1148;
const LINEUP_EXPORT_HEIGHT = 1370;

type ShareLineupImageOptions = {
  node: HTMLElement;
  fileName: string;
  shareText: string;
};

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  );
}

export async function captureLineupImage(node: HTMLElement): Promise<Blob> {
  await waitForImages(node);

  const dataUrl = await toPng(node, {
    cacheBust: false,
    pixelRatio: 2,
    backgroundColor: "#e6e6e6",
    width: LINEUP_EXPORT_WIDTH,
    height: LINEUP_EXPORT_HEIGHT,
    onImageErrorHandler: () => undefined,
  });

  const response = await fetch(dataUrl);
  return response.blob();
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function openXShareIntent(text: string) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function shareLineupImage({ node, fileName, shareText }: ShareLineupImageOptions) {
  const blob = await captureLineupImage(node);
  const file = new File([blob], fileName, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share) {
    const payload = { text: shareText, files: [file] };
    if (!navigator.canShare || navigator.canShare(payload)) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
  }

  downloadBlob(blob, fileName);
  openXShareIntent(`${shareText}\n\n(Imagen descargada: adjúntala al tuit)`);
}

export async function shareLineupOnX({ node, fileName, shareText }: ShareLineupImageOptions) {
  const blob = await captureLineupImage(node);
  downloadBlob(blob, fileName);
  openXShareIntent(`${shareText}\n\n(Imagen descargada: adjúntala al tuit)`);
}

export async function downloadLineupImage({ node, fileName }: Pick<ShareLineupImageOptions, "node" | "fileName">) {
  const blob = await captureLineupImage(node);
  downloadBlob(blob, fileName);
}

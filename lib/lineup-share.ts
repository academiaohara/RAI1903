import { toPng } from "html-to-image";

type ShareLineupImageOptions = {
  node: HTMLElement;
  fileName: string;
  shareText: string;
};

async function captureLineupImage(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#e6e6e6",
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

function openTwitterIntent(text: string) {
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
  openTwitterIntent(`${shareText}\n\n(Imagen descargada: adjúntala al tuit)`);
}

import { isShareImageProxyAllowed } from "@/lib/share-image-proxy";

export function getShareImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("/")) return src;

  if (typeof window === "undefined") return src;

  try {
    const absolute = new URL(src, window.location.origin);
    if (absolute.origin === window.location.origin) return absolute.pathname + absolute.search;

    if (isShareImageProxyAllowed(absolute)) {
      return `/api/share-image?url=${encodeURIComponent(absolute.href)}`;
    }
  } catch {
    return src;
  }

  return src;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchImageBlob(src: string): Promise<Blob | null> {
  if (typeof window === "undefined") return null;

  try {
    const absolute = new URL(src, window.location.origin);
    const sameOrigin = absolute.origin === window.location.origin;
    const needsProxy = !sameOrigin && isShareImageProxyAllowed(absolute);
    const fetchUrl = needsProxy
      ? `/api/share-image?url=${encodeURIComponent(absolute.href)}`
      : sameOrigin
        ? absolute.href
        : null;

    if (!fetchUrl) return null;

    const response = await fetch(fetchUrl);
    if (!response.ok) return null;
    return response.blob();
  } catch {
    return null;
  }
}

function avatarFallbackInitial(img: HTMLImageElement): string {
  const handle =
    img.closest(".ranking-podium-slot-top")?.querySelector(".ranking-podium-handle")?.textContent?.trim() ??
    img.getAttribute("data-fallback-initial") ??
    "?";
  return handle.replace(/^@/, "").charAt(0).toUpperCase() || "?";
}

function replaceAvatarWithFallback(img: HTMLImageElement): void {
  const fallback = document.createElement("span");
  fallback.className = "ranking-podium-avatar-fallback";
  fallback.textContent = avatarFallbackInitial(img);
  img.replaceWith(fallback);
}

/** Convierte imágenes remotas a data URLs para capturas html-to-image sin CORS. */
export async function inlineImagesForCapture(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const rawSrc = img.getAttribute("src");
      if (!rawSrc || rawSrc.startsWith("data:")) return;

      const blob = await fetchImageBlob(rawSrc);
      if (!blob) {
        if (img.classList.contains("ranking-podium-avatar-image")) {
          replaceAvatarWithFallback(img);
        }
        return;
      }

      try {
        img.src = await blobToDataUrl(blob);
        img.removeAttribute("crossorigin");
      } catch {
        if (img.classList.contains("ranking-podium-avatar-image")) {
          replaceAvatarWithFallback(img);
        }
      }
    }),
  );
}

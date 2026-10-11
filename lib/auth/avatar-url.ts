import { parseShareImageProxyUrl } from "@/lib/share-image-proxy";

/** Normaliza URLs de avatar OAuth (p. ej. http → https). */
export function normalizeOAuthAvatarUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }
  return trimmed;
}

/**
 * URL lista para <img> / next/image: proxy same-origin para CDNs OAuth (X/twimg)
 * para evitar bloqueos por hotlink y funcionar en SSR y cliente.
 */
export function getAvatarImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;

  const normalized = normalizeOAuthAvatarUrl(src);
  if (normalized.startsWith("data:") || normalized.startsWith("/")) return normalized;

  const parsed = parseShareImageProxyUrl(normalized);
  if (parsed) {
    return `/api/share-image?url=${encodeURIComponent(parsed.href)}`;
  }

  return normalized;
}

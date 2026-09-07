const MAX_SHARE_IMAGE_BYTES = 5 * 1024 * 1024;

export function isShareImageProxyAllowed(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host.endsWith(".vercel.app")) return true;
  if (host.endsWith(".supabase.co")) return true;
  if (host.endsWith(".twimg.com")) return true;
  if (host === "lh3.googleusercontent.com") return true;

  return false;
}

export function parseShareImageProxyUrl(rawUrl: string): URL | null {
  try {
    const url = new URL(rawUrl);
    return isShareImageProxyAllowed(url) ? url : null;
  } catch {
    return null;
  }
}

export async function fetchShareImageBuffer(url: URL): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const headers: Record<string, string> = {
    Accept: "image/*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  };

  if (url.hostname.endsWith(".twimg.com")) {
    headers.Referer = "https://x.com/";
  }

  const response = await fetch(url.toString(), {
    headers,
    redirect: "follow",
  });

  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) return null;

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_SHARE_IMAGE_BYTES) return null;

  return { buffer, contentType };
}

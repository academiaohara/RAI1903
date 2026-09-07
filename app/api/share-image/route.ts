import { NextResponse } from "next/server";
import { fetchShareImageBuffer, parseShareImageProxyUrl } from "@/lib/share-image-proxy";

/** Proxy de imágenes externas para capturas PNG (avatares OAuth, etc.). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = parseShareImageProxyUrl(rawUrl);
  if (!parsed) {
    return new NextResponse(null, { status: 403 });
  }

  const image = await fetchShareImageBuffer(parsed);
  if (!image) {
    return new NextResponse(null, { status: 502 });
  }

  return new NextResponse(image.buffer, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

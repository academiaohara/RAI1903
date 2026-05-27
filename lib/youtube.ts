/** Extrae el ID de un enlace youtu.be o youtube.com. */
export function youtubeVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /[?&]v=([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

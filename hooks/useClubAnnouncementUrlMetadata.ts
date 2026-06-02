"use client";

import { useCallback, useState } from "react";
import { looksLikeClubAnnouncementUrl, normalizeClubAnnouncementUrl } from "@/lib/club-announcement";

export type ClubAnnouncementUrlMetadata = {
  title: string;
  excerpt: string;
  imageUrl?: string;
  date?: string;
};

type UrlMetadataResponse = {
  title?: string | null;
  description?: string | null;
  date?: string | null;
  image?: string | null;
  error?: string;
};

export function useClubAnnouncementUrlMetadata() {
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async (rawUrl: string): Promise<ClubAnnouncementUrlMetadata | null> => {
    const trimmed = rawUrl.trim();
    if (!trimmed || !looksLikeClubAnnouncementUrl(trimmed)) {
      setFetchError("Introduce una URL válida");
      return null;
    }

    const url = normalizeClubAnnouncementUrl(trimmed);
    setFetching(true);
    setFetchError(null);

    try {
      const response = await fetch("/api/url-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as UrlMetadataResponse;

      if (!response.ok) {
        setFetchError(data.error ?? "No se pudo leer la URL");
        return null;
      }

      const title = data.title?.trim();
      if (!title) {
        setFetchError("La página no devolvió un título");
        return null;
      }

      return {
        title,
        excerpt: data.description?.trim() ?? "",
        imageUrl: data.image?.trim() || undefined,
        date: data.date?.trim() || undefined,
      };
    } catch {
      setFetchError("Error de red al obtener la URL");
      return null;
    } finally {
      setFetching(false);
    }
  }, []);

  const clearFetchError = useCallback(() => setFetchError(null), []);

  return { fetching, fetchError, fetchMetadata, clearFetchError };
}

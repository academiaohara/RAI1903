"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPublishedNewsItems } from "@/lib/cms/news";
import type { NewsItem } from "@/types";

export function usePublishedNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return fetchPublishedNewsItems().then((next) => {
      setItems(next);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedNewsItems().then((next) => {
      if (!cancelled) {
        setItems(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, refresh };
}

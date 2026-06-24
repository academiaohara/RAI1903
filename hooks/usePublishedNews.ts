"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyNewsInlineOverrides, fetchPublishedNewsItems } from "@/lib/cms/news";
import type { NewsItem } from "@/types";

export function usePublishedNews() {
  const { overrides } = useInlineEditing();
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

  const resolvedItems = useMemo(() => applyNewsInlineOverrides(items, overrides), [items, overrides]);

  return { items: resolvedItems, loading, refresh };
}

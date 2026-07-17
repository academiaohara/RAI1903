"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { NEWS_CHANGED_EVENT } from "@/lib/cms/news-events";
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

  useEffect(() => {
    const handleNewsChanged = () => {
      void refresh();
    };
    window.addEventListener(NEWS_CHANGED_EVENT, handleNewsChanged);
    return () => window.removeEventListener(NEWS_CHANGED_EVENT, handleNewsChanged);
  }, [refresh]);

  const resolvedItems = useMemo(() => applyNewsInlineOverrides(items, overrides), [items, overrides]);

  return { items: resolvedItems, loading, refresh };
}

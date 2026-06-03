"use client";

import { useCallback, useState } from "react";
import { matchesNewsDateRange } from "@/lib/noticias";
import type { NewsItem } from "@/types";

export function useNewsDateRangeFilter() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const clearDateRange = useCallback(() => {
    setDateFrom("");
    setDateTo("");
  }, []);

  const matchesDateRange = useCallback(
    (item: Pick<NewsItem, "date">) => matchesNewsDateRange(item, dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  return {
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    clearDateRange,
    hasDateRange: Boolean(dateFrom || dateTo),
    matchesDateRange,
  };
}

"use client";

import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZES = [10, 20, 50] as const;

export type UsePaginationOptions = {
  defaultPageSize?: number;
  pageSizes?: readonly number[];
};

export function usePagination<T>(items: T[], options?: UsePaginationOptions) {
  const pageSizes = options?.pageSizes ?? DEFAULT_PAGE_SIZES;
  const defaultPageSize = options?.defaultPageSize ?? pageSizes[0];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };

  const changePageSize = (next: number) => {
    setPageSize(next);
    setPage(1);
  };

  return {
    paginatedItems,
    page: currentPage,
    pageSize,
    pageSizes,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    setPage: goToPage,
    setPageSize: changePageSize,
    canGoFirst: currentPage > 1,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    canGoLast: currentPage < totalPages,
    goToFirst: () => goToPage(1),
    goToPrevious: () => goToPage(currentPage - 1),
    goToNext: () => goToPage(currentPage + 1),
    goToLast: () => goToPage(totalPages),
  };
}

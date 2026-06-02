"use client";

import { useMemo } from "react";
import { useTransfers } from "@/hooks/useTransfers";
import { getDefaultTransferMarketWindowId } from "@/lib/transfer-market-windows";

/** Ventanas de mercado de la temporada visualizada (no de todas las publicadas). */
export function useViewedSeasonTransferMarketWindows() {
  const { viewedSeasonMarketWindows, loading } = useTransfers();

  const defaultWindowId = useMemo(
    () => getDefaultTransferMarketWindowId(viewedSeasonMarketWindows),
    [viewedSeasonMarketWindows],
  );

  return { windows: viewedSeasonMarketWindows, defaultWindowId, loading };
}

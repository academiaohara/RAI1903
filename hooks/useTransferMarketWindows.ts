"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { getDefaultTransferMarketWindowId } from "@/lib/transfer-market-windows";

export function useTransferMarketWindows() {
  const { marketWindows, transfersLoading } = useSeason();

  const defaultWindowId = useMemo(
    () => getDefaultTransferMarketWindowId(marketWindows),
    [marketWindows],
  );

  return { windows: marketWindows, defaultWindowId, loading: transfersLoading };
}

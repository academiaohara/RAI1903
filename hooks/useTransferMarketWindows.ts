"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { getTransfersBundle } from "@/lib/cms/season-bundles";
import {
  getDefaultTransferMarketWindowId,
  resolveTransferMarketWindows,
  type TransferMarketWindow,
} from "@/lib/transfer-market-windows";

export function useTransferMarketWindows(): {
  windows: TransferMarketWindow[];
  defaultWindowId: string;
  loading: boolean;
} {
  const { bundles, bundlesLoading } = useSeason();

  const bundle = useMemo(() => getTransfersBundle(bundles), [bundles]);

  const windows = useMemo(
    () => resolveTransferMarketWindows(bundle?.windows, bundle?.entries ?? []),
    [bundle?.entries, bundle?.windows],
  );

  const defaultWindowId = useMemo(() => getDefaultTransferMarketWindowId(windows), [windows]);

  return { windows, defaultWindowId, loading: bundlesLoading };
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { TransferMarketWindowSelector } from "@/components/fichajes/TransferMarketWindowSelector";
import { TransfersCarousel } from "@/components/fichajes/TransfersCarousel";
import { useTransferMarketWindows } from "@/hooks/useTransferMarketWindows";
import type { TransferMarketWindowId } from "@/types";

export function HomeTransfersSection() {
  const { windows, defaultWindowId } = useTransferMarketWindows();
  const [selectedWindowId, setSelectedWindowId] = useState<TransferMarketWindowId | null>(null);

  const marketWindowId = useMemo(() => {
    if (selectedWindowId && windows.some((window) => window.id === selectedWindowId)) {
      return selectedWindowId;
    }
    return defaultWindowId;
  }, [defaultWindowId, selectedWindowId, windows]);

  const handleMarketWindowChange = useCallback((nextWindowId: TransferMarketWindowId) => {
    setSelectedWindowId(nextWindowId);
  }, []);

  return (
    <div id="fichajes">
      <Card
        eyebrow="Mercado"
        title="Fichajes y renovaciones"
        action={
          <TransferMarketWindowSelector
            value={marketWindowId}
            onChange={handleMarketWindowChange}
            windows={windows}
          />
        }
      >
        <TransfersCarousel marketWindowId={marketWindowId} />
      </Card>
    </div>
  );
}

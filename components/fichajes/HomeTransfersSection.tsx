"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/Card";
import {
  DEFAULT_TRANSFER_MARKET_WINDOW_ID,
  TransferMarketWindowSelector,
} from "@/components/fichajes/TransferMarketWindowSelector";
import { TransfersCarousel } from "@/components/fichajes/TransfersCarousel";
import type { TransferMarketWindowId } from "@/types";

export function HomeTransfersSection() {
  const [marketWindowId, setMarketWindowId] = useState<TransferMarketWindowId>(DEFAULT_TRANSFER_MARKET_WINDOW_ID);

  const handleMarketWindowChange = useCallback((nextWindowId: TransferMarketWindowId) => {
    setMarketWindowId(nextWindowId);
  }, []);

  return (
    <div id="fichajes">
      <Card
        eyebrow="Mercado"
        title="Fichajes y renovaciones"
        action={
          <TransferMarketWindowSelector value={marketWindowId} onChange={handleMarketWindowChange} />
        }
      >
        <TransfersCarousel marketWindowId={marketWindowId} />
      </Card>
    </div>
  );
}

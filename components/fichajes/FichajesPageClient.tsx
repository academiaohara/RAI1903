"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { TransferMarketOnPageEditor } from "@/components/editor/TransferMarketOnPageEditor";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import { TransferFichaCardPlaceholder } from "@/components/fichajes/TransferFichaCardPlaceholder";
import { TransferMarketWindowSelector } from "@/components/fichajes/TransferMarketWindowSelector";
import { PageHero } from "@/components/PageHero";
import { useTransferMarketWindows } from "@/hooks/useTransferMarketWindows";
import { useTransfers } from "@/hooks/useTransfers";
import { useViewedSeasonTransferMarketWindows } from "@/hooks/useViewedSeasonTransferMarketWindows";
import { getTransferMarketWindowById } from "@/lib/transfer-market-windows";
import { EMPTY_TRANSFER_FICHA_SLOT_COUNT } from "@/lib/fichajes-carousel";
import type { TransferMarketWindowId } from "@/types";
import type { Route } from "next";

const FICHAJES_GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 sm:gap-2.5";

export function FichajesPageClient() {
  const { getOfficialAltas, loading } = useTransfers();
  const { windows } = useTransferMarketWindows();
  const { defaultWindowId: viewedSeasonDefaultWindowId } = useViewedSeasonTransferMarketWindows();
  const [selectedWindowId, setSelectedWindowId] = useState<TransferMarketWindowId | null>(null);

  const defaultWindowId = useMemo(() => {
    if (windows.some((window) => window.id === viewedSeasonDefaultWindowId)) {
      return viewedSeasonDefaultWindowId;
    }
    return windows[windows.length - 1]?.id ?? viewedSeasonDefaultWindowId;
  }, [viewedSeasonDefaultWindowId, windows]);

  const marketWindowId = useMemo(() => {
    if (selectedWindowId && windows.some((window) => window.id === selectedWindowId)) {
      return selectedWindowId;
    }
    return defaultWindowId;
  }, [defaultWindowId, selectedWindowId, windows]);

  const selectedWindowLabel = useMemo(
    () => getTransferMarketWindowById(marketWindowId, windows).label,
    [marketWindowId, windows],
  );

  const handleMarketWindowChange = useCallback((nextWindowId: TransferMarketWindowId) => {
    setSelectedWindowId(nextWindowId);
  }, []);

  const featured = getOfficialAltas(marketWindowId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Mercado"
        title="Fichajes"
        description={`Altas oficiales del Real Avilés Industrial (${selectedWindowLabel}): agentes libres y cesiones del mercado.`}
        titleActions={
          <TransferMarketWindowSelector
            value={marketWindowId}
            onChange={handleMarketWindowChange}
            windows={windows}
          />
        }
      />

      <TransferMarketOnPageEditor />

      {loading ? (
        <p className="text-sm font-bold text-slate-500">Cargando mercado…</p>
      ) : featured.length === 0 ? (
        <div className={FICHAJES_GRID_CLASS}>
          {Array.from({ length: EMPTY_TRANSFER_FICHA_SLOT_COUNT }, (_, index) => (
            <TransferFichaCardPlaceholder key={`empty-fichajes-${index}`} layout="grid" />
          ))}
        </div>
      ) : (
        <div className={FICHAJES_GRID_CLASS}>
          {featured.map((transfer, index) => (
            <TransferFichaCard key={transfer.id} transfer={transfer} index={index} layout="grid" />
          ))}
        </div>
      )}
      <Link href={"/" as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}

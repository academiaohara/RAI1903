"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { TransferMarketOnPageEditor } from "@/components/editor/TransferMarketOnPageEditor";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import { TransferFichaCardPlaceholder } from "@/components/fichajes/TransferFichaCardPlaceholder";
import { TransferMarketSection } from "@/components/fichajes/TransferMarketSection";
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

const MARKET_SECTIONS = [
  { key: "fichajes" as const, title: "Fichajes" },
  { key: "cesiones" as const, title: "Cesiones" },
  { key: "renovaciones" as const, title: "Renovaciones" },
];

export function FichajesPageClient() {
  const { getSigningCarousel, getLoans, getRenewalCarousel, loading } = useTransfers();
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

  const sections = useMemo(
    () =>
      MARKET_SECTIONS.map((section) => {
        if (section.key === "fichajes") {
          return { ...section, transfers: getSigningCarousel(marketWindowId) };
        }
        if (section.key === "cesiones") {
          return { ...section, transfers: getLoans(marketWindowId) };
        }
        return { ...section, transfers: getRenewalCarousel(marketWindowId) };
      }).filter((section) => section.transfers.length > 0),
    [getLoans, getRenewalCarousel, getSigningCarousel, marketWindowId],
  );

  const hasAnyTransfers = sections.length > 0;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Mercado"
        title="Fichajes"
        description={`Movimientos oficiales del Real Avilés Industrial (${selectedWindowLabel}): fichajes, cesiones y renovaciones.`}
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
      ) : !hasAnyTransfers ? (
        <div className={FICHAJES_GRID_CLASS}>
          {Array.from({ length: EMPTY_TRANSFER_FICHA_SLOT_COUNT }, (_, index) => (
            <TransferFichaCardPlaceholder key={`empty-fichajes-${index}`} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-7 sm:space-y-10">
          {sections.map((section, sectionIndex) => (
            <TransferMarketSection key={section.key} title={section.title} delay={sectionIndex * 0.05}>
              <div className={FICHAJES_GRID_CLASS}>
                {section.transfers.map((transfer, index) => (
                  <TransferFichaCard key={transfer.id} transfer={transfer} index={index} layout="grid" />
                ))}
              </div>
            </TransferMarketSection>
          ))}
        </div>
      )}
      <Link href={"/" as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}

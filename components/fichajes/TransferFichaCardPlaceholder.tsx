"use client";

import { useSeason } from "@/components/season/SeasonProvider";
import { seasonIdToDisplayLabel, usesLegacyFichaDesign } from "@/lib/ficha-design";
import { resolveTransferSeasonId } from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";

type TransferFichaCardPlaceholderProps = {
  layout?: "carousel" | "grid";
  transfer?: TransferRumor;
};

export function TransferFichaCardPlaceholder({ layout = "carousel", transfer }: TransferFichaCardPlaceholderProps) {
  const { viewedSeasonId } = useSeason();
  const seasonLabel = transfer
    ? seasonIdToDisplayLabel(resolveTransferSeasonId(transfer, viewedSeasonId))
    : seasonIdToDisplayLabel(viewedSeasonId);
  const useTradingDesign = !usesLegacyFichaDesign(seasonLabel);

  const wrapperClass =
    layout === "grid" ? "w-full" : "shrink-0 snap-start w-[min(43vw,128px)] sm:w-[175px]";

  if (useTradingDesign) {
    return (
      <div className={wrapperClass} aria-hidden>
        <div className="trading-ficha-shell">
          <div className="trading-ficha-frame">
            <article className="trading-ficha-card">
              <div className="trading-ficha-stripes" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/80">Pendiente</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} aria-hidden>
      <article className="overflow-hidden rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-sm rounded-bl-sm border-2 border-dashed border-[#214C9B]/25 bg-slate-50/90">
        <div className="flex h-[108px] items-center justify-center sm:h-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pendiente</span>
        </div>
        <div className="bg-slate-200/90 px-3 py-2">
          <div className="h-4 rounded bg-slate-300/80" />
          <div className="mt-1.5 h-3 w-2/3 rounded bg-slate-300/60" />
        </div>
      </article>
    </div>
  );
}

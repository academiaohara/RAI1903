"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DEFAULT_TRANSFER_MARKET_WINDOW_ID,
  TRANSFER_MARKET_WINDOWS,
  getTransferMarketWindowIndex,
} from "@/lib/transfer-market-windows";
import { cn } from "@/lib/utils";
import type { TransferMarketWindowId } from "@/types";

type TransferMarketWindowSelectorProps = {
  value: TransferMarketWindowId;
  onChange: (windowId: TransferMarketWindowId) => void;
  className?: string;
};

export function TransferMarketWindowSelector({ value, onChange, className }: TransferMarketWindowSelectorProps) {
  const currentIndex = getTransferMarketWindowIndex(value);
  const current = TRANSFER_MARKET_WINDOWS[currentIndex] ?? TRANSFER_MARKET_WINDOWS[TRANSFER_MARKET_WINDOWS.length - 1];

  const goOlder = () => {
    const nextIndex = Math.max(0, currentIndex - 1);
    const next = TRANSFER_MARKET_WINDOWS[nextIndex];
    if (next) onChange(next.id);
  };

  const goNewer = () => {
    const nextIndex = Math.min(TRANSFER_MARKET_WINDOWS.length - 1, currentIndex + 1);
    const next = TRANSFER_MARKET_WINDOWS[nextIndex];
    if (next) onChange(next.id);
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-[#214C9B]/15 bg-[#214C9B]/5 p-1",
        className,
      )}
      role="group"
      aria-label="Ventana de mercado"
    >
      <button
        type="button"
        onClick={goOlder}
        disabled={currentIndex === 0}
        className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Mercado anterior"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      <span className="min-w-[8.5rem] px-1 text-center text-[10px] font-bold uppercase tracking-normal text-[#214C9B] sm:min-w-[9rem] sm:px-2 sm:text-xs">
        {current.label}
      </span>
      <button
        type="button"
        onClick={goNewer}
        disabled={currentIndex === TRANSFER_MARKET_WINDOWS.length - 1}
        className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Mercado más reciente"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}

export { DEFAULT_TRANSFER_MARKET_WINDOW_ID };

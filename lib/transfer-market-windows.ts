import type { TransferMarketWindowId } from "@/types";

export type TransferMarketWindow = {
  id: TransferMarketWindowId;
  label: string;
};

/** Ventanas de mercado ordenadas de la más antigua a la más reciente. */
export const TRANSFER_MARKET_WINDOWS: TransferMarketWindow[] = [
  { id: "verano-24-25", label: "Verano 24/25" },
  { id: "invierno-24-25", label: "Invierno 24/25" },
  { id: "verano-25-26", label: "Verano 25/26" },
  { id: "invierno-25-26", label: "Invierno 25/26" },
];

export const DEFAULT_TRANSFER_MARKET_WINDOW_ID: TransferMarketWindowId = "invierno-25-26";

export function getTransferMarketWindowIndex(windowId: TransferMarketWindowId): number {
  const index = TRANSFER_MARKET_WINDOWS.findIndex((window) => window.id === windowId);
  return index >= 0 ? index : TRANSFER_MARKET_WINDOWS.length - 1;
}

export function getTransferMarketWindowById(windowId: TransferMarketWindowId): TransferMarketWindow {
  return (
    TRANSFER_MARKET_WINDOWS.find((window) => window.id === windowId) ??
    TRANSFER_MARKET_WINDOWS[TRANSFER_MARKET_WINDOWS.length - 1]
  );
}

/** Infiere la ventana a partir de la fecha del movimiento (ISO). */
export function inferTransferMarketWindowId(date: string): TransferMarketWindowId {
  const month = Number.parseInt(date.slice(5, 7), 10);
  const year = Number.parseInt(date.slice(0, 4), 10);

  if (month >= 7 && month <= 9) {
    const seasonStart = year % 100;
    const seasonEnd = (year + 1) % 100;
    return `verano-${seasonStart}-${seasonEnd}` as TransferMarketWindowId;
  }

  if (month === 1 || month === 2) {
    const seasonStart = (year - 1) % 100;
    const seasonEnd = year % 100;
    return `invierno-${seasonStart}-${seasonEnd}` as TransferMarketWindowId;
  }

  if (month >= 10) {
    const seasonStart = year % 100;
    const seasonEnd = (year + 1) % 100;
    return `invierno-${seasonStart}-${seasonEnd}` as TransferMarketWindowId;
  }

  return DEFAULT_TRANSFER_MARKET_WINDOW_ID;
}

export function resolveTransferMarketWindowId(
  transfer: { date: string; marketWindowId?: TransferMarketWindowId },
): TransferMarketWindowId {
  return transfer.marketWindowId ?? inferTransferMarketWindowId(transfer.date);
}

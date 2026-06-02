import type { CmsTransferEntry, CmsTransferMarketWindow } from "@/lib/cms/season-bundles";
import type { TransferMarketWindowId } from "@/types";

export type TransferMarketWindow = {
  id: TransferMarketWindowId;
  label: string;
};

/** Ventanas por defecto cuando el bundle CMS no define ninguna. */
export const DEFAULT_TRANSFER_MARKET_WINDOWS: TransferMarketWindow[] = [
  { id: "verano-25-26", label: "Verano 25/26" },
  { id: "invierno-25-26", label: "Invierno 25/26" },
];

/** @deprecated Usa DEFAULT_TRANSFER_MARKET_WINDOWS o resolveTransferMarketWindows. */
export const TRANSFER_MARKET_WINDOWS = DEFAULT_TRANSFER_MARKET_WINDOWS;

export const DEFAULT_TRANSFER_MARKET_WINDOW_ID: TransferMarketWindowId =
  DEFAULT_TRANSFER_MARKET_WINDOWS[DEFAULT_TRANSFER_MARKET_WINDOWS.length - 1].id;

export function slugifyTransferMarketWindowId(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeWindowId(id: string): string {
  return id
    .split("-")
    .map((part) => (part.length <= 2 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}

type ParsedTransferMarketWindowId = {
  seasonStart: number;
  seasonEnd: number;
  phaseRank: number;
};

function parseTransferMarketWindowId(id: string): ParsedTransferMarketWindowId {
  const match = id.match(/^(verano|invierno)-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return { seasonStart: 999, seasonEnd: 999, phaseRank: 9 };
  }
  const phaseRank = match[1] === "verano" ? 0 : 1;
  return {
    seasonStart: Number.parseInt(match[2], 10),
    seasonEnd: Number.parseInt(match[3], 10),
    phaseRank,
  };
}

/** Orden cronológico (más antigua → más reciente) para el selector ←/→. */
export function compareTransferMarketWindowIds(a: string, b: string): number {
  const left = parseTransferMarketWindowId(a);
  const right = parseTransferMarketWindowId(b);
  if (left.seasonStart !== right.seasonStart) return left.seasonStart - right.seasonStart;
  if (left.seasonEnd !== right.seasonEnd) return left.seasonEnd - right.seasonEnd;
  return left.phaseRank - right.phaseRank;
}

export function sortTransferMarketWindows(windows: TransferMarketWindow[]): TransferMarketWindow[] {
  return [...windows].sort((a, b) => compareTransferMarketWindowIds(a.id, b.id));
}

/** Incluye ventanas usadas en movimientos aunque no estén en la lista CMS (datos legacy). */
export function mergeTransferMarketWindows(
  configured: TransferMarketWindow[],
  entries: Array<{ date: string; marketWindowId?: TransferMarketWindowId }>,
): TransferMarketWindow[] {
  const byId = new Map<string, TransferMarketWindow>();
  for (const window of configured) {
    byId.set(window.id, window);
  }
  for (const entry of entries) {
    const id = resolveTransferMarketWindowId(entry);
    if (!byId.has(id)) {
      byId.set(id, { id, label: humanizeWindowId(id) });
    }
  }
  const orderedIds = [...configured.map((window) => window.id)];
  for (const id of byId.keys()) {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  }
  const merged = orderedIds.map((id) => byId.get(id)!);
  return sortTransferMarketWindows(merged);
}

export function resolveTransferMarketWindows(
  cmsWindows?: CmsTransferMarketWindow[] | null,
  entries: Array<{ date: string; marketWindowId?: TransferMarketWindowId }> = [],
): TransferMarketWindow[] {
  const base =
    cmsWindows?.length ?
      cmsWindows.map((window) => ({ id: window.id, label: window.label }))
    : DEFAULT_TRANSFER_MARKET_WINDOWS;
  return mergeTransferMarketWindows(base, entries);
}

export function getDefaultTransferMarketWindowId(windows: TransferMarketWindow[]): TransferMarketWindowId {
  return windows[windows.length - 1]?.id ?? DEFAULT_TRANSFER_MARKET_WINDOW_ID;
}

export function getTransferMarketWindowIndex(
  windowId: TransferMarketWindowId,
  windows: TransferMarketWindow[],
): number {
  const index = windows.findIndex((window) => window.id === windowId);
  return index >= 0 ? index : Math.max(0, windows.length - 1);
}

export function getTransferMarketWindowById(
  windowId: TransferMarketWindowId,
  windows: TransferMarketWindow[],
): TransferMarketWindow {
  return (
    windows.find((window) => window.id === windowId) ??
    windows[windows.length - 1] ??
    DEFAULT_TRANSFER_MARKET_WINDOWS[DEFAULT_TRANSFER_MARKET_WINDOWS.length - 1]
  );
}

/** Infiere la ventana a partir de la fecha del movimiento (ISO). */
export function inferTransferMarketWindowId(date: string): TransferMarketWindowId {
  const month = Number.parseInt(date.slice(5, 7), 10);
  const year = Number.parseInt(date.slice(0, 4), 10);

  if (month >= 7 && month <= 9) {
    const seasonStart = year % 100;
    const seasonEnd = (year + 1) % 100;
    return `verano-${seasonStart}-${seasonEnd}`;
  }

  if (month === 1 || month === 2) {
    const seasonStart = (year - 1) % 100;
    const seasonEnd = year % 100;
    return `invierno-${seasonStart}-${seasonEnd}`;
  }

  if (month >= 10) {
    const seasonStart = year % 100;
    const seasonEnd = (year + 1) % 100;
    return `invierno-${seasonStart}-${seasonEnd}`;
  }

  return DEFAULT_TRANSFER_MARKET_WINDOW_ID;
}

export function resolveTransferMarketWindowId(transfer: {
  date: string;
  marketWindowId?: TransferMarketWindowId;
}): TransferMarketWindowId {
  return transfer.marketWindowId ?? inferTransferMarketWindowId(transfer.date);
}

export function isTransferMarketWindowIdValid(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export function countEntriesForMarketWindow(
  entries: CmsTransferEntry[],
  windowId: TransferMarketWindowId,
): number {
  return entries.filter((entry) => resolveTransferMarketWindowId(entry) === windowId).length;
}

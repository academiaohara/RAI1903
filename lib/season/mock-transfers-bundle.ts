import { transfers } from "@/data/mock";
import type { SeasonTransfersBundle } from "@/lib/cms/season-bundles";
import { cmsEntryFromTransferRumor } from "@/lib/season/transfer-source";
import type { CmsTransferEntry } from "@/lib/cms/season-bundles";
import { DEFAULT_TRANSFER_MARKET_WINDOWS } from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";

function isCarouselTransfer(transfer: TransferRumor): boolean {
  if (transfer.category === "Bajas") return false;
  if (transfer.status !== "Oficial") return false;
  return transfer.category === "Altas" || transfer.category === "Renovaciones";
}

/** Altas/renovaciones/cesiones oficiales del mock (sin salidas). */
export function getMockCarouselTransfers(): TransferRumor[] {
  return transfers.filter(isCarouselTransfer);
}

export function buildMockTransfersBundle(): SeasonTransfersBundle {
  const entries = getMockCarouselTransfers()
    .map((transfer) => cmsEntryFromTransferRumor(transfer))
    .filter((entry): entry is CmsTransferEntry => entry !== null);
  return {
    entries,
    windows: DEFAULT_TRANSFER_MARKET_WINDOWS.map((window) => ({ id: window.id, label: window.label })),
  };
}

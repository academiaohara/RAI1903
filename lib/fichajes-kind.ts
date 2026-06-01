import type { TransferKind, TransferRumor } from "@/types";

/** Altas en calidad de cedidos (mock legacy; en CMS se usa `kind: "cesion"`). */
const LEGACY_LOAN_TRANSFER_IDS = new Set([
  "t-alt-eze",
  "t-alt-uzkudun",
  "t-alt-nando",
  "t-alt-ortega",
]);

export function isLegacyLoanTransfer(transfer: TransferRumor): boolean {
  return LEGACY_LOAN_TRANSFER_IDS.has(transfer.id);
}

export function inferTransferKind(transfer: TransferRumor): TransferKind {
  if (transfer.kind) return transfer.kind;
  if (isLegacyLoanTransfer(transfer)) return "cesion";
  if (transfer.category === "Renovaciones") return "renovacion";
  return "fichaje";
}

import type { CmsSeason } from "@/lib/cms/seasons";

/** Garantiza un único `isDefault` (la primera por sort_order gana). */
export function normalizeSinglePrincipalSeason(seasons: CmsSeason[]): CmsSeason[] {
  let principalAssigned = false;
  return seasons.map((row) => {
    if (!row.isDefault) return row;
    if (principalAssigned) return { ...row, isDefault: false };
    principalAssigned = true;
    return row;
  });
}

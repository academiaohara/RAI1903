export const FORMATION_OPTIONS = [
  "4-4-2",
  "4-3-3",
  "4-2-3-1",
  "3-5-2",
  "3-4-2-1",
  "5-3-2",
  "4-5-1",
] as const;

export type FormationId = (typeof FORMATION_OPTIONS)[number];

export const DEFAULT_FORMATION: FormationId = "4-4-2";

export type FormationSlot = {
  x: number;
  y: number;
};

function row(count: number, y: number): FormationSlot[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y }];
  const spread = Math.min(76, 12 * (count - 1));
  const step = spread / (count - 1);
  const start = 50 - spread / 2;
  return Array.from({ length: count }, (_, index) => ({
    x: Math.round(start + step * index),
    y,
  }));
}

function goalkeeper(): FormationSlot[] {
  return [{ x: 50, y: 92 }];
}

/** Eleven slot positions on the pitch (percentages), from goalkeeper to attack. */
export const FORMATION_SLOTS: Record<FormationId, FormationSlot[]> = {
  "4-4-2": [...goalkeeper(), ...row(4, 76), ...row(4, 52), ...row(2, 26)],
  "4-3-3": [...goalkeeper(), ...row(4, 76), ...row(3, 52), ...row(3, 26)],
  "4-2-3-1": [...goalkeeper(), ...row(4, 76), ...row(2, 62), ...row(3, 40), ...row(1, 24)],
  "3-5-2": [...goalkeeper(), ...row(3, 76), ...row(5, 52), ...row(2, 26)],
  "3-4-2-1": [...goalkeeper(), ...row(3, 76), ...row(4, 54), ...row(2, 36), ...row(1, 22)],
  "5-3-2": [...goalkeeper(), ...row(5, 76), ...row(3, 52), ...row(2, 26)],
  "4-5-1": [...goalkeeper(), ...row(4, 76), ...row(5, 52), ...row(1, 24)],
};

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_OPTIONS as readonly string[]).includes(value);
}

export function slotCountForFormation(formation: FormationId): number {
  return FORMATION_SLOTS[formation].length;
}

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
  return [{ x: 50, y: 90 }];
}

/** Eleven slot positions on the pitch (percentages), from goalkeeper to attack. */
export const FORMATION_SLOTS: Record<FormationId, FormationSlot[]> = {
  "4-4-2": [...goalkeeper(), ...row(4, 74), ...row(4, 50), ...row(2, 28)],
  "4-3-3": [...goalkeeper(), ...row(4, 74), ...row(3, 50), ...row(3, 28)],
  "4-2-3-1": [...goalkeeper(), ...row(4, 74), ...row(2, 60), ...row(3, 40), ...row(1, 26)],
  "3-5-2": [...goalkeeper(), ...row(3, 74), ...row(5, 50), ...row(2, 28)],
  "3-4-2-1": [...goalkeeper(), ...row(3, 74), ...row(4, 52), ...row(2, 36), ...row(1, 24)],
  "5-3-2": [...goalkeeper(), ...row(5, 74), ...row(3, 50), ...row(2, 28)],
  "4-5-1": [...goalkeeper(), ...row(4, 74), ...row(5, 50), ...row(1, 26)],
};

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_OPTIONS as readonly string[]).includes(value);
}

export function slotCountForFormation(formation: FormationId): number {
  return FORMATION_SLOTS[formation].length;
}

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
  label: string;
};

function row(count: number, y: number, labels: string[]): FormationSlot[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y, label: labels[0] ?? "" }];
  const spread = Math.min(92, 22 * (count - 1));
  const step = spread / (count - 1);
  const start = 50 - spread / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: Math.round(start + step * i),
    y,
    label: labels[i] ?? labels[0] ?? "",
  }));
}

function goalkeeper(): FormationSlot[] {
  return [{ x: 50, y: 92, label: "PT" }];
}

/** Eleven slot positions on the pitch (percentages), from goalkeeper to attack. */
export const FORMATION_SLOTS: Record<FormationId, FormationSlot[]> = {
  "4-4-2": [
    ...goalkeeper(),
    ...row(4, 76, ["LD", "DFC", "DFC", "LI"]),
    ...row(4, 50, ["MD", "MC", "MC", "MI"]),
    ...row(2, 12, ["DC", "DC"]),
  ],
  "4-3-3": [
    ...goalkeeper(),
    ...row(4, 76, ["LD", "DFC", "DFC", "LI"]),
    ...row(3, 48, ["MC", "MC", "MC"]),
    ...row(3, 10, ["EI", "DC", "ED"]),
  ],
  "4-2-3-1": [
    ...goalkeeper(),
    ...row(4, 76, ["LD", "DFC", "DFC", "LI"]),
    ...row(2, 60, ["MCD", "MCD"]),
    ...row(3, 38, ["EI", "CAM", "ED"]),
    ...row(1, 10, ["DC"]),
  ],
  "3-5-2": [
    ...goalkeeper(),
    ...row(3, 76, ["DFC", "DFC", "DFC"]),
    ...row(5, 50, ["MD", "MC", "MC", "MC", "MI"]),
    ...row(2, 12, ["DC", "DC"]),
  ],
  "3-4-2-1": [
    ...goalkeeper(),
    ...row(3, 78, ["DFC", "DFC", "DFC"]),
    ...row(4, 58, ["MD", "MC", "MC", "MI"]),
    ...row(2, 36, ["CAI", "CAI"]),
    ...row(1, 10, ["DC"]),
  ],
  "5-3-2": [
    ...goalkeeper(),
    ...row(5, 76, ["LD", "DFC", "DFC", "DFC", "LI"]),
    ...row(3, 50, ["MC", "MC", "MC"]),
    ...row(2, 12, ["DC", "DC"]),
  ],
  "4-5-1": [
    ...goalkeeper(),
    ...row(4, 76, ["LD", "DFC", "DFC", "LI"]),
    ...row(5, 50, ["MD", "MC", "MC", "MC", "MI"]),
    ...row(1, 10, ["DC"]),
  ],
};

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_OPTIONS as readonly string[]).includes(value);
}

export function slotCountForFormation(formation: FormationId): number {
  return FORMATION_SLOTS[formation].length;
}

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
  return [{ x: 50, y: 88, label: "PT" }];
}

/** Eleven slot positions on the pitch (percentages), from goalkeeper to attack. */
export const FORMATION_SLOTS: Record<FormationId, FormationSlot[]> = {
  "4-4-2": [
    ...goalkeeper(),
    ...row(4, 73, ["LD", "DFC", "DFC", "LI"]),
    ...row(4, 52, ["MD", "MC", "MC", "MI"]),
    ...row(2, 24, ["DC", "DC"]),
  ],
  "4-3-3": [
    ...goalkeeper(),
    ...row(4, 73, ["LD", "DFC", "DFC", "LI"]),
    ...row(3, 50, ["MC", "MC", "MC"]),
    ...row(3, 23, ["EI", "DC", "ED"]),
  ],
  "4-2-3-1": [
    ...goalkeeper(),
    ...row(4, 73, ["LD", "DFC", "DFC", "LI"]),
    ...row(2, 58, ["MCD", "MCD"]),
    ...row(3, 40, ["EI", "CAM", "ED"]),
    ...row(1, 22, ["DC"]),
  ],
  "3-5-2": [
    ...goalkeeper(),
    ...row(3, 73, ["DFC", "DFC", "DFC"]),
    ...row(5, 52, ["MD", "MC", "MC", "MC", "MI"]),
    ...row(2, 24, ["DC", "DC"]),
  ],
  "3-4-2-1": [
    ...goalkeeper(),
    ...row(3, 75, ["DFC", "DFC", "DFC"]),
    ...row(4, 56, ["MD", "MC", "MC", "MI"]),
    ...row(2, 37, ["CAI", "CAI"]),
    ...row(1, 22, ["DC"]),
  ],
  "5-3-2": [
    ...goalkeeper(),
    ...row(5, 73, ["LD", "DFC", "DFC", "DFC", "LI"]),
    ...row(3, 52, ["MC", "MC", "MC"]),
    ...row(2, 24, ["DC", "DC"]),
  ],
  "4-5-1": [
    ...goalkeeper(),
    ...row(4, 73, ["LD", "DFC", "DFC", "LI"]),
    ...row(5, 52, ["MD", "MC", "MC", "MC", "MI"]),
    ...row(1, 24, ["DC"]),
  ],
};

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_OPTIONS as readonly string[]).includes(value);
}

export function slotCountForFormation(formation: FormationId): number {
  return FORMATION_SLOTS[formation].length;
}

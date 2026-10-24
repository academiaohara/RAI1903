export const FORMATION_OPTIONS = [
  "4-4-2",
  "4-3-3",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-2-1",
  "4-5-1",
  "3-5-2",
  "3-4-3",
  "3-4-2-1",
  "5-3-2",
  "5-2-3",
  "5-4-1",
] as const;

export type FormationId = (typeof FORMATION_OPTIONS)[number];

export const DEFAULT_FORMATION: FormationId = "4-4-2";

export type FormationSlot = {
  x: number;
  y: number;
  label: string;
};

function goalkeeper(): FormationSlot[] {
  return [{ x: 50, y: 88, label: "PT" }];
}

function slots(y: number, xs: number[], labels: string[]): FormationSlot[] {
  return xs.map((x, i) => ({ x, y, label: labels[i] ?? labels[0] ?? "" }));
}

/** Eleven slot positions on the pitch (percentages), from goalkeeper to attack. */
export const FORMATION_SLOTS: Record<FormationId, FormationSlot[]> = {
  "4-4-2": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(51, [12, 37, 63, 88], ["MI", "MC", "MC", "MD"]),
    ...slots(24, [36, 64], ["DC", "DC"]),
  ],
  "4-3-3": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(50, [28, 50, 72], ["MC", "MC", "MC"]),
    ...slots(24, [14, 50, 86], ["EI", "DC", "ED"]),
  ],
  "4-2-3-1": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(57, [36, 64], ["MCD", "MCD"]),
    ...slots(38, [14, 50, 86], ["EI", "MCO", "ED"]),
    ...slots(20, [50], ["DC"]),
  ],
  "4-1-4-1": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(58, [50], ["MCD"]),
    ...slots(41, [12, 37, 63, 88], ["MI", "MC", "MC", "MD"]),
    ...slots(21, [50], ["DC"]),
  ],
  "4-3-2-1": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(53, [28, 50, 72], ["MC", "MC", "MC"]),
    ...slots(35, [34, 66], ["MCO", "MCO"]),
    ...slots(20, [50], ["DC"]),
  ],
  "3-5-2": [
    ...goalkeeper(),
    ...slots(73, [28, 50, 72], ["DFC", "DFC", "DFC"]),
    ...slots(50, [11, 31, 50, 69, 89], ["CAI", "MC", "MC", "MC", "CAD"]),
    ...slots(24, [36, 64], ["DC", "DC"]),
  ],
  "3-4-3": [
    ...goalkeeper(),
    ...slots(73, [28, 50, 72], ["DFC", "DFC", "DFC"]),
    ...slots(52, [11, 38, 62, 89], ["CAI", "MC", "MC", "CAD"]),
    ...slots(24, [16, 50, 84], ["EI", "DC", "ED"]),
  ],
  "3-4-2-1": [
    ...goalkeeper(),
    ...slots(74, [28, 50, 72], ["DFC", "DFC", "DFC"]),
    ...slots(54, [11, 38, 62, 89], ["CAI", "MC", "MC", "CAD"]),
    ...slots(36, [32, 68], ["MCO", "MCO"]),
    ...slots(20, [50], ["DC"]),
  ],
  "5-3-2": [
    ...goalkeeper(),
    ...slots(60, [11, 89], ["CAI", "CAD"]),
    ...slots(75, [30, 50, 70], ["DFC", "DFC", "DFC"]),
    ...slots(48, [28, 50, 72], ["MC", "MC", "MC"]),
    ...slots(24, [36, 64], ["DC", "DC"]),
  ],
  "5-2-3": [
    ...goalkeeper(),
    ...slots(64, [11, 89], ["LI", "LD"]),
    ...slots(75, [30, 50, 70], ["DFC", "DFC", "DFC"]),
    ...slots(51, [36, 64], ["MC", "MC"]),
    ...slots(24, [15, 50, 85], ["EI", "DC", "ED"]),
  ],
  "5-4-1": [
    ...goalkeeper(),
    ...slots(64, [11, 89], ["LI", "LD"]),
    ...slots(75, [30, 50, 70], ["DFC", "DFC", "DFC"]),
    ...slots(46, [12, 38, 62, 88], ["MI", "MC", "MC", "MD"]),
    ...slots(22, [50], ["DC"]),
  ],
  "4-5-1": [
    ...goalkeeper(),
    ...slots(72, [12, 36, 64, 88], ["LI", "DFC", "DFC", "LD"]),
    ...slots(50, [11, 31, 50, 69, 89], ["MI", "MC", "MC", "MC", "MD"]),
    ...slots(23, [50], ["DC"]),
  ],
};

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_OPTIONS as readonly string[]).includes(value);
}

export function slotCountForFormation(formation: FormationId): number {
  return FORMATION_SLOTS[formation].length;
}

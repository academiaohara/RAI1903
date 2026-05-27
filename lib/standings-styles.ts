import type { StandingsZone } from "@/types";

export function getStandingsZoneRowClass(zone: StandingsZone | undefined, highlighted: boolean): string {
  if (highlighted) return "bg-blue-50 text-[#214C9B] ring-1 ring-inset ring-[#214C9B]/25";
  switch (zone) {
    case "promotion":
      return "bg-emerald-50/90 text-slate-800";
    case "playoff":
      return "bg-sky-50/80 text-slate-800";
    case "relegation":
      return "bg-rose-50/90 text-slate-800";
    default:
      return "text-slate-700";
  }
}

export const STANDINGS_ZONE_LEGEND = [
  { zone: "promotion" as const, label: "Ascenso directo", className: "bg-emerald-500" },
  { zone: "playoff" as const, label: "Playoff", className: "bg-sky-400" },
  { zone: "relegation" as const, label: "Descenso", className: "bg-rose-500" },
];

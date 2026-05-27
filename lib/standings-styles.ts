import type { StandingsZone } from "@/types";

export function getStandingsZonePositionClass(zone: StandingsZone | undefined): string {
  switch (zone) {
    case "promotion":
      return "bg-emerald-500 text-white";
    case "playoff":
      return "bg-sky-400 text-white";
    case "relegation":
      return "bg-rose-500 text-white";
    default:
      return "bg-[#214C9B] text-white";
  }
}

export function getStandingsHighlightRowClass(highlighted: boolean): string {
  if (highlighted) return "bg-[#981915] text-white";
  return "bg-white text-slate-700";
}

export function getStandingsHighlightPositionClass(highlighted: boolean, zone: StandingsZone | undefined): string {
  if (highlighted) return "bg-white text-[#981915]";
  return getStandingsZonePositionClass(zone);
}

export const STANDINGS_ZONE_LEGEND = [
  { zone: "promotion" as const, label: "Ascenso directo", className: "bg-emerald-500" },
  { zone: "playoff" as const, label: "Playoff", className: "bg-sky-400" },
  { zone: "relegation" as const, label: "Descenso", className: "bg-rose-500" },
];

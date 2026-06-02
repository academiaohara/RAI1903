import type { StandingsZone } from "@/types";

export type StandingsRowHighlight = "club" | "viewed" | "none";

/** Club row (Avilés) in blue; viewed rival in granate. Club wins when both match. */
export function getStandingsRowHighlight(
  teamId: string,
  viewedTeamId: string,
  clubTeamId?: string,
): StandingsRowHighlight {
  if (clubTeamId && teamId === clubTeamId) return "club";
  if (teamId === viewedTeamId) return "viewed";
  return "none";
}

export function getStandingsZonePositionClass(zone: StandingsZone | undefined): string {
  switch (zone) {
    case "promotion":
      return "bg-emerald-500 text-white";
    case "playoff":
      return "bg-sky-400 text-white";
    case "relegation":
      return "bg-rose-500 text-white";
    case "playout":
      return "bg-amber-500 text-white";
    default:
      return "bg-[#214C9B] text-white";
  }
}

export function getStandingsHighlightRowClass(highlight: StandingsRowHighlight | boolean): string {
  if (highlight === "club" || highlight === "viewed" || highlight === true) return "text-white";
  return "bg-white text-slate-700";
}

/** Row fill for data cells — never applied to the position column. */
export function getStandingsHighlightCellClass(highlight: StandingsRowHighlight | boolean): string {
  if (highlight === "club" || highlight === true) return "bg-[#214C9B]";
  if (highlight === "viewed") return "bg-[#981915]";
  return "";
}

export function isStandingsRowHighlighted(highlight: StandingsRowHighlight | boolean): boolean {
  return highlight === "club" || highlight === "viewed" || highlight === true;
}

export function getStandingsHighlightPositionClass(
  _highlighted: boolean,
  zone: StandingsZone | undefined,
  zoneColorClass?: string,
): string {
  if (zoneColorClass) return `${zoneColorClass} text-white`;
  return getStandingsZonePositionClass(zone);
}

export type StandingsLegendItem = {
  zone: StandingsZone;
  label: string;
  className: string;
  id?: string;
};

export const STANDINGS_ZONE_LEGEND: StandingsLegendItem[] = [
  { zone: "promotion", label: "Ascenso directo", className: "bg-emerald-500" },
  { zone: "playoff", label: "Playoff", className: "bg-sky-400" },
  { zone: "relegation", label: "Descenso", className: "bg-rose-500" },
];

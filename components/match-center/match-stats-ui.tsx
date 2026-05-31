"use client";

import type { MatchStatRow } from "@/types";

const HOME_COLOR = "#00D67D";
const AWAY_COLOR = "#6EB4E0";
const TRACK_COLOR = "#E0E0E0";

function parseNumericValue(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function StatPill({
  value,
  tone,
}: {
  value: string | number;
  tone: "home" | "away" | "none";
}) {
  if (tone === "none") {
    return <span className="text-sm font-semibold tabular-nums text-[#333333]">{value}</span>;
  }

  const bg = tone === "home" ? HOME_COLOR : AWAY_COLOR;
  return (
    <span
      className="inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums text-white"
      style={{ backgroundColor: bg }}
    >
      {value}
    </span>
  );
}

export function MatchStatBarRow({ row }: { row: MatchStatRow }) {
  const homeNum = parseNumericValue(row.home);
  const awayNum = parseNumericValue(row.away);
  const total = homeNum + awayNum;
  const homePct = total > 0 ? (homeNum / total) * 100 : 50;
  const awayPct = total > 0 ? (awayNum / total) * 100 : 50;
  const homeWins = homeNum > awayNum;
  const awayWins = awayNum > homeNum;

  return (
    <div className="border-t border-[#eeeeee] px-4 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex justify-start">
          <StatPill value={row.home} tone={homeWins ? "home" : "none"} />
        </div>
        <p className="text-center text-xs font-medium text-[#333333]">{row.label}</p>
        <div className="flex justify-end">
          <StatPill value={row.away} tone={awayWins ? "away" : "none"} />
        </div>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: TRACK_COLOR }}>
        <div className="h-full transition-all" style={{ width: `${homePct}%`, backgroundColor: HOME_COLOR }} />
        <div className="h-full transition-all" style={{ width: `${awayPct}%`, backgroundColor: AWAY_COLOR }} />
      </div>
    </div>
  );
}

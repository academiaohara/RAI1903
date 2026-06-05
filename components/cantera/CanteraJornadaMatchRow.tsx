import { formatMatchScore, isMatchPlayed } from "@/lib/match-result";
import { formatMatchDate } from "@/lib/utils";
import type { JornadaFixture } from "@/types/jornadas";
import { cn } from "@/lib/utils";

type CanteraJornadaMatchRowProps = {
  fixture: JornadaFixture;
  highlighted?: boolean;
  highlightTeamId?: string;
};

function scoreOrTime(fixture: JornadaFixture): string {
  if (isMatchPlayed(fixture) && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return formatMatchScore(fixture.homeScore, fixture.awayScore);
  }
  if (!isMatchPlayed(fixture) && fixture.kickoffTime) return fixture.kickoffTime;
  return formatMatchDate(fixture.date).split(",").pop()?.trim() ?? "—";
}

export function CanteraJornadaMatchRow({
  fixture,
  highlighted = false,
  highlightTeamId,
}: CanteraJornadaMatchRowProps) {
  const highlightHome = Boolean(highlightTeamId && fixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && fixture.awayTeamId === highlightTeamId);

  const nameClass = (isHighlight: boolean) =>
    cn(
      "min-w-0 truncate text-[11px] font-extrabold leading-tight sm:text-sm",
      isHighlight ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
    );

  return (
    <article
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 rounded-2xl border p-2.5 sm:gap-3 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <p className={cn(nameClass(highlightHome), "text-left")}>{fixture.homeTeamName}</p>

      <div
        className={cn(
          "min-w-[3.25rem] rounded-lg px-2 py-1.5 text-center text-[11px] font-extrabold tabular-nums sm:min-w-[4.5rem] sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
          highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
        )}
      >
        {scoreOrTime(fixture)}
      </div>

      <p className={cn(nameClass(highlightAway), "text-right")}>{fixture.awayTeamName}</p>
    </article>
  );
}

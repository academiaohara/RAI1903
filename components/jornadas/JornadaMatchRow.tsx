import { TeamCrest } from "@/components/TeamCrest";
import { getJornadaTeam } from "@/lib/jornadas-data";
import { formatMatchDate } from "@/lib/utils";
import type { JornadaFixture } from "@/types/jornadas";
import { cn } from "@/lib/utils";

type JornadaMatchRowProps = {
  fixture: JornadaFixture;
  highlighted?: boolean;
  highlightTeamId?: string;
};

function scoreOrTime(fixture: JornadaFixture): string {
  if (fixture.status === "finished" && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return `${fixture.homeScore} - ${fixture.awayScore}`;
  }
  if (fixture.kickoffTime) return fixture.kickoffTime;
  return formatMatchDate(fixture.date).split(",").pop()?.trim() ?? "—";
}

export function JornadaMatchRow({ fixture, highlighted = false, highlightTeamId }: JornadaMatchRowProps) {
  const home = getJornadaTeam(fixture.homeTeamId);
  const away = getJornadaTeam(fixture.awayTeamId);
  const highlightHome = Boolean(highlightTeamId && fixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && fixture.awayTeamId === highlightTeamId);

  return (
    <article
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {home ? <TeamCrest team={home} size="sm" className="shrink-0" /> : null}
        <p
          className={cn(
            "min-w-0 truncate text-sm font-extrabold",
            highlightHome ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
          )}
        >
          {fixture.homeTeamName}
        </p>
      </div>

      <div
        className={cn(
          "min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm font-extrabold tabular-nums",
          highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
        )}
      >
        {scoreOrTime(fixture)}
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <p
          className={cn(
            "min-w-0 truncate text-right text-sm font-extrabold",
            highlightAway ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
          )}
        >
          {fixture.awayTeamName}
        </p>
        {away ? <TeamCrest team={away} size="sm" className="shrink-0" /> : null}
      </div>
    </article>
  );
}

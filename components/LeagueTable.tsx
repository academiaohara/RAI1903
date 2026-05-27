import { RAI_TEAM_ID } from "@/data/mock";
import {
  STANDINGS_ZONE_LEGEND,
  getStandingsHighlightCellClass,
  getStandingsHighlightPositionClass,
  getStandingsHighlightRowClass,
} from "@/lib/standings-styles";
import { cn, formatGoalDifference, resultTone } from "@/lib/utils";
import type { Team } from "@/types";

type LeagueTableProps = {
  teams: Team[];
  compact?: boolean;
  highlightTeamId?: string;
  showLegend?: boolean;
};

export function LeagueTable({
  teams,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
  showLegend = !compact,
}: LeagueTableProps) {
  const rows = [...teams].sort((a, b) => a.position - b.position);
  const visibleRows = compact ? rows.slice(0, 10) : rows;

  return (
    <div className="space-y-3">
      {showLegend && (
        <div className="flex flex-wrap gap-4 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {STANDINGS_ZONE_LEGEND.map((item) => (
            <span key={item.zone} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", item.className)} aria-hidden />
              {item.label}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 md:hidden">
        {visibleRows.map((team) => {
          const diff = team.stats.goalsFor - team.stats.goalsAgainst;
          const highlighted = team.id === highlightTeamId;
          const rowClassName = getStandingsHighlightRowClass(highlighted);
          const highlightCellClassName = getStandingsHighlightCellClass(highlighted);
          const positionClassName = getStandingsHighlightPositionClass(highlighted, team.zone);

          return (
            <article
              key={team.id}
              className={cn(
                "overflow-hidden rounded-2xl border border-[#214C9B]/15 shadow-[0_8px_20px_rgba(17,24,39,0.04)]",
                highlighted ? "bg-white text-slate-700" : rowClassName,
              )}
            >
              <div className="flex items-stretch">
                <div className="flex shrink-0 items-center bg-white p-3 pr-2">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold tabular-nums",
                      positionClassName,
                    )}
                  >
                    {team.position}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-start justify-between gap-3 p-3 pl-0",
                    highlightCellClassName,
                    rowClassName,
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{compact ? team.shortName : team.name}</p>
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.06em]",
                        highlighted ? "text-white/80" : "text-slate-500",
                      )}
                    >
                      PJ {team.stats.played} · DG {formatGoalDifference(diff)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-2xl font-extrabold tabular-nums", highlighted ? "text-white" : "text-[#214C9B]")}>
                      {team.stats.points}
                    </p>
                    <p className={cn("text-[10px] font-bold uppercase", highlighted ? "text-white/80" : "text-slate-500")}>
                      Pts
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-4 gap-2 px-3 pb-3 text-center text-xs font-bold",
                  highlightCellClassName,
                  rowClassName,
                  highlighted ? "text-white/90" : "text-slate-600",
                )}
              >
                <span className={cn("rounded-xl px-2 py-1", highlighted ? "bg-white/15" : "bg-slate-50")}>
                  G {team.stats.won}
                </span>
                <span className={cn("rounded-xl px-2 py-1", highlighted ? "bg-white/15" : "bg-slate-50")}>
                  E {team.stats.drawn}
                </span>
                <span className={cn("rounded-xl px-2 py-1", highlighted ? "bg-white/15" : "bg-slate-50")}>
                  P {team.stats.lost}
                </span>
                <span className={cn("rounded-xl px-2 py-1", highlighted ? "bg-white/15" : "bg-slate-50")}>
                  {team.stats.goalsFor}:{team.stats.goalsAgainst}
                </span>
              </div>
              {!compact && (
                <div
                  className={cn(
                    "flex gap-1 px-3 pb-3",
                    highlightCellClassName,
                    rowClassName,
                  )}
                >
                  {team.form.map((result, index) => (
                    <span
                      key={`${team.id}-${result}-${index}`}
                      className={cn("flex h-6 w-6 items-center justify-center rounded text-[10px] font-extrabold", resultTone(result))}
                      title={result === "G" ? "Victoria" : result === "E" ? "Empate" : "Derrota"}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#214C9B]/20 bg-white md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#214C9B] text-[10px] uppercase tracking-[0.1em] text-white">
            <tr>
              <th className="px-2 py-2.5 text-center font-bold">#</th>
              <th className="px-2 py-2.5 font-bold">Equipo</th>
              {!compact ? (
                <>
                  <th className="px-2 py-2.5 text-center font-bold">PJ</th>
                  <th className="px-2 py-2.5 text-center font-bold">G</th>
                  <th className="px-2 py-2.5 text-center font-bold">E</th>
                  <th className="px-2 py-2.5 text-center font-bold">P</th>
                  <th className="px-2 py-2.5 text-center font-bold">GF:GC</th>
                </>
              ) : (
                <>
                  <th className="px-2 py-2.5 text-center font-bold">G</th>
                  <th className="px-2 py-2.5 text-center font-bold">E</th>
                  <th className="px-2 py-2.5 text-center font-bold">P</th>
                </>
              )}
              <th className="px-2 py-2.5 text-center font-bold">DG</th>
              <th className="px-2 py-2.5 text-center font-bold">Pts</th>
              {!compact && <th className="px-2 py-2.5 text-center font-bold">Forma</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((team) => {
              const diff = team.stats.goalsFor - team.stats.goalsAgainst;
              const highlighted = team.id === highlightTeamId;
              const rowClassName = getStandingsHighlightRowClass(highlighted);
              const highlightCellClassName = getStandingsHighlightCellClass(highlighted);
              const positionClassName = getStandingsHighlightPositionClass(highlighted, team.zone);
              const dataCellClassName = cn("px-2 py-2.5", highlightCellClassName, rowClassName);

              return (
                <tr
                  key={team.id}
                  className={cn("transition-colors", highlighted ? "bg-white text-slate-700" : rowClassName)}
                >
                  <td className="bg-white px-2 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1 text-xs font-extrabold tabular-nums",
                        positionClassName,
                      )}
                    >
                      {team.position}
                    </span>
                  </td>
                  <td className={dataCellClassName}>
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[9px] font-extrabold",
                          highlighted
                            ? "border-white/30 bg-white/15 text-white"
                            : "border-[#214C9B]/15 bg-white text-[#214C9B]",
                        )}
                      >
                        {team.crestInitials}
                      </span>
                      <span className="truncate font-bold">{compact ? team.shortName : team.name}</span>
                    </div>
                  </td>
                  {!compact ? (
                    <>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.played}</td>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.won}</td>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.drawn}</td>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.lost}</td>
                      <td
                        className={cn(
                          dataCellClassName,
                          "text-center tabular-nums",
                          highlighted ? "text-white/90" : "text-slate-600",
                        )}
                      >
                        {team.stats.goalsFor}:{team.stats.goalsAgainst}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.won}</td>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.drawn}</td>
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.lost}</td>
                    </>
                  )}
                  <td className={cn(dataCellClassName, "text-center font-semibold tabular-nums")}>
                    {formatGoalDifference(diff)}
                  </td>
                  <td
                    className={cn(
                      dataCellClassName,
                      "text-center text-base font-extrabold tabular-nums",
                      highlighted ? "text-white" : "text-[#214C9B]",
                    )}
                  >
                    {team.stats.points}
                  </td>
                  {!compact && (
                    <td className={dataCellClassName}>
                      <div className="flex justify-center gap-0.5">
                        {team.form.map((result, index) => (
                          <span
                            key={`${team.id}-${result}-${index}`}
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded text-[9px] font-extrabold",
                              resultTone(result),
                            )}
                            title={result === "G" ? "Victoria" : result === "E" ? "Empate" : "Derrota"}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

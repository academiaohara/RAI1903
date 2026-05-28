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
  showLegend = true,
}: LeagueTableProps) {
  const rows = [...teams].sort((a, b) => a.position - b.position);
  const visibleRows = compact ? rows.slice(0, 10) : rows;

  return (
    <div className="space-y-3">
      <div className="space-y-2 md:hidden">
        {visibleRows.map((team) => (
          <MobileStandingCard key={team.id} team={team} compact={compact} highlighted={team.id === highlightTeamId} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#214C9B]/20 bg-white md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#214C9B] text-[10px] uppercase tracking-[0.1em] text-white">
            <tr>
              <th className="w-7 p-0 text-center font-bold">#</th>
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
                  <td
                    className={cn(
                      "w-7 p-0 text-center text-[11px] font-extrabold tabular-nums",
                      positionClassName,
                    )}
                  >
                    {team.position}
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

      {showLegend && (
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 md:justify-start"
          role="list"
          aria-label="Leyenda de zonas en la clasificacion"
        >
          {STANDINGS_ZONE_LEGEND.map((item) => (
            <span key={item.zone} role="listitem" className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", item.className)} aria-hidden />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileStandingCard({ team, compact, highlighted }: { team: Team; compact: boolean; highlighted: boolean }) {
  const diff = team.stats.goalsFor - team.stats.goalsAgainst;
  const positionClassName = getStandingsHighlightPositionClass(highlighted, team.zone);
  const surfaceClassName = highlighted ? "border-[#981915]/35 bg-[#981915] text-white" : "border-[#214C9B]/15 bg-white text-slate-700";
  const mutedClassName = highlighted ? "text-white/75" : "text-slate-500";
  const statClassName = highlighted ? "border-white/15 bg-white/10 text-white" : "border-[#214C9B]/10 bg-slate-50 text-slate-700";

  return (
    <article className={cn("overflow-hidden rounded-2xl border shadow-[0_8px_20px_rgba(17,24,39,0.04)]", surfaceClassName)}>
      <div className="flex items-start gap-3 p-3 pb-2">
        <span
          className={cn(
            "flex h-11 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold tabular-nums",
            positionClassName,
          )}
        >
          {team.position}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[9px] font-extrabold",
                highlighted ? "border-white/25 bg-white/10 text-white" : "border-[#214C9B]/15 bg-white text-[#214C9B]",
              )}
            >
              {team.crestInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold leading-tight">{compact ? team.shortName : team.name}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.08em]", mutedClassName)}>
                {team.stats.played} partidos · DG {formatGoalDifference(diff)}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-center text-[#214C9B] shadow-sm">
          <p className="text-2xl font-extrabold leading-none tabular-nums">{team.stats.points}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em]">Pts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3 min-[360px]:grid-cols-3">
        <MobileStat label="PJ" value={team.stats.played} className={statClassName} />
        <MobileStat label="G" value={team.stats.won} className={statClassName} />
        <MobileStat label="E" value={team.stats.drawn} className={statClassName} />
        <MobileStat label="P" value={team.stats.lost} className={statClassName} />
        <MobileStat label="DG" value={formatGoalDifference(diff)} className={statClassName} />
        <MobileStat label="GF:GC" value={`${team.stats.goalsFor}:${team.stats.goalsAgainst}`} className={statClassName} />
      </div>

      {!compact && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t px-3 py-3",
            highlighted ? "border-white/15" : "border-slate-100",
          )}
        >
          <span className={cn("text-[10px] font-extrabold uppercase tracking-[0.1em]", mutedClassName)}>Forma</span>
          <div className="flex justify-end gap-1.5">
            {team.form.map((result, index) => (
              <span
                key={`${team.id}-${result}-${index}`}
                className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold", resultTone(result))}
                title={result === "G" ? "Victoria" : result === "E" ? "Empate" : "Derrota"}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function MobileStat({ label, value, className }: { label: string; value: string | number; className: string }) {
  return (
    <div className={cn("rounded-xl border px-2.5 py-2 text-center", className)}>
      <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

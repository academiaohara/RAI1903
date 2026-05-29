import Link from "next/link";
import { TeamCrest } from "@/components/TeamCrest";
import { RAI_TEAM_ID } from "@/data/mock";
import { equipoLigaHref } from "@/lib/equipo-liga";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import {
  STANDINGS_ZONE_LEGEND,
  getStandingsHighlightCellClass,
  getStandingsHighlightPositionClass,
  getStandingsHighlightRowClass,
  getStandingsRowHighlight,
  isStandingsRowHighlighted,
} from "@/lib/standings-styles";
import { cn, formatGoalDifference, resultTone } from "@/lib/utils";
import type { Team } from "@/types";

type LeagueTableProps = {
  teams: Team[];
  compact?: boolean;
  highlightTeamId?: string;
  /** With highlightTeamId: club row (Avilés) blue, viewed team granate. */
  clubHighlightTeamId?: string;
  showLegend?: boolean;
  gender?: PrimerEquipoGender;
};

export function LeagueTable({
  teams,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
  clubHighlightTeamId,
  showLegend = true,
  gender = "masculino",
}: LeagueTableProps) {
  const visibleRows = [...teams].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/20 bg-white">
        <table className="w-full text-left text-[10px] md:text-sm">
          <thead className="bg-[#214C9B] text-[8px] uppercase tracking-[0.06em] text-white md:text-[10px] md:tracking-[0.1em]">
            <tr>
              <th className="w-5 p-0 text-center font-bold md:w-7">#</th>
              <th className="px-1 py-1.5 font-bold md:px-2 md:py-2.5">Equipo</th>
              {!compact ? (
                <>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">PJ</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">G</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">E</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">P</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">GF:GC</th>
                </>
              ) : (
                <>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">PJ</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">G</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">E</th>
                  <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">P</th>
                </>
              )}
              <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">DG</th>
              <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">Pts</th>
              {!compact && <th className="px-0.5 py-1.5 text-center font-bold md:px-2 md:py-2.5">Forma</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((team) => {
              const diff = team.stats.goalsFor - team.stats.goalsAgainst;
              const rowHighlight = clubHighlightTeamId
                ? getStandingsRowHighlight(team.id, highlightTeamId, clubHighlightTeamId)
                : team.id === highlightTeamId;
              const highlighted = isStandingsRowHighlighted(rowHighlight);
              const rowClassName = getStandingsHighlightRowClass(rowHighlight);
              const highlightCellClassName = getStandingsHighlightCellClass(rowHighlight);
              const positionClassName = getStandingsHighlightPositionClass(false, team.zone);
              const dataCellClassName = cn(
                "px-0.5 py-1.5 md:px-2 md:py-2.5",
                highlightCellClassName,
                rowClassName,
              );
              const teamLabel = compact ? team.shortName : team.name;

              return (
                <tr
                  key={team.id}
                  className={cn("transition-colors", highlighted ? "bg-white text-slate-700" : rowClassName)}
                >
                  <td
                    className={cn(
                      "w-5 p-0 text-center text-[9px] font-extrabold tabular-nums md:w-7 md:text-[11px]",
                      positionClassName,
                    )}
                  >
                    {team.position}
                  </td>
                  <td className={dataCellClassName}>
                    <Link
                      href={equipoLigaHref(gender, team.id)}
                      className="group/team flex min-w-0 items-center gap-1 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-1 md:gap-2"
                      aria-label={`Ver ficha de ${team.name}`}
                    >
                      <TeamCrest team={team} size="sm" className="shrink-0" />
                      <span className="max-w-[4.5rem] truncate font-bold group-hover/team:underline group-hover/team:decoration-[#214C9B]/40 group-hover/team:underline-offset-2 sm:max-w-none md:max-w-none">
                        <span className="md:hidden">{team.shortName}</span>
                        <span className="hidden md:inline">{teamLabel}</span>
                      </span>
                    </Link>
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
                      <td className={cn(dataCellClassName, "text-center tabular-nums")}>{team.stats.played}</td>
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
                      "text-center text-xs font-extrabold tabular-nums md:text-base",
                      highlighted ? "text-white" : "text-[#214C9B]",
                    )}
                  >
                    {team.stats.points}
                  </td>
                  {!compact && (
                    <td className={dataCellClassName}>
                      <div className="flex justify-center gap-px md:gap-0.5">
                        {team.form.map((result, index) => (
                          <span
                            key={`${team.id}-${result}-${index}`}
                            className={cn(
                              "flex h-3.5 w-3.5 items-center justify-center rounded text-[7px] font-extrabold md:h-5 md:w-5 md:text-[9px]",
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

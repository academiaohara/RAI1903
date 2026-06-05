import Link from "next/link";
import { TeamCrest } from "@/components/TeamCrest";
import { useSeasonOptional } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { canLinkEquipoLiga, equipoLigaHref } from "@/lib/equipo-liga";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import {
  STANDINGS_ZONE_LEGEND,
  getStandingsHighlightCellClass,
  getStandingsHighlightPositionClass,
  getStandingsHighlightRowClass,
  getStandingsRowHighlight,
  isStandingsRowHighlighted,
  type StandingsLegendItem,
} from "@/lib/standings-styles";
import { cn, formatGoalDifference, resultTone } from "@/lib/utils";
import type { Team } from "@/types";

type LeagueTableProps = {
  teams: Team[];
  compact?: boolean;
  highlightTeamId?: string;
  /** With highlightTeamId: club row (Avilés) blue, viewed team granate. */
  clubHighlightTeamId?: string;
  /** When set, any matching row uses the club (blue) highlight. */
  isClubHighlight?: (team: Team) => boolean;
  showCrests?: boolean;
  showLegend?: boolean;
  gender?: PrimerEquipoGender;
  zoneLegend?: StandingsLegendItem[];
};

export function LeagueTable({
  teams,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
  clubHighlightTeamId,
  isClubHighlight,
  showCrests: showCrestsProp,
  showLegend = true,
  gender = "masculino",
  zoneLegend,
}: LeagueTableProps) {
  const season = useSeasonOptional();
  const legend = zoneLegend ?? STANDINGS_ZONE_LEGEND;
  const showCrests = showCrestsProp ?? gender !== "femenino";
  const visibleRows = [...teams].sort((a, b) => a.position - b.position);

  const statColClass =
    "min-w-[1.35rem] px-0.5 py-1 text-center font-bold tabular-nums sm:min-w-0 sm:px-1.5 md:px-2 md:py-2.5";
  const resultStatColClass = cn(statColClass, compact && "hidden sm:table-cell");
  const goalStatColClass = cn(statColClass, "hidden sm:table-cell");

  return (
    <div className="min-w-0 space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/20 bg-white [-webkit-overflow-scrolling:touch]">
        <table className="w-full table-fixed text-left text-[10px] sm:table-auto md:text-sm">
          <thead className="bg-[#214C9B] text-[8px] uppercase tracking-[0.05em] text-white md:text-[10px] md:tracking-[0.1em]">
            <tr>
              <th className="w-[1.35rem] p-0 text-center font-bold sm:w-5 md:w-7">#</th>
              <th className="px-1 py-1 font-bold sm:px-1.5 sm:py-1.5 md:px-2 md:py-2.5">Equipo</th>
              <th className={statColClass}>PJ</th>
              <th className={resultStatColClass}>G</th>
              <th className={resultStatColClass}>E</th>
              <th className={resultStatColClass}>P</th>
              <th className={goalStatColClass}>GF</th>
              <th className={goalStatColClass}>GC</th>
              <th className={cn(statColClass, "min-w-[1.5rem] sm:min-w-[2rem]")}>DG</th>
              <th className={cn(statColClass, "min-w-[1.65rem] sm:min-w-[2.25rem]")}>Pts</th>
              {!compact && <th className={cn(statColClass, "hidden md:table-cell")}>Forma</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((team) => {
              const diff = team.stats.goalsFor - team.stats.goalsAgainst;
              const rowHighlight = isClubHighlight?.(team)
                ? ("club" as const)
                : clubHighlightTeamId
                  ? getStandingsRowHighlight(team.id, highlightTeamId, clubHighlightTeamId)
                  : team.id === highlightTeamId;
              const highlighted = isStandingsRowHighlighted(rowHighlight);
              const rowClassName = getStandingsHighlightRowClass(rowHighlight);
              const highlightCellClassName = getStandingsHighlightCellClass(rowHighlight);
              const positionClassName = getStandingsHighlightPositionClass(false, team.zone, team.zoneColorClass);
              const dataCellClassName = cn(
                "px-0.5 py-1 tabular-nums sm:px-1.5 sm:py-1.5 md:px-2 md:py-2.5",
                highlightCellClassName,
                rowClassName,
              );
              const teamLabel = compact ? team.shortName : team.name;
              const teamLinkable = canLinkEquipoLiga(gender, team.id, season?.bundles);
              const teamCellContent = (
                <>
                  {showCrests ? (
                    <TeamCrest team={team} size="sm" className="h-4 w-4 shrink-0 sm:h-7 sm:w-7" />
                  ) : null}
                  <span className="min-w-0 font-bold leading-tight group-hover/team:underline group-hover/team:decoration-[#214C9B]/40 group-hover/team:underline-offset-2 sm:truncate">
                    <span className="md:hidden">{team.shortName}</span>
                    <span className="hidden md:inline">{teamLabel}</span>
                  </span>
                </>
              );

              return (
                <tr
                  key={team.id}
                  className={cn("transition-colors", highlighted ? "bg-white text-slate-700" : rowClassName)}
                >
                  <td
                    className={cn(
                      "w-[1.35rem] p-0 text-center text-[8px] font-extrabold tabular-nums sm:w-5 sm:text-[9px] md:w-7 md:text-[11px]",
                      positionClassName,
                    )}
                  >
                    {team.position}
                  </td>
                  <td className={dataCellClassName}>
                    {teamLinkable ? (
                      <Link
                        href={equipoLigaHref(gender, team.id)}
                        className="group/team flex min-w-0 items-center gap-0.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-1 sm:gap-1 md:gap-2"
                        aria-label={`Ver ficha de ${team.name}`}
                      >
                        {teamCellContent}
                      </Link>
                    ) : (
                      <div className="flex min-w-0 items-center gap-0.5 sm:gap-1 md:gap-2">{teamCellContent}</div>
                    )}
                  </td>
                  <td className={cn(dataCellClassName, "text-center")}>{team.stats.played}</td>
                  <td className={cn(dataCellClassName, "text-center", compact && "hidden sm:table-cell")}>
                    {team.stats.won}
                  </td>
                  <td className={cn(dataCellClassName, "text-center", compact && "hidden sm:table-cell")}>
                    {team.stats.drawn}
                  </td>
                  <td className={cn(dataCellClassName, "text-center", compact && "hidden sm:table-cell")}>
                    {team.stats.lost}
                  </td>
                  <td
                    className={cn(
                      dataCellClassName,
                      "hidden text-center sm:table-cell",
                      highlighted ? "text-white/90" : "text-slate-600",
                    )}
                  >
                    {team.stats.goalsFor}
                  </td>
                  <td
                    className={cn(
                      dataCellClassName,
                      "hidden text-center sm:table-cell",
                      highlighted ? "text-white/90" : "text-slate-600",
                    )}
                  >
                    {team.stats.goalsAgainst}
                  </td>
                  <td className={cn(dataCellClassName, "text-center font-semibold")}>
                    {formatGoalDifference(diff)}
                  </td>
                  <td
                    className={cn(
                      dataCellClassName,
                      "text-center text-[10px] font-extrabold sm:text-xs md:text-base",
                      highlighted ? "text-white" : "text-[#214C9B]",
                    )}
                  >
                    {team.stats.points}
                  </td>
                  {!compact && (
                    <td className={cn(dataCellClassName, "hidden md:table-cell")}>
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
          className="flex flex-wrap justify-center gap-x-2 gap-y-1.5 px-1 text-[8px] font-bold uppercase tracking-[0.04em] text-slate-500 md:justify-start md:gap-x-4 md:gap-y-2 md:text-[10px] md:tracking-[0.08em]"
          role="list"
          aria-label="Leyenda de zonas en la clasificacion"
        >
          {legend.map((item) => (
            <span key={item.id ?? item.zone} role="listitem" className="inline-flex shrink-0 items-center gap-1">
              <span className={cn("h-2 w-2 shrink-0 rounded-sm md:h-2.5 md:w-2.5", item.className)} aria-hidden />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

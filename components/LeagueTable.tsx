import { RAI_TEAM_ID } from "@/data/mock";
import { STANDINGS_ZONE_LEGEND, standingsZoneRowClass } from "@/lib/standings-styles";
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

      <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/20 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#214C9B] text-[10px] uppercase tracking-[0.1em] text-white">
            <tr>
              <th className="px-2 py-2.5 text-center font-bold">#</th>
              <th className="px-2 py-2.5 font-bold">Equipo</th>
              {!compact && (
                <>
                  <th className="px-2 py-2.5 text-center font-bold">PJ</th>
                  <th className="px-2 py-2.5 text-center font-bold">G</th>
                  <th className="px-2 py-2.5 text-center font-bold">E</th>
                  <th className="px-2 py-2.5 text-center font-bold">P</th>
                  <th className="px-2 py-2.5 text-center font-bold">GF:GC</th>
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

              return (
                <tr
                  key={team.id}
                  className={cn("transition-colors", standingsZoneRowClass(team.zone, highlighted))}
                >
                  <td className="px-2 py-2.5 text-center font-extrabold tabular-nums">{team.position}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/15 bg-white text-[9px] font-extrabold text-[#214C9B]">
                        {team.crestInitials}
                      </span>
                      <span className="truncate font-bold">{compact ? team.shortName : team.name}</span>
                    </div>
                  </td>
                  {!compact && (
                    <>
                      <td className="px-2 py-2.5 text-center tabular-nums">{team.stats.played}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums">{team.stats.won}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums">{team.stats.drawn}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums">{team.stats.lost}</td>
                      <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">
                        {team.stats.goalsFor}:{team.stats.goalsAgainst}
                      </td>
                    </>
                  )}
                  <td className="px-2 py-2.5 text-center font-semibold tabular-nums">{formatGoalDifference(diff)}</td>
                  <td className="px-2 py-2.5 text-center text-base font-extrabold tabular-nums text-[#214C9B]">
                    {team.stats.points}
                  </td>
                  {!compact && (
                    <td className="px-2 py-2.5">
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

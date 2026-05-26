import { RAI_TEAM_ID } from "@/data/mock";
import { resultTone } from "@/lib/utils";
import type { Team } from "@/types";

export function LeagueTable({ teams, compact = false }: { teams: Team[]; compact?: boolean }) {
  const rows = [...teams].sort((a, b) => a.position - b.position);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#981915]/20 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#981915] text-[11px] uppercase tracking-[0.18em] text-white">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Equipo</th>
            {!compact && <th className="px-3 py-3 text-center">PJ</th>}
            <th className="px-3 py-3 text-center">DG</th>
            <th className="px-3 py-3 text-center">Pts</th>
            {!compact && <th className="px-3 py-3">Forma</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.slice(0, compact ? 10 : rows.length).map((team) => {
            const diff = team.stats.goalsFor - team.stats.goalsAgainst;
            return (
              <tr key={team.id} className={team.id === RAI_TEAM_ID ? "bg-red-50 text-[#981915]" : "text-slate-700"}>
                <td className="px-3 py-3 font-black">{team.position}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#981915]/20 bg-white text-[10px] font-black text-[#214C9B]">{team.crestInitials}</span>
                    <span className="font-bold">{compact ? team.shortName : team.name}</span>
                  </div>
                </td>
                {!compact && <td className="px-3 py-3 text-center">{team.stats.played}</td>}
                <td className="px-3 py-3 text-center">{diff > 0 ? `+${diff}` : diff}</td>
                <td className="px-3 py-3 text-center text-base font-black text-[#981915]">{team.stats.points}</td>
                {!compact && (
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {team.form.map((result, index) => (
                        <span key={`${team.id}-${result}-${index}`} className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${resultTone(result)}`}>
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
  );
}

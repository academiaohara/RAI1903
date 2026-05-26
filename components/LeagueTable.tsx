import { RAI_TEAM_ID } from "@/data/mock";
import { resultTone } from "@/lib/utils";
import type { Team } from "@/types";

export function LeagueTable({ teams, compact = false }: { teams: Team[]; compact?: boolean }) {
  const rows = [...teams].sort((a, b) => a.position - b.position);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Equipo</th>
            {!compact && <th className="px-3 py-3 text-center">PJ</th>}
            <th className="px-3 py-3 text-center">DG</th>
            <th className="px-3 py-3 text-center">Pts</th>
            {!compact && <th className="px-3 py-3">Forma</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.slice(0, compact ? 10 : rows.length).map((team) => {
            const diff = team.stats.goalsFor - team.stats.goalsAgainst;
            return (
              <tr key={team.id} className={team.id === RAI_TEAM_ID ? "bg-[#214C9B]/25 text-white" : "text-slate-300"}>
                <td className="px-3 py-3 font-black">{team.position}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[10px] font-black">{team.crestInitials}</span>
                    <span className="font-bold">{compact ? team.shortName : team.name}</span>
                  </div>
                </td>
                {!compact && <td className="px-3 py-3 text-center">{team.stats.played}</td>}
                <td className="px-3 py-3 text-center">{diff > 0 ? `+${diff}` : diff}</td>
                <td className="px-3 py-3 text-center text-base font-black text-white">{team.stats.points}</td>
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

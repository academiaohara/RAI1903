import { Badge } from "@/components/Badge";
import { RAI_TEAM_ID } from "@/data/mock";
import { formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";

export function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const avilesHome = match.homeTeamId === RAI_TEAM_ID;
  const avilesAway = match.awayTeamId === RAI_TEAM_ID;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-300/30 hover:bg-white/[0.07]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge tone={match.status === "finished" ? "slate" : "blue"}>{match.status === "finished" ? "Finalizado" : "Programado"}</Badge>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">J{match.matchday}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className={`text-sm font-black ${avilesHome ? "text-white" : "text-slate-300"}`}>{match.homeTeam}</p>
        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center font-black text-white">
          {match.status === "finished" ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        </div>
        <p className={`text-right text-sm font-black ${avilesAway ? "text-white" : "text-slate-300"}`}>{match.awayTeam}</p>
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>{formatMatchDate(match.date)}</span>
          <span>{match.venue}</span>
        </div>
      )}
    </article>
  );
}

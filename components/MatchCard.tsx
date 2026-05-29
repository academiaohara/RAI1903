import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureScorePill } from "@/components/MatchFixtureScorePill";
import { RAI_TEAM_ID } from "@/data/mock";
import { matchCompetitionShortLabel, matchFixtureMeta } from "@/lib/competition-labels";
import { getTeam } from "@/lib/fixtures";
import { getTeamCrestById } from "@/lib/team-crests";
import { matchFixtureCardClassName } from "@/lib/match-card-styles";
import { formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";

export function MatchCard({
  match,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
}: {
  match: Match;
  compact?: boolean;
  highlightTeamId?: string;
}) {
  const avilesHome = match.homeTeamId === highlightTeamId;
  const avilesAway = match.awayTeamId === highlightTeamId;

  return (
    <article className={matchFixtureCardClassName}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <Badge tone={match.status === "finished" ? "slate" : "blue"}>{match.status === "finished" ? "Finalizado" : "Programado"}</Badge>
        <span className="flex shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[#981915]">
          <CompetitionLogo competition={match.competition} alt={matchCompetitionShortLabel(match)} size="xs" />
          {matchFixtureMeta(match)}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <p className={`min-w-0 break-words text-sm font-extrabold leading-snug ${avilesHome ? "text-[#214C9B]" : "text-slate-700"}`}>{match.homeTeam}</p>
        <MatchFixtureScorePill
          homeLogo={getTeamCrestById(match.homeTeamId, getTeam(match.homeTeamId)?.crestInitials)}
          homeTeam={match.homeTeam}
          awayLogo={getTeamCrestById(match.awayTeamId, getTeam(match.awayTeamId)?.crestInitials)}
          awayTeam={match.awayTeam}
          label={match.status === "finished" ? `${match.homeScore} - ${match.awayScore}` : "vs"}
        />
        <p className={`min-w-0 break-words text-right text-sm font-extrabold leading-snug ${avilesAway ? "text-[#214C9B]" : "text-slate-700"}`}>{match.awayTeam}</p>
      </div>
      {compact ? (
        match.status === "scheduled" && (
          <p className="mt-2 text-xs font-bold text-slate-600">{formatMatchDate(match.date)}</p>
        )
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>{formatMatchDate(match.date)}</span>
          <span>{match.venue}</span>
        </div>
      )}
    </article>
  );
}

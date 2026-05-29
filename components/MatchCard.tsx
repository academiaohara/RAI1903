import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureTeamLinks } from "@/components/MatchFixtureTeamLinks";
import { RAI_TEAM_ID } from "@/data/mock";
import { matchCompetitionShortLabel, matchFixtureMeta } from "@/lib/competition-labels";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { matchFixtureCardClassName } from "@/lib/match-card-styles";
import { formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";

export function MatchCard({
  match,
  compact = false,
  highlightTeamId = RAI_TEAM_ID,
  gender = "masculino",
}: {
  match: Match;
  compact?: boolean;
  highlightTeamId?: string;
  gender?: PrimerEquipoGender;
}) {
  const scoreLabel = match.status === "finished" ? `${match.homeScore} - ${match.awayScore}` : "vs";

  return (
    <article className={matchFixtureCardClassName}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <Badge tone={match.status === "finished" ? "slate" : "blue"}>{match.status === "finished" ? "Finalizado" : "Programado"}</Badge>
        <span className="flex shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[#981915]">
          <CompetitionLogo competition={match.competition} alt={matchCompetitionShortLabel(match)} size="xs" />
          {matchFixtureMeta(match)}
        </span>
      </div>
      <MatchFixtureTeamLinks
        match={match}
        gender={gender}
        highlightTeamId={highlightTeamId}
        scoreLabel={scoreLabel}
      />
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

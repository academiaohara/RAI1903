import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { MatchFixtureScorePill } from "@/components/MatchFixtureScorePill";
import { matchCompetitionShortLabel, matchFixtureMeta } from "@/lib/competition-labels";
import { getCronicaForMatch } from "@/lib/match-articles";
import { getAvilesMatchResult, getTeam } from "@/lib/fixtures";
import { getTeamCrestById } from "@/lib/team-crests";
import { matchFixtureCardClassName } from "@/lib/match-card-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { formatMatchDate } from "@/lib/utils";
import type { Match } from "@/types";
import type { Route } from "next";
import { RAI_TEAM_ID } from "@/data/mock";

type RecentMatchCardProps = {
  match: Match;
  gender?: PrimerEquipoGender;
};

export function RecentMatchCard({ match, gender = "masculino" }: RecentMatchCardProps) {
  const result = getAvilesMatchResult(match);
  const cronica = getCronicaForMatch(match.id, gender);
  const href = (cronica ? `${primerEquipoBase(gender)}/cronicas/${cronica.id}` : `${primerEquipoBase(gender)}/cronicas`) as Route;
  const avilesHome = match.homeTeamId === RAI_TEAM_ID;
  const avilesAway = match.awayTeamId === RAI_TEAM_ID;

  return (
    <Link href={href} className={matchFixtureCardClassName}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <Badge tone={result === "W" ? "green" : result === "D" ? "amber" : result === "L" ? "red" : "slate"}>
          {result === "W" ? "Victoria" : result === "D" ? "Empate" : result === "L" ? "Derrota" : "Finalizado"}
        </Badge>
        <span className="flex shrink-0 items-center justify-end gap-1.5 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[#981915]">
          <CompetitionLogo competition={match.competition} alt={matchCompetitionShortLabel(match)} size="xs" />
          {matchFixtureMeta(match)}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <p className={`min-w-0 break-words text-sm font-extrabold leading-snug ${avilesHome ? "text-[#214C9B]" : "text-slate-800"}`}>{match.homeTeam}</p>
        <MatchFixtureScorePill
          homeLogo={getTeamCrestById(match.homeTeamId, getTeam(match.homeTeamId)?.crestInitials)}
          homeTeam={match.homeTeam}
          awayLogo={getTeamCrestById(match.awayTeamId, getTeam(match.awayTeamId)?.crestInitials)}
          awayTeam={match.awayTeam}
          label={`${match.homeScore} - ${match.awayScore}`}
        />
        <p className={`min-w-0 break-words text-right text-sm font-extrabold leading-snug ${avilesAway ? "text-[#214C9B]" : "text-slate-800"}`}>{match.awayTeam}</p>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-600">{formatMatchDate(match.date)} · Pulsa para leer la cronica</p>
    </Link>
  );
}

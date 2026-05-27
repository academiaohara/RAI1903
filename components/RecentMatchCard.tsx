import Link from "next/link";
import { Badge } from "@/components/Badge";
import { matchFixtureMeta } from "@/lib/competition-labels";
import { getCronicaForMatch } from "@/lib/match-articles";
import { getAvilesMatchResult } from "@/lib/fixtures";
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
        <span className="shrink-0 text-right text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[#981915]">
          {matchFixtureMeta(match)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <p className={`text-sm font-extrabold leading-snug ${avilesHome ? "text-[#214C9B]" : "text-slate-800"}`}>{match.homeTeam}</p>
        <div className="rounded-2xl bg-[#214C9B] px-3 py-2 text-center text-sm font-extrabold text-white">
          {match.homeScore} - {match.awayScore}
        </div>
        <p className={`text-right text-sm font-extrabold leading-snug ${avilesAway ? "text-[#214C9B]" : "text-slate-800"}`}>{match.awayTeam}</p>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-600">{formatMatchDate(match.date)} · Pulsa para leer la cronica</p>
    </Link>
  );
}

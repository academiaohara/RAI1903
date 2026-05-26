import Link from "next/link";
import { Badge } from "@/components/Badge";
import { getCronicaForMatch } from "@/lib/match-articles";
import { getAvilesMatchResult } from "@/lib/fixtures";
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
    <Link
      href={href}
      className="block rounded-2xl border border-[#214C9B]/25 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition hover:border-[#214C9B]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge tone={result === "W" ? "green" : result === "D" ? "amber" : result === "L" ? "red" : "slate"}>
          {result === "W" ? "Victoria" : result === "D" ? "Empate" : result === "L" ? "Derrota" : "Finalizado"}
        </Badge>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">J{match.matchday}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className={`text-sm font-extrabold ${avilesHome ? "text-[#214C9B]" : "text-slate-800"}`}>{match.homeTeam}</p>
        <div className="rounded-2xl bg-[#214C9B] px-3 py-2 text-center text-sm font-extrabold text-white">
          {match.homeScore} - {match.awayScore}
        </div>
        <p className={`text-right text-sm font-extrabold ${avilesAway ? "text-[#214C9B]" : "text-slate-800"}`}>{match.awayTeam}</p>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-600">{formatMatchDate(match.date)} · Pulsa para leer la cronica</p>
    </Link>
  );
}

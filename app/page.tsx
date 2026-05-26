import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import { NewsTicker } from "@/components/NewsTicker";
import { PageHero } from "@/components/PageHero";
import { RecentMatchCard } from "@/components/RecentMatchCard";
import { RAI_TEAM_ID, newsItems, players, teams } from "@/data/mock";
import { getLatestAvilesMatches, getNextAvilesMatch, getUpcomingAvilesMatches } from "@/lib/fixtures";
import { getCronicaForMatch, getPreviaForMatch } from "@/lib/match-articles";
import { primerEquipoBase } from "@/lib/primer-equipo";
import { formatMatchDate } from "@/lib/utils";
import type { Route } from "next";
import type { Match } from "@/types";

export default function HomePage() {
  const nextMatch = getNextAvilesMatch();
  const latestMatches = getLatestAvilesMatches();
  const latestMatch = latestMatches[0];
  const upcomingMatches = getUpcomingAvilesMatches();
  const latestCronica = latestMatch ? getCronicaForMatch(latestMatch.id) : undefined;
  const nextPrevia = nextMatch ? getPreviaForMatch(nextMatch.id) : undefined;
  const statHighlights = [
    { label: "Mas goles", player: [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0], valueKey: "goals", suffix: "goles" },
    { label: "Mas asistencias", player: [...players].sort((a, b) => b.stats.assists - a.stats.assists)[0], valueKey: "assists", suffix: "asist." },
    { label: "Mas amarillas", player: [...players].sort((a, b) => b.stats.yellowCards - a.stats.yellowCards)[0], valueKey: "yellowCards", suffix: "TA" },
    { label: "Mas rojas", player: [...players].sort((a, b) => b.stats.redCards - a.stats.redCards)[0], valueKey: "redCards", suffix: "TR" },
    { label: "Porterias imbatidas", player: players.find((player) => player.position === "Portero") ?? players[0], fixedValue: 4, suffix: "porterias" },
    { label: "Nota media", player: [...players].sort((a, b) => b.rating - a.rating)[0], fixedValue: [...players].sort((a, b) => b.rating - a.rating)[0].rating.toFixed(2), suffix: "media" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHero title="Real Aviles Industrial" description="Inicio blanquiazul para seguir ultimo partido, proxima previa, clasificacion, forma, calendario, stats y noticiero." />

      <section className="grid gap-4">
        {latestMatch && (
          <MatchBanner
            match={latestMatch}
            label="Ultimo partido"
            href={(latestCronica ? `${primerEquipoBase("masculino")}/cronicas/${latestCronica.id}` : `${primerEquipoBase("masculino")}/cronicas`) as Route}
            action="Entrar en la cronica"
          />
        )}
        {nextMatch && (
          <MatchBanner
            match={nextMatch}
            label="Siguiente partido"
            href={(nextPrevia ? `${primerEquipoBase("masculino")}/previas/${nextPrevia.id}` : `${primerEquipoBase("masculino")}/previas`) as Route}
            action="Entrar en la previa"
          />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <LeagueTableCard eyebrow="Estado competitivo" title="Clasificacion" teams={teams} highlightTeamId={RAI_TEAM_ID} compact />
        <Card eyebrow="Jugadores destacados" title="Stats de plantilla">
          <ul className="space-y-3">
            {statHighlights.map((item) => {
              const value = "fixedValue" in item ? item.fixedValue : item.player.stats[item.valueKey];
              return (
                <li key={item.label} className="flex items-center justify-between gap-4 border-b border-[#214C9B]/10 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
                    <p className="mt-1 truncate text-base font-extrabold uppercase text-[#214C9B]">{item.player.displayName}</p>
                  </div>
                  <p className="shrink-0 text-right text-2xl font-extrabold text-slate-950">
                    {value} <span className="text-xs font-bold text-slate-500">{item.suffix}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-3">{latestMatches.map((match) => <RecentMatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Calendario" title="Proximos 5 partidos">
          <div className="space-y-3">{upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
      </section>

      <Card eyebrow="Noticiero" title="Actualidad en movimiento">
        <NewsTicker items={newsItems} />
      </Card>
    </div>
  );
}

function MatchBanner({ match, label, href, action }: { match: Match; label: string; href: Route; action: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[2rem] border border-[#214C9B]/25 bg-white shadow-[0_18px_45px_rgba(17,24,39,0.08)] transition hover:-translate-y-1 hover:border-[#214C9B]">
      <div className="grid items-stretch md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#214C9B]/20 bg-blue-50 text-xs font-extrabold text-[#214C9B]">J{match.matchday}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{match.homeTeam}</p>
          </div>
        </div>
        <div className="flex min-w-40 flex-col items-center justify-center bg-[#214C9B] px-8 py-5 text-white">
          <p className="text-4xl font-extrabold">{match.status === "finished" ? `${match.homeScore}-${match.awayScore}` : "vs"}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-normal text-white/80">{formatMatchDate(match.date)}</p>
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">{match.competition}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{match.awayTeam}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#214C9B]/20 px-4 py-2 text-sm font-bold text-[#214C9B] transition group-hover:bg-[#214C9B] group-hover:text-white">
            {action} <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

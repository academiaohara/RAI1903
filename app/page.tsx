import Link from "next/link";
import { ArrowUpRight, Newspaper, Shield, Trophy } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { newsItems, players, RAI_TEAM_ID, teams } from "@/data/mock";
import { getLatestAvilesMatches, getNextAvilesMatch, getUpcomingAvilesMatches } from "@/lib/fixtures";
import { formatDate, formatMatchDate, resultTone } from "@/lib/utils";
import type { Match } from "@/types";

const quickLinks = [
  { href: "/primer-equipo/plantilla", label: "Primer Equipo", description: "Plantilla, noticias y competicion", icon: Shield },
  { href: "/cantera/filial", label: "Cantera", description: "Filial y Juvenil A", icon: Trophy },
  { href: "/prensa/noticias-externas", label: "Prensa", description: "Medios, enlaces y archivo", icon: Newspaper },
] as const;

export default function HomePage() {
  const nextMatch = getNextAvilesMatch();
  const latestMatches = getLatestAvilesMatches();
  const latestMatch = latestMatches[0];
  const upcomingMatches = getUpcomingAvilesMatches();
  const aviles = teams.find((team) => team.id === RAI_TEAM_ID) ?? teams[0];
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
      <PageHero eyebrow="Web fan no oficial" title="Real Aviles Industrial" description="Inicio blanquiazul para seguir ultimo partido, proxima previa, clasificacion, forma, calendario, stats y noticiero." />

      <section className="grid gap-4">
        {latestMatch && <MatchBanner match={latestMatch} label="Ultimo partido" href="/prensa/noticias-externas" action="Entrar en la cronica" />}
        {nextMatch && <MatchBanner match={nextMatch} label="Siguiente partido" href="/prensa/noticias-externas" action="Entrar en la previa" />}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card eyebrow="Estado competitivo" title="Clasificacion compacta">
          <LeagueTable teams={teams} compact />
        </Card>
        <Card eyebrow="Accesos rapidos" title="Lo basico a un click">
          <div className="grid gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group rounded-3xl border border-[#214C9B]/25 bg-white p-5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition hover:-translate-y-1 hover:border-[#214C9B]">
                  <div className="flex items-center justify-between gap-4">
                    <Icon className="text-[#214C9B]" />
                    <ArrowUpRight className="text-[#981915] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold uppercase text-[#214C9B]">{item.label}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.85fr]">
        <Card eyebrow="Forma" title="Ultimos 5">
          <div className="flex gap-2">
            {aviles.form.map((result, index) => (
              <span key={`${result}-${index}`} className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold ${resultTone(result)}`}>
                {result}
              </span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[{ label: "Posicion", value: `${aviles.position}º` }, { label: "Puntos", value: aviles.stats.points }, { label: "Goles a favor", value: aviles.stats.goalsFor }, { label: "Porterias a cero", value: 4 }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#214C9B]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-3">{latestMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Calendario" title="Proximos 5 partidos">
          <div className="space-y-3">{upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
      </section>

      <Card eyebrow="Jugadores destacados" title="Fila de stats">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {statHighlights.map((item) => {
            const value = "fixedValue" in item ? item.fixedValue : item.player.stats[item.valueKey];
            return (
              <div key={item.label} className="rounded-3xl border border-[#214C9B]/20 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
                <p className="mt-3 text-lg font-extrabold uppercase text-[#214C9B]">{item.player.displayName}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{value} <span className="text-sm font-bold text-slate-500">{item.suffix}</span></p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card eyebrow="Noticiero" title="Carrusel horizontal">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {newsItems.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="min-w-[280px] max-w-[320px] rounded-3xl border border-[#214C9B]/20 bg-white p-5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] transition hover:-translate-y-1 hover:border-[#214C9B]">
              <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">{item.source} · {formatDate(item.date)}</p>
              <h3 className="mt-3 text-xl font-extrabold uppercase leading-tight text-[#214C9B]">{item.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MatchBanner({ match, label, href, action }: { match: Match; label: string; href: string; action: string }) {
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

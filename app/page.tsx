import { Activity, ArrowUpRight, Flame, Goal, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { TransferCard } from "@/components/TransferCard";
import { newsItems, players, teams, transfers } from "@/data/mock";
import { getLatestAvilesMatches, getNextAvilesMatch, getUpcomingAvilesMatches } from "@/lib/fixtures";
import { formatMatchDate } from "@/lib/utils";

const statLeaders = [
  { label: "Maximo goleador", player: [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0], value: "goles", icon: Goal },
  { label: "Maximo asistente", player: [...players].sort((a, b) => b.stats.assists - a.stats.assists)[0], value: "asist.", icon: Sparkles },
  { label: "Mas minutos", player: [...players].sort((a, b) => b.stats.minutes - a.stats.minutes)[0], value: "min", icon: Activity },
  { label: "Mas tarjetas", player: [...players].sort((a, b) => (b.stats.yellowCards + b.stats.redCards) - (a.stats.yellowCards + a.stats.redCards))[0], value: "tarj.", icon: Flame },
  { label: "Mejor valoracion", player: [...players].sort((a, b) => b.rating - a.rating)[0], value: "media", icon: ShieldCheck },
];

export default function HomePage() {
  const nextMatch = getNextAvilesMatch();
  const latestMatches = getLatestAvilesMatches();
  const upcomingMatches = getUpcomingAvilesMatches();
  const featuredNews = newsItems.find((item) => item.featured) ?? newsItems[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="rounded-[2rem] border border-[#c4121a]/25 bg-white p-6 shadow-[0_22px_60px_rgba(17,24,39,0.1)]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#c4121a]/15 pb-5">
            <Badge tone="red">Football stats hub</Badge>
            <Badge tone="blue">Real Aviles Industrial</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase tracking-tight text-[#c4121a] sm:text-7xl">Centro de mando RAI1903</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Dashboard claro con competicion, mercado, cantera, quiniela y actualidad, preparado para evolucionar de mocks a datos reales.</p>
          {nextMatch && (
            <div className="mt-8 rounded-3xl border-2 border-[#c4121a] bg-white p-5 shadow-inner">
              <p className="text-center text-xs font-black uppercase tracking-[0.24em] text-[#1c4f9c]">Partido destacado</p>
              <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
                  <p className="text-3xl font-black uppercase text-[#c4121a]">{nextMatch.homeTeam}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Local</p>
                </div>
                <div className="rounded-3xl bg-[#c4121a] px-8 py-5 text-center text-white shadow-xl shadow-red-950/20">
                  <p className="text-5xl font-black">J{nextMatch.matchday}</p>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">liga</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
                  <p className="text-3xl font-black uppercase text-[#c4121a]">{nextMatch.awayTeam}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Visitante</p>
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-bold text-slate-600">{formatMatchDate(nextMatch.date)} · {nextMatch.venue}</p>
            </div>
          )}
        </div>

        <Card eyebrow="Estado del equipo" title="Pulso competitivo">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Posicion", value: "3º" }, { label: "Puntos", value: "17" }, { label: "Goles a favor", value: "16" }, { label: "Porterias a cero", value: "4" }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#c4121a]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
            Equipo en zona playoff, creciendo en presion tras perdida y con margen para mejorar la defensa de centros laterales.
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card eyebrow="El Noticiero" title="Titulares principales">
          <div className="space-y-4">
            {newsItems.slice(0, 4).map((item) => <NewsCard key={item.id} item={item} featured={item.id === featuredNews.id} />)}
          </div>
        </Card>
        <Card eyebrow="Fichajes del dia" title="Mercado RAI1903">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
            {transfers.slice(0, 3).map((transfer) => <TransferCard key={transfer.id} transfer={transfer} />)}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.85fr]">
        <Card eyebrow="Liga" title="Clasificacion compacta"><LeagueTable teams={teams} compact /></Card>
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-3">{latestMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Calendario" title="Proximos 5 partidos">
          <div className="space-y-3">{upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
      </section>

      <Card eyebrow="Squad analytics" title="Estadisticas destacadas de jugadores" action={<ArrowUpRight className="text-[#1c4f9c]" />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statLeaders.map((leader) => {
            const Icon = leader.icon;
            const amount = leader.value === "goles" ? leader.player.stats.goals : leader.value === "asist." ? leader.player.stats.assists : leader.value === "min" ? leader.player.stats.minutes : leader.value === "tarj." ? leader.player.stats.yellowCards + leader.player.stats.redCards : leader.player.rating.toFixed(2);
            return (
              <div key={leader.label} className="rounded-3xl border border-[#c4121a]/20 bg-white p-5 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
                <Icon className="text-[#1c4f9c]" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{leader.label}</p>
                <p className="mt-2 text-xl font-black uppercase text-[#c4121a]">{leader.player.displayName}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{amount} <span className="text-sm text-slate-500">{leader.value}</span></p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

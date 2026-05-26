import { Activity, ArrowUpRight, Flame, Goal, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { newsItems, players, teams } from "@/data/mock";
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
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#214C9B]/55 via-slate-950/80 to-[#981915]/40 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="white">Football manager hub</Badge>
            <Badge tone="red">Real Aviles Industrial</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl">Centro de mando RAI1903</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50/85">Dashboard blanquiazul con competicion, mercado, cantera, quiniela y actualidad, preparado para evolucionar de mocks a datos reales.</p>
          {nextMatch && (
            <div className="mt-8 rounded-3xl border border-white/15 bg-slate-950/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100">Proximo partido destacado</p>
                  <p className="mt-2 text-2xl font-black text-white">{nextMatch.homeTeam} vs {nextMatch.awayTeam}</p>
                  <p className="mt-1 text-sm text-slate-300">{formatMatchDate(nextMatch.date)} · {nextMatch.venue}</p>
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-center text-slate-950">
                  <p className="text-3xl font-black">J{nextMatch.matchday}</p>
                  <p className="text-xs font-black uppercase tracking-[0.18em]">liga</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Card eyebrow="Estado del equipo" title="Pulso competitivo" className="bg-slate-950/80">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Posicion", value: "3º" }, { label: "Puntos", value: "17" }, { label: "Goles a favor", value: "16" }, { label: "Porterias a cero", value: "4" }].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-300/20 bg-[#214C9B]/20 p-4 text-sm leading-6 text-blue-50">
            Equipo en zona playoff, creciendo en presion tras perdida y con margen para mejorar la defensa de centros laterales.
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.85fr]">
        <Card eyebrow="Liga" title="Clasificacion compacta"><LeagueTable teams={teams} compact /></Card>
        <Card eyebrow="Actualidad" title="Ultimas noticias">
          <div className="space-y-3">
            {newsItems.slice(0, 4).map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </Card>
        <Card eyebrow="Portada" title="Noticia principal"><NewsCard item={featuredNews} featured /></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card eyebrow="Resultados" title="Ultimos 5 partidos">
          <div className="space-y-3">{latestMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Calendario" title="Proximos 5 partidos">
          <div className="space-y-3">{upcomingMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
      </section>

      <Card eyebrow="Squad analytics" title="Estadisticas destacadas de jugadores" action={<ArrowUpRight className="text-blue-200" />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statLeaders.map((leader) => {
            const Icon = leader.icon;
            const amount = leader.value === "goles" ? leader.player.stats.goals : leader.value === "asist." ? leader.player.stats.assists : leader.value === "min" ? leader.player.stats.minutes : leader.value === "tarj." ? leader.player.stats.yellowCards + leader.player.stats.redCards : leader.player.rating.toFixed(2);
            return (
              <div key={leader.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <Icon className="text-blue-200" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{leader.label}</p>
                <p className="mt-2 text-xl font-black text-white">{leader.player.displayName}</p>
                <p className="mt-2 text-3xl font-black text-blue-100">{amount} <span className="text-sm text-slate-400">{leader.value}</span></p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

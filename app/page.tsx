import Link from "next/link";
import { ArrowUpRight, Newspaper, Shield, Trophy } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { newsItems, teams } from "@/data/mock";
import { getLatestAvilesMatches, getNextAvilesMatch, getUpcomingAvilesMatches } from "@/lib/fixtures";
import { formatMatchDate } from "@/lib/utils";

const quickLinks = [
  { href: "/primer-equipo", label: "Primer Equipo", description: "Plantilla, noticias y competicion", icon: Shield },
  { href: "/cantera", label: "Cantera", description: "Filial y Juvenil A", icon: Trophy },
  { href: "/prensa", label: "Prensa", description: "Medios, enlaces y archivo", icon: Newspaper },
];

export default function HomePage() {
  const nextMatch = getNextAvilesMatch();
  const latestMatches = getLatestAvilesMatches();
  const upcomingMatches = getUpcomingAvilesMatches();
  const featuredNews = newsItems.find((item) => item.featured) ?? newsItems[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <PageHero eyebrow="Web fan no oficial" title="Real Aviles Industrial" description="Inicio limpio para seguir partido destacado, noticias, calendario, clasificacion y accesos rapidos sin depender de APIs de pago.">
          {nextMatch && (
            <div className="rounded-3xl border-2 border-[#981915] bg-red-50 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#214C9B]">Partido destacado</p>
              <p className="mt-2 text-4xl font-black text-[#981915]">J{nextMatch.matchday}</p>
              <p className="mt-1 text-sm font-bold text-slate-600">{formatMatchDate(nextMatch.date)}</p>
            </div>
          )}
        </PageHero>

        <Card eyebrow="Proximo partido" title="En el Roman">
          {nextMatch && <MatchCard match={nextMatch} />}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Posicion", value: "3º" }, { label: "Puntos", value: "17" }, { label: "Goles a favor", value: "16" }, { label: "Porterias a cero", value: "4" }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#981915]">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card eyebrow="Ultimas noticias" title="Titulares blanquiazules">
          <div className="space-y-4">
            {newsItems.slice(0, 4).map((item) => <NewsCard key={item.id} item={item} featured={item.id === featuredNews.id} />)}
          </div>
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
                  <h3 className="mt-4 text-2xl font-black uppercase text-[#981915]">{item.label}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{item.description}</p>
                </Link>
              );
            })}
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
    </div>
  );
}

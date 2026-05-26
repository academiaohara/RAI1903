import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { RivalCard } from "@/components/RivalCard";
import { SectionTabs } from "@/components/SectionTabs";
import { RAI_TEAM_ID, teams } from "@/data/mock";
import { getUpcomingAvilesMatches } from "@/lib/fixtures";

const tabs = [
  { href: "/primer-equipo/plantilla", label: "Plantilla" },
  { href: "/primer-equipo/noticias", label: "Noticias" },
  { href: "/primer-equipo/competicion", label: "Competicion" },
];

export default function PrimerEquipoCompeticionPage() {
  const upcoming = getUpcomingAvilesMatches(6);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Primer Equipo" title="Competicion" description="Clasificacion, proximos partidos y rivales directos en una pagina independiente." />
      <SectionTabs tabs={tabs} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card eyebrow="Competicion" title="Clasificacion">
          <LeagueTable teams={teams} />
        </Card>
        <Card eyebrow="Calendario" title="Proximos partidos">
          <div className="space-y-3">{upcoming.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Rivales" title="Equipos a seguir" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...teams].filter((team) => team.id !== RAI_TEAM_ID).slice(0, 8).map((team) => <RivalCard key={team.id} team={team} />)}
          </div>
        </Card>
      </section>
    </div>
  );
}

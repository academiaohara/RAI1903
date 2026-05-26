import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { academyTeams } from "@/data/mock";

const tabs = academyTeams.map((team) => ({ href: `/cantera/${team.id}`, label: team.name }));

export function generateStaticParams() {
  return academyTeams.map((team) => ({ teamId: team.id }));
}

export default async function CanteraTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = academyTeams.find((item) => item.id === teamId);

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Cantera" title={team.name} description="Plantilla, clasificacion, calendario basico y notas del equipo en una pagina propia." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow={team.category} title={team.name}>
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1fr_0.8fr]">
          <div className="space-y-3 text-sm text-slate-600">
            <p><strong className="text-slate-900">Entrenador:</strong> {team.coach}</p>
            <p><strong className="text-slate-900">Clasificacion:</strong> {team.position}</p>
            <p><strong className="text-slate-900">Ultimo resultado:</strong> {team.lastResult}</p>
            <p><strong className="text-slate-900">Proximo partido:</strong> {team.nextMatch}</p>
            <div className="flex flex-wrap gap-2 pt-2">{team.standoutPlayers.map((player) => <Badge key={player} tone="blue">{player}</Badge>)}</div>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-normal text-[#214C9B]">Plantilla</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {team.roster.map((player) => (
                <div key={player.id} className="rounded-2xl border border-[#214C9B]/15 bg-blue-50 p-3">
                  <p className="font-extrabold uppercase text-[#214C9B]">#{player.number} {player.displayName}</p>
                  <p className="text-sm font-bold text-slate-500">{player.position} · {player.age} anos</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-normal text-[#214C9B]">Calendario basico</h3>
            <div className="space-y-3">{team.calendar.map((match) => <MatchCard key={match.id} match={match} compact />)}</div>
          </div>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.45fr]">
          <LeagueTable teams={team.table} compact />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Notas</p>
            {team.news.map((item) => <p key={item} className="mt-2 text-sm font-bold text-slate-700">{item}</p>)}
          </div>
        </div>
      </Card>
    </div>
  );
}

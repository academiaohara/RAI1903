import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { academyTeams } from "@/data/mock";

export default function CanteraPage() {
  const tabs = academyTeams.map((team) => ({ href: `#${team.id}`, label: team.name }));

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Cantera" title="Filial y Juvenil A" description="Seguimiento simple de los dos bloques principales: plantilla, clasificacion y calendario basico editables desde mocks." />
      <SectionTabs tabs={tabs} />

      <div className="grid gap-6">
        {academyTeams.map((team) => (
          <section key={team.id} id={team.id} className="scroll-mt-28">
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
                  <h3 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#214C9B]">Plantilla</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {team.roster.map((player) => (
                      <div key={player.id} className="rounded-2xl border border-[#981915]/15 bg-red-50 p-3">
                        <p className="font-black uppercase text-[#981915]">#{player.number} {player.displayName}</p>
                        <p className="text-sm font-bold text-slate-500">{player.position} · {player.age} anos</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#214C9B]">Calendario basico</h3>
                  <div className="space-y-3">{team.calendar.map((match) => <MatchCard key={match.id} match={match} compact />)}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.45fr]">
                <LeagueTable teams={team.table} compact />
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Notas</p>
                  {team.news.map((item) => <p key={item} className="mt-2 text-sm font-bold text-slate-700">{item}</p>)}
                </div>
              </div>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}

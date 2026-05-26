import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { academyTeams } from "@/data/mock";

export default function CanteraPage() {
  const promises = academyTeams.flatMap((team) => team.standoutPlayers.map((player) => ({ player, team: team.name }))).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[#c4121a]/25 bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
        <Badge tone="green">Futuro blanquiazul</Badge>
        <h1 className="mt-4 text-5xl font-black uppercase text-[#c4121a]">Cantera RAI1903</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Seguimiento de equipos inferiores, resultados, entrenadores, jugadores destacados y promesas a seguir.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {academyTeams.map((team) => (
          <Card key={team.id} eyebrow={team.category} title={team.name}>
            <div className="space-y-3 text-sm text-slate-600">
              <p><strong className="text-slate-900">Entrenador:</strong> {team.coach}</p>
              <p><strong className="text-slate-900">Clasificacion:</strong> {team.position}</p>
              <p><strong className="text-slate-900">Ultimo resultado:</strong> {team.lastResult}</p>
              <p><strong className="text-slate-900">Proximo partido:</strong> {team.nextMatch}</p>
              <div className="flex flex-wrap gap-2 pt-2">{team.standoutPlayers.map((player) => <Badge key={player} tone="blue">{player}</Badge>)}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Noticias</p>{team.news.map((item) => <p key={item} className="mt-2">{item}</p>)}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card eyebrow="Scouting interno" title="Promesas a seguir">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((item) => (
            <div key={`${item.player}-${item.team}`} className="rounded-3xl border border-[#c4121a]/20 bg-gradient-to-br from-white to-red-50 p-4">
              <p className="text-xl font-black uppercase text-[#c4121a]">{item.player}</p>
              <p className="mt-1 text-sm font-bold text-[#1c4f9c]">{item.team}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

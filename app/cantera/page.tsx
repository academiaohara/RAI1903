import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { academyTeams } from "@/data/mock";

export default function CanteraPage() {
  const promises = academyTeams.flatMap((team) => team.standoutPlayers.map((player) => ({ player, team: team.name }))).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#214C9B]/45 via-slate-950 to-emerald-500/20 p-6">
        <Badge tone="green">Futuro blanquiazul</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Cantera RAI1903</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Seguimiento de equipos inferiores, resultados, entrenadores, jugadores destacados y promesas a seguir.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {academyTeams.map((team) => (
          <Card key={team.id} eyebrow={team.category} title={team.name}>
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong className="text-white">Entrenador:</strong> {team.coach}</p>
              <p><strong className="text-white">Clasificacion:</strong> {team.position}</p>
              <p><strong className="text-white">Ultimo resultado:</strong> {team.lastResult}</p>
              <p><strong className="text-white">Proximo partido:</strong> {team.nextMatch}</p>
              <div className="flex flex-wrap gap-2 pt-2">{team.standoutPlayers.map((player) => <Badge key={player} tone="blue">{player}</Badge>)}</div>
              <div className="rounded-2xl bg-white/[0.04] p-3"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Noticias</p>{team.news.map((item) => <p key={item} className="mt-2">{item}</p>)}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card eyebrow="Scouting interno" title="Promesas a seguir">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((item) => (
            <div key={`${item.player}-${item.team}`} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-[#214C9B]/20 p-4">
              <p className="text-xl font-black text-white">{item.player}</p>
              <p className="mt-1 text-sm text-blue-100">{item.team}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { Modal } from "@/components/Modal";
import { RAI_TEAM_ID, players, teams } from "@/data/mock";
import { getTeamMatches } from "@/lib/fixtures";
import { resultTone } from "@/lib/utils";
import type { Team } from "@/types";

export default function CompeticionPage() {
  const [selected, setSelected] = useState<Team | null>(null);
  const selectedMatches = useMemo(() => selected ? getTeamMatches(selected.id) : [], [selected]);
  const vsAviles = selectedMatches.filter((match) => match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#214C9B]/35 to-white/10 p-6">
        <Badge tone="white">Competicion</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Liga y rivales</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Tabla completa de equipos, datos basicos, estado de forma y detalle modal con plantilla, estadisticas y calendario.</p>
      </section>

      <Card eyebrow="Clasificacion" title="Tabla de liga"><LeagueTable teams={teams} /></Card>

      <Card eyebrow="Rivales" title="Todos los equipos">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-[0.18em] text-slate-400"><tr><th className="px-4 py-3">Escudo</th><th className="px-4 py-3">Equipo</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">Estadio</th><th className="px-4 py-3">Entrenador</th><th className="px-4 py-3">Pos.</th><th className="px-4 py-3">Ultimos 5</th><th className="px-4 py-3">Detalle</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {[...teams].sort((a, b) => a.position - b.position).map((team) => (
                <tr key={team.id} className="text-slate-300">
                  <td className="px-4 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xs font-black text-white">{team.crestInitials}</span></td>
                  <td className="px-4 py-3 font-black text-white">{team.name}</td>
                  <td className="px-4 py-3">{team.city}</td>
                  <td className="px-4 py-3">{team.stadium}</td>
                  <td className="px-4 py-3">{team.coach}</td>
                  <td className="px-4 py-3 font-black text-white">{team.position}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">{team.form.map((result, index) => <span key={`${team.id}-${index}`} className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${resultTone(result)}`}>{result}</span>)}</div></td>
                  <td className="px-4 py-3"><button onClick={() => setSelected(team)} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-blue-100">Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={Boolean(selected)} title={selected?.name ?? "Equipo"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              {[['Ciudad', selected.city], ['Estadio', selected.stadium], ['Entrenador', selected.coach], ['Fundado', selected.founded]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 font-black text-white">{value}</p></div>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card eyebrow="Plantilla basica" title="Jugadores referencia" dense>
                <div className="space-y-2">{(selected.id === RAI_TEAM_ID ? players.slice(0, 6) : players.slice(0, 5)).map((player) => <div key={player.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3 text-sm"><span className="font-bold text-white">{player.displayName}</span><span className="text-slate-400">{player.position}</span></div>)}</div>
              </Card>
              <Card eyebrow="Estadisticas" title="Balance general" dense>
                <div className="grid grid-cols-3 gap-3">{[['PJ', selected.stats.played], ['G', selected.stats.won], ['E', selected.stats.drawn], ['P', selected.stats.lost], ['GF', selected.stats.goalsFor], ['GC', selected.stats.goalsAgainst]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/[0.04] p-3 text-center"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black text-white">{value}</p></div>)}</div>
              </Card>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card eyebrow="Ultimos" title="Partidos" dense><div className="space-y-3">{selectedMatches.filter((match) => match.status === "finished").slice(-3).map((match) => <MatchCard key={match.id} match={match} compact />)}</div></Card>
              <Card eyebrow="Proximos" title="Calendario" dense><div className="space-y-3">{selectedMatches.filter((match) => match.status === "scheduled").slice(0, 3).map((match) => <MatchCard key={match.id} match={match} compact />)}</div></Card>
              <Card eyebrow="H2H" title="Contra el Aviles" dense><div className="space-y-3">{vsAviles.slice(0, 3).map((match) => <MatchCard key={match.id} match={match} compact />)}</div></Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

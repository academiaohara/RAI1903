"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { PlayerCard } from "@/components/PlayerCard";
import { players } from "@/data/mock";
import type { Player, PlayerPosition } from "@/types";

const positions: Array<PlayerPosition | "Todas"> = ["Todas", "Portero", "Defensa", "Centrocampista", "Delantero"];

export default function PlantillaPage() {
  const [selected, setSelected] = useState<Player | null>(null);
  const [position, setPosition] = useState<PlayerPosition | "Todas">("Todas");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => players.filter((player) => {
    const matchesPosition = position === "Todas" || player.position === position;
    const matchesQuery = `${player.firstName} ${player.lastName} ${player.displayName}`.toLowerCase().includes(query.toLowerCase());
    return matchesPosition && matchesQuery;
  }), [position, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#214C9B]/45 via-slate-950 to-white/10 p-6">
        <Badge tone="white">Album de cromos</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Plantilla Real Aviles</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Cartas coleccionables con estado, dorsal y ficha ampliada en modal para cada jugador.</p>
      </section>

      <Card eyebrow="Filtros" title="Explora el album">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar jugador..." className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-300" />
          <div className="flex flex-wrap gap-2">
            {positions.map((item) => <button key={item} onClick={() => setPosition(item)} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${position === item ? "bg-white text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{item}</button>)}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((player) => <PlayerCard key={player.id} player={player} onSelect={setSelected} />)}
      </div>

      <Modal open={Boolean(selected)} title={selected ? `${selected.firstName} ${selected.lastName}` : "Jugador"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-6 lg:grid-cols-[0.45fr_1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white via-blue-200 to-[#214C9B] p-6 text-center text-slate-950">
              <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-slate-950/80 text-7xl font-black text-white">{selected.firstName[0]}{selected.lastName[0]}</div>
              <p className="mt-4 text-5xl font-black">#{selected.number}</p>
              <p className="text-lg font-black">{selected.position}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="blue">{selected.status}</Badge><Badge tone="white">{selected.nationality}</Badge><Badge tone="slate">{selected.age} anos</Badge></div>
              <p className="mt-5 text-slate-300 leading-7">{selected.bio}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[['Nacimiento', selected.birthDate], ['Altura', selected.height], ['Pierna buena', selected.preferredFoot], ['Temporadas', selected.seasonsAtClub]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 font-black text-white">{value}</p></div>)}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[['Partidos', selected.stats.appearances], ['Goles', selected.stats.goals], ['Asistencias', selected.stats.assists], ['Minutos', selected.stats.minutes], ['Amarillas', selected.stats.yellowCards], ['Rojas', selected.stats.redCards]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-slate-950 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>)}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Historial de clubes</p>
                <p className="mt-2 text-slate-200">{selected.clubHistory.join(" · ")}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

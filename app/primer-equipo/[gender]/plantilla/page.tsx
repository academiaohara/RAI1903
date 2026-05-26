"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { PageHero } from "@/components/PageHero";
import { PlayerCard } from "@/components/PlayerCard";
import { PrimerEquipoSubnav } from "@/components/PrimerEquipoSubnav";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { getPlayersByGender } from "@/lib/primer-equipo-data";
import type { Player, PlayerPosition } from "@/types";
import { use } from "react";

const positions: Array<PlayerPosition | "Todas"> = ["Todas", "Portero", "Defensa", "Centrocampista", "Delantero"];

export default function PlantillaPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };
  const squad = getPlayersByGender(gender);
  const [selected, setSelected] = useState<Player | null>(null);
  const [position, setPosition] = useState<PlayerPosition | "Todas">("Todas");
  const filteredPlayers = useMemo(() => squad.filter((player) => position === "Todas" || player.position === position), [position, squad]);
  const injuryList = squad.filter((player) => player.status === "lesionado");
  const suspensionList = squad.filter((player) => player.status === "sancionado");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={`Primer Equipo · ${genderLabels[gender].title}`}
        title="Plantilla"
        description={`Jugadores, parte semanal y fichas individuales de ${genderLabels[gender].club}.`}
      />
      <PrimerEquipoSubnav gender={gender} />

      <Card eyebrow="Plantilla" title="Lista de jugadores">
        <div className="mb-5 flex flex-wrap gap-2">
          {positions.map((item) => (
            <button key={item} onClick={() => setPosition(item)} className={`rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-normal transition ${position === item ? "bg-[#214C9B] text-white" : "border border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} onSelect={setSelected} />
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <AvailabilityCard title="Lesionados" players={injuryList} empty="Sin lesionados en el parte mock." />
        <AvailabilityCard title="Sancionados" players={suspensionList} empty="Sin sanciones activas." />
      </div>

      <Modal open={Boolean(selected)} title={selected ? `${selected.firstName} ${selected.lastName}` : "Jugador"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-6 lg:grid-cols-[0.45fr_1fr]">
            <div className="rounded-[2rem] border border-[#214C9B]/20 bg-gradient-to-br from-white via-blue-100 to-[#214C9B] p-6 text-center text-slate-950">
              <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-[#214C9B] text-7xl font-extrabold text-white">
                {selected.firstName[0]}
                {selected.lastName[0]}
              </div>
              <p className="mt-4 text-5xl font-extrabold">#{selected.number}</p>
              <p className="text-lg font-bold">{selected.position}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{selected.status}</Badge>
                <Badge tone="red">{selected.nationality}</Badge>
                <Badge tone="slate">{selected.age} anos</Badge>
              </div>
              <p className="mt-5 leading-7 text-slate-600">{selected.bio}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[["Partidos", selected.stats.appearances], ["Goles", selected.stats.goals], ["Asistencias", selected.stats.assists], ["Minutos", selected.stats.minutes], ["Amarillas", selected.stats.yellowCards], ["Rojas", selected.stats.redCards]].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4">
                    <p className="text-xs uppercase tracking-normal text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#214C9B]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AvailabilityCard({ title, players: list, empty }: { title: string; players: Player[]; empty: string }) {
  return (
    <Card eyebrow="Parte semanal" title={title}>
      <div className="space-y-3">
        {list.length > 0 ? (
          list.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4">
              <div>
                <p className="font-extrabold uppercase text-[#214C9B]">{player.displayName}</p>
                <p className="text-sm font-bold text-slate-500">{player.position}</p>
              </div>
              <Badge tone={player.status === "lesionado" ? "red" : "amber"}>{player.status}</Badge>
            </div>
          ))
        ) : (
          <p className="text-sm font-bold text-slate-500">{empty}</p>
        )}
      </div>
    </Card>
  );
}

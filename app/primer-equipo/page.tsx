"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { Modal } from "@/components/Modal";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { PlayerCard } from "@/components/PlayerCard";
import { RivalCard } from "@/components/RivalCard";
import { SectionTabs } from "@/components/SectionTabs";
import { newsItems, players, teams } from "@/data/mock";
import { getUpcomingAvilesMatches } from "@/lib/fixtures";
import type { NewsCategory, NewsTag, Player, PlayerPosition } from "@/types";

const tabs = [
  { href: "#plantilla", label: "Plantilla" },
  { href: "#noticias", label: "Noticias" },
  { href: "#competicion", label: "Competicion" },
];

const positions: Array<PlayerPosition | "Todas"> = ["Todas", "Portero", "Defensa", "Centrocampista", "Delantero"];

const newsCategoryTags: Record<NewsCategory, NewsTag> = {
  Fichajes: "fichajes",
  Lesionados: "lesionados",
  Rumores: "rumores",
  Renovaciones: "renovaciones",
  Entrevistas: "entrevistas",
  Otros: "otros",
};

export default function PrimerEquipoPage() {
  const [selected, setSelected] = useState<Player | null>(null);
  const [position, setPosition] = useState<PlayerPosition | "Todas">("Todas");
  const [category, setCategory] = useState<NewsCategory>("Fichajes");

  const filteredPlayers = useMemo(() => players.filter((player) => position === "Todas" || player.position === position), [position]);
  const injuryList = players.filter((player) => player.status === "lesionado");
  const suspensionList = players.filter((player) => player.status === "sancionado");
  const categoryNews = newsItems.filter((item) => item.tags.includes(newsCategoryTags[category]));
  const upcoming = getUpcomingAvilesMatches(6);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Primer Equipo" title="Plantilla, actualidad y liga" description="Una seccion barata de mantener: jugadores, partes, noticias por categoria, calendario, clasificacion y rivales salen de mocks listos para migrar a Supabase." />
      <SectionTabs tabs={tabs} />

      <section id="plantilla" className="space-y-5 scroll-mt-28">
        <Card eyebrow="Plantilla" title="Lista de jugadores">
          <div className="mb-5 flex flex-wrap gap-2">
            {positions.map((item) => (
              <button key={item} onClick={() => setPosition(item)} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${position === item ? "bg-[#981915] text-white" : "border border-[#981915]/20 bg-white text-slate-700 hover:bg-red-50"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} onSelect={setSelected} />)}
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <AvailabilityCard title="Lesionados" players={injuryList} empty="Sin lesionados en el parte mock." />
          <AvailabilityCard title="Sancionados" players={suspensionList} empty="Sin sanciones activas." />
        </div>
      </section>

      <section id="noticias" className="space-y-5 scroll-mt-28">
        <Card eyebrow="Noticias" title="Categorias del primer equipo">
          <div className="mb-5 flex flex-wrap gap-2">
            {(Object.keys(newsCategoryTags) as NewsCategory[]).map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${category === item ? "bg-[#214C9B] text-white" : "border border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {categoryNews.length > 0 ? categoryNews.map((item) => <NewsCard key={item.id} item={item} />) : <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">Sin noticias en esta categoria mock.</p>}
          </div>
        </Card>
      </section>

      <section id="competicion" className="grid gap-6 scroll-mt-28 xl:grid-cols-[1fr_0.85fr]">
        <Card eyebrow="Competicion" title="Clasificacion">
          <LeagueTable teams={teams} />
        </Card>
        <Card eyebrow="Calendario" title="Proximos partidos">
          <div className="space-y-3">{upcoming.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card eyebrow="Rivales" title="Equipos a seguir" className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...teams].filter((team) => team.id !== "real-aviles-industrial").slice(0, 8).map((team) => <RivalCard key={team.id} team={team} />)}
          </div>
        </Card>
      </section>

      <Modal open={Boolean(selected)} title={selected ? `${selected.firstName} ${selected.lastName}` : "Jugador"} onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid gap-6 lg:grid-cols-[0.45fr_1fr]">
            <div className="rounded-[2rem] border border-[#981915]/20 bg-gradient-to-br from-white via-red-100 to-[#981915] p-6 text-center text-slate-950">
              <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-[#981915] text-7xl font-black text-white">{selected.firstName[0]}{selected.lastName[0]}</div>
              <p className="mt-4 text-5xl font-black">#{selected.number}</p>
              <p className="text-lg font-black">{selected.position}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="blue">{selected.status}</Badge><Badge tone="red">{selected.nationality}</Badge><Badge tone="slate">{selected.age} anos</Badge></div>
              <p className="mt-5 leading-7 text-slate-600">{selected.bio}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {[["Partidos", selected.stats.appearances], ["Goles", selected.stats.goals], ["Asistencias", selected.stats.assists], ["Minutos", selected.stats.minutes], ["Amarillas", selected.stats.yellowCards], ["Rojas", selected.stats.redCards]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#981915]/20 bg-red-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-[#981915]">{value}</p></div>)}
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
        {list.length > 0 ? list.map((player) => (
          <div key={player.id} className="flex items-center justify-between rounded-2xl border border-[#981915]/20 bg-red-50 p-4">
            <div>
              <p className="font-black uppercase text-[#981915]">{player.displayName}</p>
              <p className="text-sm font-bold text-slate-500">{player.position}</p>
            </div>
            <Badge tone={player.status === "lesionado" ? "red" : "amber"}>{player.status}</Badge>
          </div>
        )) : <p className="text-sm font-bold text-slate-500">{empty}</p>}
      </div>
    </Card>
  );
}

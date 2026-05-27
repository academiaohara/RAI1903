"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { CURRENT_QUINIELA_ROUND, jornadaParticipants, matchdays } from "@/data/mock";
import { getMatchdayByRound, hasFirstMatchStarted, QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaResultadoPage() {
  const [round, setRound] = useState(CURRENT_QUINIELA_ROUND);
  const selectedMatchday = useMemo(() => getMatchdayByRound(round), [round]);
  const started = hasFirstMatchStarted(selectedMatchday);
  const sortedParticipants = useMemo(() => {
    const list = [...(jornadaParticipants[round] ?? [])];
    if (started) {
      list.sort((a, b) => b.points - a.points || a.submittedAt.localeCompare(b.submittedAt));
    }
    return list;
  }, [round, started]);

  const leader = sortedParticipants[0];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Resultado"
        description="Participantes por orden de envio. Cuando arranca la jornada, los puntos se actualizan y la tabla se ordena por clasificacion."
      />
      <SectionTabs tabs={[...QUINIELA_TABS]} />
      <JornadaSelector
        value={round}
        total={matchdays.length}
        currentRound={CURRENT_QUINIELA_ROUND}
        onChange={setRound}
      />

      <Card eyebrow={`Jornada ${round}`} title="Resultado de la jornada">
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Participantes</p>
            <p className="mt-2 text-3xl font-extrabold text-[#214C9B]">{sortedParticipants.length}</p>
          </div>
          <div className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Estado</p>
            <p className="mt-2 text-lg font-extrabold text-[#214C9B]">{started ? "En juego" : "Pendiente de inicio"}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Lider</p>
            <p className="mt-2 text-lg font-extrabold text-[#981915]">{leader?.user ?? "—"}</p>
            {leader && <p className="text-sm font-bold text-slate-600">{leader.points} pts</p>}
          </div>
        </div>

        <div className="space-y-2">
          {sortedParticipants.map((row, index) => (
            <div
              key={row.user}
              className="grid items-center gap-3 rounded-2xl border border-[#214C9B]/20 bg-white p-4 text-sm sm:grid-cols-[auto_1fr_auto_auto]"
            >
              <Badge tone={started && index === 0 ? "blue" : "red"}>{started ? index + 1 : index + 1}</Badge>
              <div>
                <p className="font-extrabold uppercase text-[#214C9B]">{row.user}</p>
                <p className="text-xs text-slate-500">
                  Enviado: {new Date(row.submittedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <span className="font-extrabold text-slate-900">{row.points} pts</span>
              <span className="text-slate-600">{row.hits} aciertos 1X2</span>
            </div>
          ))}
        </div>

        {!started && (
          <p className="mt-4 text-sm text-slate-500">
            Todos los participantes aparecen con 0 puntos hasta que empiece el primer partido de la jornada.
          </p>
        )}
      </Card>
    </div>
  );
}

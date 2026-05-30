"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { CURRENT_QUINIELA_ROUND, jornadaParticipants, matchdays } from "@/data/mock";
import {
  getMatchdayByRound,
  hasFirstMatchStarted,
  sortQuinielaMatches,
} from "@/lib/quiniela";

type ResultadoView = "quiniela" | "ranking";

export default function QuinielaResultadoPage() {
  const [round, setRound] = useState(CURRENT_QUINIELA_ROUND);
  const [view, setView] = useState<ResultadoView>("quiniela");
  const selectedMatchday = useMemo(() => getMatchdayByRound(round), [round]);
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches),
    [selectedMatchday.matches],
  );
  const started = hasFirstMatchStarted(selectedMatchday);
  const sortedParticipants = useMemo(() => {
    const list = [...(jornadaParticipants[round] ?? [])];
    if (started) {
      list.sort((a, b) => b.points - a.points || a.submittedAt.localeCompare(b.submittedAt));
    }
    return list;
  }, [round, started]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Resultado"
        description="Consulta el resultado oficial de la jornada o la clasificacion de participantes."
      />
      <JornadaSelector
        value={round}
        total={matchdays.length}
        currentRound={CURRENT_QUINIELA_ROUND}
        onChange={setRound}
      />

      <Card eyebrow={`Jornada ${round}`} title="Resultado de la jornada">
        <QuinielaViewToggle
          value={view}
          onChange={setView}
          layoutId="quiniela-resultado-view"
          options={[
            { id: "quiniela", label: "Resultado quiniela" },
            { id: "ranking", label: "Ranking jornada" },
          ]}
          className="mb-5"
        />

        {view === "quiniela" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Signos 1-X-2 y goles del Avilés oficiales de la jornada. Las casillas con resultado aparecen en granate.
            </p>
            {orderedMatches.map((match) => (
              <PredictionForm
                key={match.id}
                match={match}
                mode="results"
                readOnly
                onChange={() => undefined}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {sortedParticipants.map((row, index) => (
                <div
                  key={row.user}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#214C9B]/20 bg-white p-4 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B]">
                      {index + 1}
                    </span>
                    <p className="truncate font-extrabold uppercase text-[#214C9B]">{row.user}</p>
                  </div>
                  <span className="shrink-0 font-extrabold text-slate-900">{row.points} pts</span>
                </div>
              ))}
            </div>

            {!started && (
              <p className="mt-4 text-sm text-slate-500">
                Todos los participantes aparecen con 0 puntos hasta que empiece el primer partido de la jornada.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

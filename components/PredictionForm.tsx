"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { RAI_TEAM_ID, players } from "@/data/mock";
import type { Match, Prediction, PredictionOutcome } from "@/types";

export function PredictionForm({ match, prediction, onChange }: { match: Match; prediction?: Prediction; onChange: (prediction: Prediction) => void }) {
  const [scorerDraft, setScorerDraft] = useState("");
  const isAvilesMatch = match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID;
  const avilesScorers = useMemo(() => players.filter((player) => player.position !== "Portero"), []);

  const update = (patch: Partial<Prediction>) => {
    onChange({
      matchId: match.id,
      matchday: match.matchday,
      outcome: prediction?.outcome,
      exactScore: prediction?.exactScore,
      scorers: prediction?.scorers ?? [],
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const addScorer = () => {
    if (!scorerDraft) return;
    update({ scorers: [...(prediction?.scorers ?? []), scorerDraft] });
    setScorerDraft("");
  };

  return (
    <div className="rounded-2xl border border-[#981915]/20 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{match.venue}</p>
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p className="font-black text-slate-800">{match.homeTeam}</p>
            <span className="rounded-xl bg-[#981915] px-3 py-2 text-sm font-black text-white">vs</span>
            <p className="text-right font-black text-slate-800">{match.awayTeam}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" aria-label="Prediccion 1 X 2">
          {(["1", "X", "2"] as PredictionOutcome[]).map((outcome) => (
            <button key={outcome} onClick={() => update({ outcome })} className={`h-12 w-12 rounded-2xl border text-lg font-black transition ${prediction?.outcome === outcome ? "border-[#981915] bg-[#981915] text-white" : "border-[#981915]/20 bg-white text-slate-700 hover:bg-red-50"}`}>
              {outcome}
            </button>
          ))}
        </div>
      </div>

      {isAvilesMatch && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#214C9B]">Detalle Real Aviles</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[auto_auto_1fr]">
            <label className="text-sm font-bold text-slate-700">
              Goles local
              <input type="number" min={0} value={prediction?.exactScore?.home ?? ""} onChange={(event) => update({ exactScore: { home: Number(event.target.value), away: prediction?.exactScore?.away ?? 0 } })} className="mt-1 block w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-[#214C9B]" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Goles visitante
              <input type="number" min={0} value={prediction?.exactScore?.away ?? ""} onChange={(event) => update({ exactScore: { home: prediction?.exactScore?.home ?? 0, away: Number(event.target.value) } })} className="mt-1 block w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-[#214C9B]" />
            </label>
            <div className="text-sm font-bold text-slate-700">
              Goleadores del Aviles
              <div className="mt-1 flex gap-2">
                <select value={scorerDraft} onChange={(event) => setScorerDraft(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-[#214C9B]">
                  <option value="">Seleccionar jugador</option>
                  {avilesScorers.map((player) => <option key={player.id} value={player.displayName}>{player.displayName}</option>)}
                </select>
                <button onClick={addScorer} className="rounded-xl bg-[#981915] px-3 py-2 text-white transition hover:bg-[#76120f]" aria-label="Anadir goleador"><Plus size={18} /></button>
              </div>
            </div>
          </div>
          {(prediction?.scorers?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {prediction?.scorers.map((scorer, index) => (
                <button key={`${scorer}-${index}`} onClick={() => update({ scorers: prediction.scorers.filter((_, scorerIndex) => scorerIndex !== index) })} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-[#214C9B]">
                  {scorer} <Trash2 size={13} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

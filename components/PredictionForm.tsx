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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{match.venue}</p>
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <p className="font-black text-white">{match.homeTeam}</p>
            <span className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-black">vs</span>
            <p className="text-right font-black text-white">{match.awayTeam}</p>
          </div>
        </div>
        <div className="flex items-center gap-2" aria-label="Prediccion 1 X 2">
          {(["1", "X", "2"] as PredictionOutcome[]).map((outcome) => (
            <button key={outcome} onClick={() => update({ outcome })} className={`h-12 w-12 rounded-2xl border text-lg font-black transition ${prediction?.outcome === outcome ? "border-white bg-white text-slate-950" : "border-white/10 bg-slate-950 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              {outcome}
            </button>
          ))}
        </div>
      </div>

      {isAvilesMatch && (
        <div className="mt-4 rounded-2xl border border-blue-300/20 bg-[#214C9B]/15 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Detalle Real Aviles</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[auto_auto_1fr]">
            <label className="text-sm font-bold text-slate-200">
              Goles local
              <input type="number" min={0} value={prediction?.exactScore?.home ?? ""} onChange={(event) => update({ exactScore: { home: Number(event.target.value), away: prediction?.exactScore?.away ?? 0 } })} className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300/60" />
            </label>
            <label className="text-sm font-bold text-slate-200">
              Goles visitante
              <input type="number" min={0} value={prediction?.exactScore?.away ?? ""} onChange={(event) => update({ exactScore: { home: prediction?.exactScore?.home ?? 0, away: Number(event.target.value) } })} className="mt-1 block w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300/60" />
            </label>
            <div className="text-sm font-bold text-slate-200">
              Goleadores del Aviles
              <div className="mt-1 flex gap-2">
                <select value={scorerDraft} onChange={(event) => setScorerDraft(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-300/60">
                  <option value="">Seleccionar jugador</option>
                  {avilesScorers.map((player) => <option key={player.id} value={player.displayName}>{player.displayName}</option>)}
                </select>
                <button onClick={addScorer} className="rounded-xl bg-white px-3 py-2 text-slate-950 transition hover:bg-blue-100" aria-label="Anadir goleador"><Plus size={18} /></button>
              </div>
            </div>
          </div>
          {(prediction?.scorers?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {prediction?.scorers.map((scorer, index) => (
                <button key={`${scorer}-${index}`} onClick={() => update({ scorers: prediction.scorers.filter((_, scorerIndex) => scorerIndex !== index) })} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-bold text-white">
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

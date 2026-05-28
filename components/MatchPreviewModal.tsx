"use client";

import { Modal } from "@/components/Modal";
import { players, teams } from "@/data/mock";
import { getTeamById, isAvilesMatch } from "@/lib/quiniela";
import type { FormCode, Match } from "@/types";

const formLabel: Record<FormCode, string> = { G: "G", E: "E", P: "P" };

function TeamPreviewBlock({ teamId, side }: { teamId: string; side: "home" | "away" }) {
  const team = getTeamById(teamId) ?? teams[0];
  const homePlayed = Math.max(1, Math.round(team.stats.played / 2));
  const awayPlayed = Math.max(1, team.stats.played - homePlayed);
  const homeWins = Math.round(team.stats.won * 0.6);
  const awayWins = team.stats.won - homeWins;
  const sideLabel = side === "home" ? "Como local" : "Como visitante";
  const sidePlayed = side === "home" ? homePlayed : awayPlayed;
  const sideWins = side === "home" ? homeWins : awayWins;
  const sideDraws = Math.round(team.stats.drawn / 2);
  const sideLosses = sidePlayed - sideWins - sideDraws;

  const avilesUnavailable = teamId === "real-aviles-industrial"
    ? players.filter((player) => player.status === "lesionado" || player.status === "sancionado")
    : [];

  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-slate-50 p-4">
      <p className="text-lg font-extrabold text-slate-900">{team.name}</p>
      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p><span className="font-bold text-slate-500">Posicion:</span> {team.position}º</p>
        <p><span className="font-bold text-slate-500">Puntos:</span> {team.stats.points}</p>
        <p><span className="font-bold text-slate-500">GF / GC:</span> {team.stats.goalsFor} / {team.stats.goalsAgainst}</p>
        <p>
          <span className="font-bold text-slate-500">Racha:</span>{" "}
          {team.form.length > 0 ? team.form.map((code) => formLabel[code]).join(" · ") : "Sin datos"}
        </p>
      </div>
      <div className="mt-3 rounded-xl border border-[#214C9B]/10 bg-white p-3 text-sm">
        <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">{sideLabel}</p>
        <p className="mt-1 text-slate-700">
          {sideWins}V · {sideDraws}E · {sideLosses}D en {sidePlayed} partidos
        </p>
      </div>
      {avilesUnavailable.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-bold text-slate-500">Lesionados / sancionados</p>
          <ul className="mt-1 space-y-1 text-slate-700">
            {avilesUnavailable.map((player) => (
              <li key={player.id}>
                {player.displayName} <span className="text-xs font-bold uppercase text-[#214C9B]">({player.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {teamId !== "real-aviles-industrial" && (
        <p className="mt-3 text-xs text-slate-500">Bajas del rival: consulta convocatoria oficial.</p>
      )}
    </div>
  );
}

export function MatchPreviewModal({ match, open, onClose }: { match: Match; open: boolean; onClose: () => void }) {
  if (isAvilesMatch(match)) return null;

  return (
    <Modal open={open} title={`Previa · ${match.homeTeam} vs ${match.awayTeam}`} onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <TeamPreviewBlock teamId={match.homeTeamId} side="home" />
        <TeamPreviewBlock teamId={match.awayTeamId} side="away" />
      </div>
    </Modal>
  );
}

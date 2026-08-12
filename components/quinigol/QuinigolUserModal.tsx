"use client";

import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { JornadaSelector } from "@/components/JornadaSelector";
import { Modal } from "@/components/Modal";
import { QuinigolMatchForm, type QuinigolFormMode } from "@/components/quinigol/QuinigolMatchForm";
import { useQuinigolUserRound } from "@/hooks/useQuinigolUserRound";
import type { CompetitionSeasonId } from "@/data/mock";
import { getMatchdayByRound } from "@/lib/quiniela";
import type { Matchday } from "@/types";

type QuinigolUserModalProps = {
  open: boolean;
  onClose: () => void;
  seasonId: CompetitionSeasonId;
  userId: string;
  handle: string;
  avatarUrl: string | null;
  matchdays: Matchday[];
  totalRounds: number;
  currentRound: number;
  initialRound?: number;
};

function getQuinigolFormMode(hasSavedRound: boolean, countPoints: boolean): QuinigolFormMode {
  if (hasSavedRound && countPoints) return "compare";
  if (!hasSavedRound && countPoints) return "results";
  return "edit";
}

export function QuinigolUserModal({
  open,
  onClose,
  seasonId,
  userId,
  handle,
  avatarUrl,
  matchdays,
  totalRounds,
  currentRound,
  initialRound,
}: QuinigolUserModalProps) {
  const [round, setRound] = useState(initialRound ?? currentRound);

  const { data, loading, error } = useQuinigolUserRound(seasonId, open ? userId : null, round);

  const matchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const hasMatches = matchday.matches.length > 0;

  const hasSavedRound = data?.hasSavedRound ?? false;
  const countPoints = data?.countPoints ?? false;
  const formMode = getQuinigolFormMode(hasSavedRound, countPoints);
  const showCompareLegend = formMode === "compare";

  return (
    <Modal open={open} title={`Quinigol de ${handle}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={avatarUrl} label={handle} size="md" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-[#214C9B]">{handle}</p>
            <p className="text-xs text-slate-600 sm:text-sm">Jornada {round}</p>
          </div>
        </div>

        <div className="min-w-0 -mx-1 px-1 sm:mx-0 sm:px-0">
          <JornadaSelector
            value={round}
            total={totalRounds}
            currentRound={currentRound}
            onChange={setRound}
          />
        </div>

        {data?.hasSavedRound && data.countPoints ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs font-bold text-slate-700 sm:text-sm">Puntos de la jornada</p>
            <p className="text-lg font-extrabold text-[#214C9B] sm:text-xl">
              {data.points} pts · {data.hits} aciertos
            </p>
          </div>
        ) : data?.hasSavedRound && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Los puntos se publican cuando empiece la jornada o haya resultados oficiales cargados.
          </p>
        ) : data && !data.hasSavedRound && data.countPoints && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            No participó en esta jornada. Resultados oficiales de los partidos jugados.
          </p>
        ) : null}

        {showCompareLegend ? (
          <p className="text-xs leading-5 text-slate-600 sm:text-sm">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#214C9B]" aria-hidden /> Pronóstico
            {" · "}
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#981915]" aria-hidden /> Resultado oficial
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando quinigol…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : hasMatches ? (
          <div className="space-y-3 sm:space-y-4">
            {matchday.matches.map((match) => (
              <QuinigolMatchForm
                key={match.id}
                match={match}
                prediction={data?.predictions[match.id]}
                mode={formMode}
                readOnly
                onChange={() => undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

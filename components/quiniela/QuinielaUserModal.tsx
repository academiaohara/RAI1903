"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Modal } from "@/components/Modal";
import { PredictionForm } from "@/components/PredictionForm";
import { useQuinielaUserRound } from "@/hooks/useQuinielaUserRound";
import type { CompetitionSeasonId } from "@/data/mock";
import { getMatchdayByRound, sortQuinielaMatches } from "@/lib/quiniela";
import type { Matchday } from "@/types";

type QuinielaUserModalProps = {
  open: boolean;
  onClose: () => void;
  seasonId: CompetitionSeasonId;
  userId: string;
  handle: string;
  avatarUrl: string | null;
  matchdays: Matchday[];
  initialRound?: number;
};

export function QuinielaUserModal({
  open,
  onClose,
  seasonId,
  userId,
  handle,
  avatarUrl,
  matchdays,
  initialRound,
}: QuinielaUserModalProps) {
  const [round, setRound] = useState<number | undefined>(initialRound);

  const { data, loading, error } = useQuinielaUserRound(seasonId, open ? userId : null, round);

  const activeRound = data?.round ?? round;
  const savedRounds = data?.savedRounds ?? [];
  const matchday = useMemo(
    () => (activeRound ? getMatchdayByRound(matchdays, activeRound) : { round: 0, matches: [] }),
    [matchdays, activeRound],
  );
  const orderedMatches = useMemo(() => sortQuinielaMatches(matchday.matches), [matchday.matches]);

  const currentIndex = activeRound ? savedRounds.indexOf(activeRound) : -1;
  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex >= 0 && currentIndex < savedRounds.length - 1;

  const goNewer = () => {
    if (canGoNewer) setRound(savedRounds[currentIndex - 1]);
  };

  const goOlder = () => {
    if (canGoOlder) setRound(savedRounds[currentIndex + 1]);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} title={`Quiniela de ${handle}`} onClose={handleClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={avatarUrl} label={handle} size="md" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-[#214C9B]">{handle}</p>
            {activeRound ? (
              <p className="text-xs text-slate-600 sm:text-sm">Jornada {activeRound}</p>
            ) : null}
          </div>
        </div>

        {savedRounds.length > 1 ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-slate-50 px-3 py-2">
            <button
              type="button"
              onClick={goOlder}
              disabled={!canGoOlder || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#214C9B] transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label="Jornada anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-center text-xs font-bold text-slate-700 sm:text-sm">
              Jornada <span className="text-[#214C9B]">{activeRound ?? "—"}</span>
              {savedRounds.length > 0 ? (
                <span className="text-slate-500"> · {savedRounds.length} guardadas</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={goNewer}
              disabled={!canGoNewer || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#214C9B] transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label="Jornada más reciente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}

        {data?.countPoints ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs font-bold text-slate-700 sm:text-sm">Puntos de la jornada</p>
            <p className="text-lg font-extrabold text-[#214C9B] sm:text-xl">{data.points} pts</p>
          </div>
        ) : data && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Los puntos se publican cuando empiece la jornada o haya resultados oficiales cargados.
          </p>
        ) : null}

        <p className="text-xs leading-5 text-slate-600 sm:text-sm">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#214C9B]" aria-hidden /> Tu pronóstico
          {" · "}
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#981915]" aria-hidden /> Resultado oficial
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando quiniela…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : orderedMatches.length === 0 ? (
          <p className="text-sm text-slate-500">No hay partidos configurados para esta jornada.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orderedMatches.map((match) => (
              <PredictionForm
                key={match.id}
                match={match}
                prediction={data?.predictions[match.id]}
                mode="compare"
                readOnly
                onChange={() => undefined}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

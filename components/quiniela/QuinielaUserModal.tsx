"use client";

import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { JornadaSelector } from "@/components/JornadaSelector";
import { QuinielaTicket } from "@/components/juegos/GameTicket";
import { Modal } from "@/components/Modal";
import { useQuinielaUserRound } from "@/hooks/useQuinielaUserRound";
import type { CompetitionSeasonId } from "@/data/mock";
import { getMatchdayByRound, sortQuinielaMatches } from "@/lib/quiniela";
import type { Matchday, Team } from "@/types";

type QuinielaUserModalProps = {
  open: boolean;
  onClose: () => void;
  seasonId: CompetitionSeasonId;
  userId: string;
  handle: string;
  avatarUrl: string | null;
  matchdays: Matchday[];
  teams: Team[];
  seasonLabel: string;
  competitionLabel: string;
  totalRounds: number;
  currentRound: number;
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
  teams,
  seasonLabel,
  competitionLabel,
  totalRounds,
  currentRound,
  initialRound,
}: QuinielaUserModalProps) {
  const [round, setRound] = useState(initialRound ?? currentRound);

  const { data, loading, error } = useQuinielaUserRound(seasonId, open ? userId : null, round);

  const matchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const orderedMatches = useMemo(() => sortQuinielaMatches(matchday.matches), [matchday.matches]);
  const hasMatches = orderedMatches.length > 0;
  const showPoints = Boolean(data?.hasSavedRound && data.countPoints);

  return (
    <Modal open={open} title={`Quiniela de ${handle}`} onClose={onClose} wide>
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

        {data?.hasSavedRound && !data.countPoints && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Los puntos se publican cuando empiece la jornada o haya resultados oficiales cargados.
          </p>
        ) : data && !data.hasSavedRound && data.countPoints && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            No participó en esta jornada.
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando quiniela…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : hasMatches && data?.hasSavedRound ? (
          <QuinielaTicket
            matches={orderedMatches}
            teams={teams}
            predictions={data.predictions}
            round={round}
            seasonLabel={seasonLabel}
            competitionLabel={competitionLabel}
            readOnly
            creatorHandle={handle}
            points={showPoints ? data.points : undefined}
            showActions={false}
          />
        ) : null}
      </div>
    </Modal>
  );
}

"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ClasificacionTicket } from "@/components/juegos/GameTicket";
import { Modal } from "@/components/Modal";
import { useClasificacionUserSubmission } from "@/hooks/useClasificacionUserSubmission";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import { buildActualStandingsByTeamId } from "@/lib/clasificacion-prediction";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Team } from "@/types";

type ClasificacionUserModalProps = {
  open: boolean;
  onClose: () => void;
  seasonId: CompetitionSeasonId;
  userId: string;
  handle: string;
  avatarUrl: string | null;
  teams: Team[];
  leagueMatchdays: Matchday[];
  zones: CompetitionZoneRule[];
  seasonLabel: string;
  competitionLabel: string;
};

export function ClasificacionUserModal({
  open,
  onClose,
  seasonId,
  userId,
  handle,
  avatarUrl,
  teams,
  leagueMatchdays,
  zones,
  seasonLabel,
  competitionLabel,
}: ClasificacionUserModalProps) {
  const { data, loading, error } = useClasificacionUserSubmission(seasonId, open ? userId : null);

  const actualPositions = useMemo(
    () => buildActualStandingsByTeamId(teams, leagueMatchdays),
    [teams, leagueMatchdays],
  );

  const showPoints = Boolean(data?.hasSubmission && data.countPoints);
  const showCompare = showPoints && actualPositions.size > 0;

  return (
    <Modal open={open} title={`Clasificación de ${handle}`} onClose={onClose} wide variant="ticket">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={avatarUrl} label={handle} size="md" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-[#214C9B]">{handle}</p>
            <p className="text-xs text-slate-600 sm:text-sm">Predicción de clasificación</p>
          </div>
        </div>

        {data?.hasSubmission && !data.countPoints && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Los puntos se publican cuando empiece la temporada.
          </p>
        ) : data && !data.hasSubmission && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Este usuario no ha enviado su predicción de clasificación.
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando predicción…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : data?.hasSubmission ? (
          <ClasificacionTicket
            teams={teams}
            predictions={data.predictions}
            zones={zones}
            seasonLabel={seasonLabel}
            competitionLabel={competitionLabel}
            readOnly
            creatorHandle={handle}
            points={showPoints ? data.points : undefined}
            actualPositions={showCompare ? actualPositions : undefined}
            showActions={false}
          />
        ) : null}
      </div>
    </Modal>
  );
}

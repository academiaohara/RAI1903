"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ClasificacionCompareBoard } from "@/components/clasificacion/ClasificacionCompareBoard";
import { ClasificacionForm } from "@/components/clasificacion/ClasificacionForm";
import { Modal } from "@/components/Modal";
import { useClasificacionUserSubmission } from "@/hooks/useClasificacionUserSubmission";
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
}: ClasificacionUserModalProps) {
  const { data, loading, error } = useClasificacionUserSubmission(seasonId, open ? userId : null);

  const actualPositions = useMemo(
    () => buildActualStandingsByTeamId(teams, leagueMatchdays),
    [teams, leagueMatchdays],
  );

  const hasSubmission = data?.hasSubmission ?? false;
  const countPoints = data?.countPoints ?? false;
  const formMode = hasSubmission ? "compare" : countPoints ? "results" : "edit";

  return (
    <Modal open={open} title={`Clasificación de ${handle}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={avatarUrl} label={handle} size="md" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-[#214C9B]">{handle}</p>
            <p className="text-xs text-slate-600 sm:text-sm">Predicción de clasificación</p>
          </div>
        </div>

        {data?.hasSubmission && data.countPoints ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs font-bold text-slate-700 sm:text-sm">Puntos acumulados</p>
            <p className="text-lg font-extrabold text-[#214C9B] sm:text-xl">{data.points} pts</p>
          </div>
        ) : data?.hasSubmission && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Los puntos se publican cuando empiece la temporada.
          </p>
        ) : data && !data.hasSubmission && !loading ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:text-sm">
            Este usuario no ha enviado su predicción de clasificación.
          </p>
        ) : null}

        {formMode === "compare" ? (
          <p className="text-xs leading-5 text-slate-600 sm:text-sm">
            Predicción del usuario frente a la clasificación actual, con diferencia de puestos y puntos por equipo.
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando predicción…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : data?.hasSubmission ? (
          formMode === "compare" ? (
            <ClasificacionCompareBoard
              teams={teams}
              predictions={data.predictions}
              actualPositions={actualPositions}
              predictionLabel="Su predicción"
            />
          ) : (
            <ClasificacionForm
              teams={teams}
              predictions={data.predictions}
              actualPositions={actualPositions}
              readOnly
              mode={formMode}
              onReorder={() => undefined}
            />
          )
        ) : null}
      </div>
    </Modal>
  );
}

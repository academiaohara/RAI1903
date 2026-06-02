"use client";

import Image from "next/image";
import { ChevronRight, Landmark } from "lucide-react";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { SquadStatsBar } from "@/components/squad/SquadStatsBar";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadClubInfo, SquadClubStats } from "@/types/squad";

type SquadHeaderProps = {
  club: SquadClubInfo;
  stats: SquadClubStats;
  gender: PrimerEquipoGender;
  onStadiumClick: () => void;
};

export function SquadHeader({ club, stats, gender, onStadiumClick }: SquadHeaderProps) {
  const { editMode } = useInlineEditing();

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex w-full min-w-0 flex-col items-start gap-4 text-left sm:w-auto sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
            <Image src={club.escudo} alt={club.nombre} width={80} height={80} className="h-full w-full object-contain" priority />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-extrabold uppercase tracking-tight text-slate-950 sm:text-4xl">
              {club.nombre}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">
              <span className="text-slate-500">Entrenador:</span>{" "}
              <EditableText
                storageKey={`squad-club:${gender}:entrenador`}
                value={club.entrenador}
                aria-label="Editar entrenador"
                inputClassName="text-sm font-semibold text-slate-800"
              />
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">Temporada {club.temporada}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStadiumClick}
          className="group flex w-full shrink-0 items-center gap-3 rounded-2xl border border-[#214C9B]/15 bg-gradient-to-r from-slate-50 to-blue-50/60 px-4 py-3 text-left shadow-sm transition hover:border-[#214C9B]/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B] sm:ml-auto sm:w-auto sm:min-w-[min(100%,22rem)] lg:min-w-[26rem]"
          aria-label={`Ver informacion de ${club.estadioInfo.nombre}`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#214C9B]/10 text-[#214C9B] transition group-hover:bg-[#214C9B]/15">
            <Landmark size={22} strokeWidth={2.25} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-slate-900 sm:text-base">{club.estadioInfo.nombre}</span>
            <span className="mt-0.5 block text-xs font-semibold text-[#214C9B]/80 group-hover:text-[#214C9B]">
              {editMode ? "Editar estadio del club" : "Ver informacion del estadio"}
            </span>
          </span>
          <ChevronRight
            size={20}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#214C9B]"
            aria-hidden
          />
        </button>
      </div>

      <SquadStatsBar stats={stats} />
    </div>
  );
}

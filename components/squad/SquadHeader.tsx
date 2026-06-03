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
  onEntrenadorChange?: (value: string) => void;
};

export function SquadHeader({ club, stats, gender, onStadiumClick, onEntrenadorChange }: SquadHeaderProps) {
  const { editMode } = useInlineEditing();

  return (
    <div className="flex w-full flex-col items-start gap-4 sm:gap-5">
      <div className="flex w-full min-w-0 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex w-full min-w-0 flex-row items-center gap-2.5 text-left sm:w-auto sm:gap-5">
          <div className="relative h-11 w-11 shrink-0 sm:h-20 sm:w-20">
            <Image src={club.escudo} alt={club.nombre} width={80} height={80} className="h-full w-full object-contain" priority />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1rem,5.1vw,1.25rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-slate-950 sm:break-words sm:text-4xl">
              {club.nombre}
            </h1>
            <p className="mt-1 truncate text-[11px] font-semibold text-slate-700 sm:mt-2 sm:text-base">
              <span className="text-slate-500">Entrenador:</span>{" "}
              {editMode && onEntrenadorChange ? (
                <input
                  value={club.entrenador}
                  onChange={(event) => onEntrenadorChange(event.target.value)}
                  aria-label="Editar entrenador"
                  className="inline-block max-w-[min(100%,14rem)] rounded-xl border border-[#214C9B]/25 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none ring-2 ring-transparent transition focus:border-[#214C9B] focus:ring-[#214C9B]/15 sm:max-w-xs"
                />
              ) : (
                <EditableText
                  storageKey={`squad-club:${gender}:entrenador`}
                  value={club.entrenador}
                  aria-label="Editar entrenador"
                  inputClassName="text-sm font-semibold text-slate-800"
                />
              )}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500 sm:mt-2 sm:text-xs">Temporada {club.temporada}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStadiumClick}
          className="group flex w-full shrink-0 items-center gap-2 rounded-2xl border border-[#214C9B]/15 bg-gradient-to-r from-slate-50 to-blue-50/60 px-3 py-2.5 text-left shadow-sm transition hover:border-[#214C9B]/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B] sm:ml-auto sm:w-auto sm:min-w-[min(100%,22rem)] sm:gap-3 sm:px-4 sm:py-3 lg:min-w-[26rem]"
          aria-label={`Ver informacion de ${club.estadioInfo.nombre}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#214C9B]/10 text-[#214C9B] transition group-hover:bg-[#214C9B]/15 sm:h-11 sm:w-11">
            <Landmark size={20} strokeWidth={2.25} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-slate-900 sm:text-base">{club.estadioInfo.nombre}</span>
            <span className="mt-0.5 block text-[10px] font-semibold text-[#214C9B]/80 group-hover:text-[#214C9B] sm:text-xs">
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

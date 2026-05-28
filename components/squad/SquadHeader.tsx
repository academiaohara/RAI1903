"use client";

import Image from "next/image";
import type { SquadClubInfo } from "@/types/squad";

type SquadHeaderProps = {
  club: SquadClubInfo;
  onStadiumClick: () => void;
};

export function SquadHeader({ club, onStadiumClick }: SquadHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex w-full min-w-0 flex-col items-start gap-4 text-left sm:w-auto sm:flex-row sm:items-center sm:gap-5 sm:text-left">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/15 bg-white p-2.5 shadow-sm sm:h-20 sm:w-20">
          <Image src={club.escudo} alt={club.nombre} width={64} height={64} className="h-auto w-full object-contain drop-shadow-lg" priority />
        </div>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-extrabold uppercase tracking-tight text-slate-950 sm:text-4xl">
            {club.nombre}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">
            <span className="text-slate-500">Entrenador:</span> {club.entrenador}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Temporada {club.temporada}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStadiumClick}
        className="w-full text-left"
        aria-label={`Ver informacion de ${club.estadioInfo.nombre}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <Image src={club.estadioInfo.imagen} alt={club.estadioInfo.nombre} fill className="object-cover" sizes="100vw" />
        </div>
        <span className="mt-3 block text-sm font-bold text-slate-900 sm:text-base">{club.estadioInfo.nombre}</span>
      </button>
    </div>
  );
}

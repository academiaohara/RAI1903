"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { SeasonSelector } from "@/components/SeasonSelector";
import { cn } from "@/lib/utils";
import {
  genderLabels,
  primerEquipoPathForGender,
  PRIMER_EQUIPO_GENDERS,
  type PrimerEquipoGender,
} from "@/lib/primer-equipo";

export function PrimerEquipoHeaderActions({ gender }: { gender: PrimerEquipoGender }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Modo de equipo y temporada">
      {PRIMER_EQUIPO_GENDERS.map((option) => {
        const active = gender === option;
        return (
          <Link
            key={option}
            href={primerEquipoPathForGender(pathname, option) as Route}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-normal transition",
              active
                ? "border-[#214C9B] bg-[#214C9B] !text-white shadow-md shadow-blue-950/10"
                : "border-[#214C9B]/20 bg-blue-50 text-[#214C9B] hover:border-[#981915] hover:bg-red-50 hover:text-[#981915]",
            )}
          >
            {genderLabels[option].title}
          </Link>
        );
      })}
      <SeasonSelector />
    </div>
  );
}

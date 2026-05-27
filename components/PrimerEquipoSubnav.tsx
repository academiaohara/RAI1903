"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { SectionTabs } from "@/components/SectionTabs";
import { cn } from "@/lib/utils";
import {
  genderLabels,
  getPrimerEquipoTabs,
  primerEquipoPathForGender,
  PRIMER_EQUIPO_GENDERS,
  type PrimerEquipoGender,
} from "@/lib/primer-equipo";

export function PrimerEquipoSubnav({ gender }: { gender: PrimerEquipoGender }) {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Modo de equipo">
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
                    ? "border-[#214C9B] bg-[#214C9B] text-white shadow-md shadow-blue-950/10"
                    : "border-[#214C9B]/20 bg-blue-50 text-[#214C9B] hover:border-[#981915] hover:bg-red-50 hover:text-[#981915]",
                )}
              >
                {genderLabels[option].title}
              </Link>
            );
          })}
        </div>
      </div>
      <SectionTabs tabs={getPrimerEquipoTabs(gender)} />
    </div>
  );
}

"use client";

import { SeasonSelector } from "@/components/SeasonSelector";
import { SubsectionNav } from "@/components/SubsectionNav";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoContextBar({ gender }: { gender: PrimerEquipoGender }) {
  const tabs = getPrimerEquipoTabs(gender);

  return (
    <section aria-label="Contexto de primer equipo" className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <SubsectionNav tabs={tabs} className="min-w-0 flex-1" />
        <SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 sm:w-auto sm:shrink-0" />
      </div>
    </section>
  );
}

"use client";

import { SubsectionNav } from "@/components/SubsectionNav";
import { SeasonSelector } from "@/components/SeasonSelector";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoContextBar({ gender }: { gender: PrimerEquipoGender }) {
  const tabs = getPrimerEquipoTabs(gender);

  return (
    <section aria-label="Contexto de primer equipo">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SubsectionNav tabs={tabs} />

        <div
          className="flex flex-wrap items-center gap-2 border-t border-[#214C9B]/10 pt-3 lg:border-t-0 lg:pt-0"
          role="group"
          aria-label="Temporada"
        >
          <SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5" />
        </div>
      </div>
    </section>
  );
}

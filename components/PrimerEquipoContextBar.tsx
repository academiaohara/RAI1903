"use client";

import { SubsectionNav } from "@/components/SubsectionNav";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoContextBar({ gender }: { gender: PrimerEquipoGender }) {
  const tabs = getPrimerEquipoTabs(gender);

  return (
    <section aria-label="Contexto de primer equipo">
      <SubsectionNav tabs={tabs} />
    </section>
  );
}

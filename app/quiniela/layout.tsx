"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionUnderConstructionGate
      scope="masculino"
      section="jornadas"
      labelOverride="Quiniela"
      editorHintOverride="La quiniela depende de las jornadas del primer equipo. Los visitantes no la ven mientras Jornadas esté en construcción. Desmarca «En construcción» en Jornadas (Editar → Secciones) cuando estén listas."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <SectionTabs tabs={[...QUINIELA_TABS]} className="min-w-0 flex-1" />
          <SeasonSelector className="border-[#214C9B]/20 sm:w-auto sm:shrink-0" />
        </div>
        {children}
      </div>
    </SectionUnderConstructionGate>
  );
}

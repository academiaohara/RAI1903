"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { QUINIELA_TABS } from "@/lib/quiniela";

export default function QuinielaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <SectionTabs tabs={[...QUINIELA_TABS]} className="min-w-0 flex-1" />
        <SeasonSelector className="border-[#214C9B]/20 sm:w-auto sm:shrink-0" />
      </div>
      <SectionUnderConstructionGate
        scope="masculino"
        section="jornadas"
        labelOverride="Quiniela"
        editorHintOverride="La quiniela depende de las jornadas del primer equipo. Los visitantes no la ven mientras Jornadas esté en construcción para esta temporada. Desmarca «En construcción» en Jornadas (Editar → Secciones) cuando estén listas."
        publicHintOverride="Estamos preparando la quiniela para esta temporada. Selecciona otra temporada arriba para ver pronósticos, resultados y ranking de temporadas anteriores."
      >
        {children}
      </SectionUnderConstructionGate>
    </div>
  );
}

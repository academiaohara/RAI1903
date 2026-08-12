"use client";

import { usePathname } from "next/navigation";
import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { SubsectionNav } from "@/components/SubsectionNav";
import {
  GAME_MODES,
  GAME_MODE_LABELS,
  GAME_TABS,
  gameModeHref,
  gameTabHref,
  isGameModeId,
  type GameModeId,
} from "@/lib/juegos";

function resolveGameMode(pathname: string): GameModeId {
  const segments = pathname.split("/").filter(Boolean);
  const gameSegment = segments[1];
  return isGameModeId(gameSegment) ? gameSegment : "quiniela";
}

export default function JuegosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const gameMode = resolveGameMode(pathname);

  const gameTabs = GAME_MODES.map((mode) => ({
    href: gameModeHref(mode.id),
    label: mode.label,
  }));

  const sectionTabs = GAME_TABS.map((tab) => ({
    href: gameTabHref(gameMode, tab.slug),
    label: tab.label,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <SubsectionNav tabs={gameTabs} ariaLabel="Juegos" className="min-w-0 flex-1" />
          <SeasonSelector className="border-[#214C9B]/20 sm:w-auto sm:shrink-0" />
        </div>
        <SectionTabs tabs={sectionTabs} className="min-w-0" />
      </div>
      <SectionUnderConstructionGate
        scope="masculino"
        section="jornadas"
        labelOverride={GAME_MODE_LABELS[gameMode]}
        editorHintOverride="Los juegos dependen de las jornadas del primer equipo. Los visitantes no los ven mientras Jornadas esté en construcción para esta temporada. Desmarca «En construcción» en Jornadas (Editar → Secciones) cuando estén listas."
        publicHintOverride="Estamos preparando los juegos para esta temporada. Selecciona otra temporada arriba para ver pronósticos, resultados y ranking de temporadas anteriores."
      >
        {children}
      </SectionUnderConstructionGate>
    </div>
  );
}

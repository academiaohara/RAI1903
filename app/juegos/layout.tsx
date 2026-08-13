"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SectionTabs } from "@/components/SectionTabs";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import {
  GAME_MODES,
  GAME_MODE_LABELS,
  GAME_TABS,
  gameModeHref,
  gameTabHref,
  isGameModeId,
  type GameModeId,
} from "@/lib/juegos";
import { cn } from "@/lib/utils";

function resolveGameMode(pathname: string): GameModeId {
  const segments = pathname.split("/").filter(Boolean);
  const gameSegment = segments[1];
  return isGameModeId(gameSegment) ? gameSegment : "quiniela";
}

export default function JuegosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const gameMode = resolveGameMode(pathname);

  const sectionTabs = GAME_TABS.map((tab) => ({
    href: gameTabHref(gameMode, tab.slug),
    label: tab.label,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <nav className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto" aria-label="Juegos">
            {GAME_MODES.map((mode) => {
              const href = gameModeHref(mode.id);
              const active = gameMode === mode.id;
              const logo = mode.id === "quiniela"
                ? "/juegos/rainiela.svg"
                : mode.id === "quinigol"
                  ? "/juegos/raigol.svg"
                  : "/api/game-logo/oraculo";
              return (
                <Link
                  key={mode.id}
                  href={href}
                  aria-label={mode.label}
                  title={mode.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border p-2 transition",
                    active
                      ? "border-[#214C9B] bg-blue-50 shadow-sm"
                      : "border-transparent hover:border-[#214C9B]/25 hover:bg-white",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="" className="h-full w-full object-contain" />
                </Link>
              );
            })}
          </nav>
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

"use client";

import { usePathname } from "next/navigation";
import { SeasonSelector } from "@/components/SeasonSelector";
import { SubsectionNav } from "@/components/SubsectionNav";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoContextBar({ gender }: { gender: PrimerEquipoGender }) {
  const pathname = usePathname();
  const tabs = getPrimerEquipoTabs(gender);
  const isCronicaPage = pathname.includes("/cronicas");
  const seasonSelectorInHero =
    pathname.endsWith("/competicion") ||
    pathname.endsWith("/jornadas") ||
    pathname.endsWith("/calendario") ||
    pathname.endsWith("/noticias");
  const seasonSelectorWrapperClass = isCronicaPage
    ? "hidden"
    : pathname.endsWith("/plantilla") || seasonSelectorInHero
      ? "hidden sm:block"
      : "";

  return (
    <section aria-label="Contexto de primer equipo" className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <SubsectionNav tabs={tabs} className="min-w-0 flex-1" />
        <div className={seasonSelectorWrapperClass}>
          <SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 sm:w-auto sm:shrink-0" />
        </div>
      </div>
    </section>
  );
}

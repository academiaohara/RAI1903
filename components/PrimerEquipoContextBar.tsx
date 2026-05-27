"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { SeasonSelector } from "@/components/SeasonSelector";
import { cn } from "@/lib/utils";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoContextBar({ gender }: { gender: PrimerEquipoGender }) {
  const pathname = usePathname();
  const tabs = getPrimerEquipoTabs(gender);

  return (
    <section aria-label="Contexto de primer equipo">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto" aria-label="Subsecciones">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href as Route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-normal transition",
                  active
                    ? "bg-[#214C9B] !text-white shadow-md shadow-blue-950/15 hover:!text-white"
                    : "text-[#214C9B] hover:bg-blue-50",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

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

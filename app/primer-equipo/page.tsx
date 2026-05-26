import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { genderLabels, primerEquipoBase } from "@/lib/primer-equipo";
import type { Route } from "next";

export default function PrimerEquipoSelectorPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Primer Equipo"
        title="Elige plantilla"
        description="Selecciona el equipo masculino o femenino para ver plantilla, competicion, cronicas y previas."
      />

      <section className="grid min-h-[22rem] grid-cols-1 overflow-hidden rounded-[2rem] border border-[#214C9B]/25 shadow-[0_18px_45px_rgba(17,24,39,0.08)] md:grid-cols-2">
        <Link
          href={`${primerEquipoBase("masculino")}/plantilla` as Route}
          className="group relative flex min-h-72 flex-col justify-end bg-gradient-to-br from-[#214C9B] via-[#1a3d7a] to-[#0f274f] p-8 text-white transition hover:brightness-110 md:rounded-r-none"
        >
          <p className="text-xs font-bold uppercase tracking-normal text-white/70">Izquierda</p>
          <h2 className="mt-2 text-4xl font-extrabold uppercase leading-none sm:text-5xl">{genderLabels.masculino.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/85">{genderLabels.masculino.club}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-normal">
            Ver masculino <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href={`${primerEquipoBase("femenino")}/plantilla` as Route}
          className="group relative flex min-h-72 flex-col justify-end bg-gradient-to-bl from-[#981915] via-[#7f1311] to-[#4a0b0a] p-8 text-white transition hover:brightness-110 md:rounded-l-none"
        >
          <p className="text-xs font-bold uppercase tracking-normal text-white/70">Derecha</p>
          <h2 className="mt-2 text-4xl font-extrabold uppercase leading-none sm:text-5xl">{genderLabels.femenino.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/85">{genderLabels.femenino.club}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-normal">
            Ver femenino <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </div>
  );
}

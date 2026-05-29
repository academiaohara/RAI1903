"use client";

import { Card } from "@/components/Card";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import type { PlayoffBracketSlot, PlayoffGroupRef } from "@/lib/rfef-rules/types";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { ArrowRightLeft, Trophy } from "lucide-react";

type PlayoffAscensoGuiaProps = {
  isProvisional?: boolean;
};

const CUADRO_META = [
  { id: "A" as const, label: "Cuadro A", sfIds: ["sf1", "sf2"] as const },
  { id: "B" as const, label: "Cuadro B", sfIds: ["sf3", "sf4"] as const },
];

const SEMIFINAL_SLOTS = PRIMERA_RFEF_RULES.playoff.bracket.semifinals;

function grupoDisplayName(groupId: RfefGrupoId): string {
  return groupId === "1" ? "Grupo I" : "Grupo II";
}

function qualifierLabel(ref: PlayoffGroupRef): string {
  return `${ref.position}.º del ${grupoDisplayName(ref.groupId)}`;
}

function semifinalCruceLabel(slot: PlayoffBracketSlot): string {
  return `${qualifierLabel(slot.home)} – ${qualifierLabel(slot.away)}`;
}

function finalExampleLabel(slots: readonly PlayoffBracketSlot[]): string {
  const [first, second] = slots;
  if (!first || !second) return "";
  return `los ganadores del cruce ${semifinalCruceLabel(first)} y del cruce ${semifinalCruceLabel(second)}`;
}

function SemifinalRow({ slot }: { slot: PlayoffBracketSlot }) {
  return (
    <li className="flex items-center gap-2 rounded-xl border border-[#214C9B]/12 bg-slate-50/80 px-3 py-2.5">
      <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-900">
        {qualifierLabel(slot.home)}
      </span>
      <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-slate-400">vs</span>
      <span className="min-w-0 flex-1 text-right text-sm font-bold leading-snug text-slate-900">
        {qualifierLabel(slot.away)}
      </span>
    </li>
  );
}

function CuadroPanel({
  label,
  slots,
}: {
  label: string;
  slots: readonly PlayoffBracketSlot[];
}) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
      <p className="text-xs font-extrabold uppercase tracking-wide text-[#214C9B]">{label}</p>
      <ul className="mt-3 space-y-2">
        {slots.map((slot) => (
          <SemifinalRow key={slot.id} slot={slot} />
        ))}
      </ul>
      <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
        <span className="font-extrabold text-slate-800">Final:</span> ganador de la primera semifinal vs ganador de
        la segunda.
      </p>
    </div>
  );
}

export function PlayoffAscensoGuia({ isProvisional }: PlayoffAscensoGuiaProps) {
  const cuadros = CUADRO_META.map(({ label, sfIds }) => ({
    label,
    slots: SEMIFINAL_SLOTS.filter((slot) => (sfIds as readonly string[]).includes(slot.id)),
  }));

  return (
    <Card
      eyebrow="1ª RFEF"
      title="Playoff de ascenso a Segunda División"
      borderlessHeader
      className="scroll-mt-24"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-lg font-extrabold text-slate-900">Cómo se forman las semifinales</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Juegan los equipos que acabaron entre el 2.º y el 5.º de cada grupo de Primera Federación. La RFEF separa
            a los ocho equipos en dos cuadros de cuatro clubes. Dentro de cada cuadro se cruzan equipos de grupos
            distintos para evitar enfrentamientos entre clubes del mismo grupo en la primera ronda.
          </p>
          {isProvisional && (
            <p className="text-sm font-bold text-[#981915]">
              Los partidos de esta jornada se calculan con la clasificación de la jornada de liga que tengas
              seleccionada; el cuadro de abajo describe los cruces oficiales por puesto.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {cuadros.map((cuadro) => (
              <CuadroPanel key={cuadro.label} label={cuadro.label} slots={cuadro.slots} />
            ))}
          </div>
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-[#214C9B]" aria-hidden />
            <span>La vuelta se juega en casa del equipo mejor clasificado en la fase regular.</span>
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-extrabold text-slate-900">¿Qué pasa si hay empate?</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            La eliminatoria es a doble partido. Si tras los 180 minutos el resultado global está empatado, hay
            prórroga. Si sigue el empate, no hay penaltis: pasa el equipo que terminó mejor clasificado en la liga
            regular.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-extrabold text-slate-900">Cómo serían las finales</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Los ganadores de cada semifinal se enfrentan dentro de su mismo cuadro. Por tanto, habrá dos finales
            independientes y los vencedores de cada una ascenderán a Segunda División, junto al 1.º de cada grupo.
          </p>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-sm leading-relaxed text-slate-700">
            <p className="font-extrabold text-emerald-900">Ejemplo por cuadro</p>
            <p className="mt-2">
              En el cuadro A, si pasan {finalExampleLabel(cuadros[0]?.slots ?? [])}, disputarían la final entre
              ellos. En el cuadro B, lo harían {finalExampleLabel(cuadros[1]?.slots ?? [])}. Los dos ganadores
              subirían junto al 1.º del Grupo I y al 1.º del Grupo II.
            </p>
          </div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
            <Trophy className="h-4 w-4 text-emerald-600" aria-hidden />
            <span>Ascenso directo:</span>
            <span>1.º del Grupo I</span>
            <span className="text-slate-400">·</span>
            <span>1.º del Grupo II</span>
          </p>
        </section>
      </div>
    </Card>
  );
}

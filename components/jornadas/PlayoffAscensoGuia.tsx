"use client";

import { Card } from "@/components/Card";
import { TeamCrest } from "@/components/TeamCrest";
import {
  groupPlayoffBracketByCuadro,
  playoffTeamDisplayName,
  type PlayoffCuadroView,
} from "@/lib/playoff-jornadas";
import type { PlayoffBracket } from "@/lib/rfef-rules/types";
import { getTeam } from "@/lib/fixtures";
import { ArrowRightLeft, Trophy } from "lucide-react";

type PlayoffAscensoGuiaProps = {
  bracket: PlayoffBracket;
  directChampions: { name: string; teamId: string }[];
  isProvisional?: boolean;
};

function SemifinalRow({
  homeTeamId,
  awayTeamId,
}: {
  homeTeamId: string;
  awayTeamId: string;
}) {
  const home = getTeam(homeTeamId);
  const away = getTeam(awayTeamId);

  return (
    <li className="flex items-center gap-2 rounded-xl border border-[#214C9B]/12 bg-slate-50/80 px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {home ? <TeamCrest team={home} size="sm" className="h-8 w-8 shrink-0" /> : null}
        <span className="truncate text-sm font-bold text-slate-900">{playoffTeamDisplayName(homeTeamId)}</span>
      </div>
      <span className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-slate-400">vs</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-right text-sm font-bold text-slate-900">
          {playoffTeamDisplayName(awayTeamId)}
        </span>
        {away ? <TeamCrest team={away} size="sm" className="h-8 w-8 shrink-0" /> : null}
      </div>
    </li>
  );
}

function CuadroPanel({ cuadro }: { cuadro: PlayoffCuadroView }) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
      <p className="text-xs font-extrabold uppercase tracking-wide text-[#214C9B]">{cuadro.label}</p>
      <ul className="mt-3 space-y-2">
        {cuadro.semifinals.map((tie) => (
          <SemifinalRow key={tie.slotId} homeTeamId={tie.homeTeamId} awayTeamId={tie.awayTeamId} />
        ))}
      </ul>
      {cuadro.final && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
          <span className="font-extrabold text-slate-800">Final:</span> ganador de la primera semifinal vs ganador de
          la segunda.
        </p>
      )}
    </div>
  );
}

export function PlayoffAscensoGuia({ bracket, directChampions, isProvisional }: PlayoffAscensoGuiaProps) {
  const cuadros = groupPlayoffBracketByCuadro(bracket);
  const cuadroA = cuadros.find((c) => c.id === "A");
  const cuadroB = cuadros.find((c) => c.id === "B");

  const exampleSfA = cuadroA?.semifinals ?? [];
  const exampleSfB = cuadroB?.semifinals ?? [];
  const exampleWinners =
    exampleSfA.length >= 2 && exampleSfB.length >= 2
      ? {
          finalA: `${playoffTeamDisplayName(exampleSfA[0].awayTeamId)} y ${playoffTeamDisplayName(exampleSfA[1].homeTeamId)}`,
          finalB: `${playoffTeamDisplayName(exampleSfB[0].homeTeamId)} y ${playoffTeamDisplayName(exampleSfB[1].awayTeamId)}`,
        }
      : null;

  const championsLabel =
    directChampions.length >= 2
      ? `${directChampions[0].name} y ${directChampions[1].name}`
      : "los campeones de cada grupo";

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
              Los cruces mostrados se calculan con la clasificación de la jornada de liga que tengas seleccionada.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {cuadros.map((cuadro) => (
              <CuadroPanel key={cuadro.id} cuadro={cuadro} />
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
            independientes y los vencedores de cada una ascenderán a Segunda División, junto a los campeones de grupo.
          </p>
          {exampleWinners && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-sm leading-relaxed text-slate-700">
              <p className="font-extrabold text-emerald-900">Ejemplo con los cruces actuales</p>
              <p className="mt-2">
                Si pasan, por ejemplo, {exampleWinners.finalA}, jugarían una final entre ellos en el cuadro A. Si
                pasan {exampleWinners.finalB}, disputarían la otra final en el cuadro B. Los dos ganadores subirían
                junto a los campeones de grupo, {championsLabel}.
              </p>
            </div>
          )}
          {directChampions.length > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
              <Trophy className="h-4 w-4 text-emerald-600" aria-hidden />
              <span>Ascenso directo esta temporada:</span>
              {directChampions.map((champion) => {
                const team = getTeam(champion.teamId);
                return team ? (
                  <span key={champion.teamId} className="inline-flex items-center gap-1.5">
                    <TeamCrest team={team} size="sm" className="h-6 w-6" />
                    {champion.name}
                  </span>
                ) : (
                  <span key={champion.teamId}>{champion.name}</span>
                );
              })}
            </p>
          )}
        </section>
      </div>
    </Card>
  );
}

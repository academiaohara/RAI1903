"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { RAI_TEAM_ID } from "@/data/mock";
import { useEditedMatchdays } from "@/hooks/useEditedMatchdays";
import { useMasculinoLeagueSeason } from "@/hooks/useMasculinoLeagueSeason";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamStandingsEvolution } from "@/lib/standings-evolution";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { Matchday, Team } from "@/types";

const CHART_WIDTH = 800;
const CHART_HEIGHT = 280;
const PAD = { top: 28, right: 24, bottom: 40, left: 44 };
const MAROON = "#981915";

type StandingsEvolutionChartProps = {
  teamId?: string;
  className?: string;
  gender?: PrimerEquipoGender;
  teams?: Team[];
  matchdays?: Matchday[];
  zones?: StandingsZonesConfig;
  tiebreak?: LeagueTiebreakContext;
  subtitle?: string;
};

function formatPointLabel(round: number, position: number) {
  return `J${round} · ${position}º`;
}

export function StandingsEvolutionChart({
  teamId = RAI_TEAM_ID,
  className,
  gender = "masculino",
  teams: teamsProp,
  matchdays: matchdaysProp,
  zones: zonesProp,
  tiebreak: tiebreakProp,
  subtitle: subtitleProp,
}: StandingsEvolutionChartProps) {
  const masculinoSeason = useMasculinoLeagueSeason();
  const editedExternalMatchdays = useEditedMatchdays(matchdaysProp ?? [], gender);
  const useExternalData = teamsProp !== undefined && matchdaysProp !== undefined;

  const teams = useExternalData ? teamsProp : masculinoSeason.teams;
  const editedLeagueMatchdays = useExternalData ? editedExternalMatchdays : masculinoSeason.editedLeagueMatchdays;
  const zones = zonesProp ?? PRIMERA_RFEF_RULES.zones;
  const tiebreak = tiebreakProp ?? PRIMERA_RFEF_RULES.tiebreak;
  const subtitle = subtitleProp ?? "Liga · 1ª RFEF Grupo I";

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const points = useMemo(
    () => getTeamStandingsEvolution(teamId, teams, editedLeagueMatchdays, zones, tiebreak),
    [teamId, teams, editedLeagueMatchdays, zones, tiebreak],
  );
  const teamCount = teams.length;

  if (points.length < 2) {
    return (
      <Card
        eyebrow="Liga"
        title="Evolución de la clasificación"
        className={className}
        borderlessHeader
      >
        <p className="text-sm font-bold text-slate-500">
          Aún no hay jornadas suficientes para mostrar la evolución en la tabla.
        </p>
      </Card>
    );
  }

  const plotW = CHART_WIDTH - PAD.left - PAD.right;
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const lastPoint = points[points.length - 1];

  const xAt = (index: number) =>
    PAD.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * plotW);
  const yAt = (position: number) =>
    PAD.top + ((position - 1) / Math.max(teamCount - 1, 1)) * plotH;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(point.position)}`)
    .join(" ");

  const zoneRects = [
    { from: 1, to: zones.promotion, fill: "rgba(16,185,129,0.08)" },
    ...(zones.playoff > 0
      ? [
          {
            from: zones.promotion + 1,
            to: zones.promotion + zones.playoff,
            fill: "rgba(56,189,248,0.08)",
          },
        ]
      : []),
    ...(zones.relegation > 0
      ? [
          {
            from: teamCount - zones.relegation + 1,
            to: teamCount,
            fill: "rgba(244,63,94,0.08)",
          },
        ]
      : []),
  ];

  const yTicks = [
    1,
    ...(zones.playoff > 0 ? [zones.promotion + 1, zones.promotion + zones.playoff + 1] : []),
    ...(zones.relegation > 0 ? [teamCount - zones.relegation + 1] : []),
    teamCount,
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  return (
    <Card
      eyebrow={subtitle}
      title="Evolución de la clasificación"
      className={className}
      borderlessHeader
      action={
        <p className="text-[10px] font-bold leading-snug text-slate-600 sm:text-sm">
          <span className="text-slate-500">Pos. actual:</span>{" "}
          <span className="text-[#214C9B]">
            {lastPoint.position}º · J{lastPoint.round}
          </span>
        </p>
      }
    >
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="relative z-0 h-auto w-full min-w-[300px]"
          role="img"
          aria-label={`Evolución de la posición en liga por jornada. Posición actual ${lastPoint.position} en la jornada ${lastPoint.round}`}
        >
          {zoneRects.map((zone) => (
            <rect
              key={`${zone.from}-${zone.to}`}
              x={PAD.left}
              y={yAt(zone.from)}
              width={plotW}
              height={yAt(zone.to) - yAt(zone.from)}
              fill={zone.fill}
            />
          ))}

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={yAt(tick)}
                x2={PAD.left + plotW}
                y2={yAt(tick)}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 10}
                y={yAt(tick) + 4}
                textAnchor="end"
                className="fill-slate-500 text-[11px] font-bold"
              >
                {tick}
              </text>
            </g>
          ))}

          <path d={linePath} fill="none" stroke="#214C9B" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

          {points.map((point, index) => (
            <g key={point.round}>
              <circle
                cx={xAt(index)}
                cy={yAt(point.position)}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={formatPointLabel(point.round, point.position)}
              />
              <circle
                cx={xAt(index)}
                cy={yAt(point.position)}
                r={5}
                fill="#214C9B"
                pointerEvents="none"
                className={hoveredIndex === index ? "opacity-100" : undefined}
              />
              <circle
                cx={xAt(index)}
                cy={yAt(point.position)}
                r={8}
                fill="#214C9B"
                fillOpacity={hoveredIndex === index ? 0.3 : 0.15}
                pointerEvents="none"
              />
              <text
                x={xAt(index)}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-bold"
                pointerEvents="none"
              >
                J{point.round}
              </text>
            </g>
          ))}
        </svg>

        {hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-extrabold text-white"
            style={{
              left: `${(xAt(hoveredIndex) / CHART_WIDTH) * 100}%`,
              top: `${(yAt(points[hoveredIndex].position) / CHART_HEIGHT) * 100}%`,
              backgroundColor: MAROON,
            }}
            role="tooltip"
          >
            {formatPointLabel(points[hoveredIndex].round, points[hoveredIndex].position)}
          </div>
        )}
      </div>

      {(zones.playoff > 0 || zones.relegation > 0) && (
        <ul className="mt-2 grid grid-cols-3 gap-1.5 text-[9px] font-bold text-slate-600 sm:mt-4 sm:flex sm:flex-wrap sm:gap-4 sm:text-[11px]">
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500/80 sm:h-2.5 sm:w-2.5" aria-hidden />
            Ascenso directo
          </li>
          {zones.playoff > 0 ? (
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-sky-400/80 sm:h-2.5 sm:w-2.5" aria-hidden />
              Playoff
            </li>
          ) : null}
          {zones.relegation > 0 ? (
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-rose-500/80 sm:h-2.5 sm:w-2.5" aria-hidden />
              Descenso
            </li>
          ) : null}
        </ul>
      )}
    </Card>
  );
}

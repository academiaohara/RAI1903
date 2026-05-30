"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { matchdays, RAI_TEAM_ID, teams } from "@/data/mock";
import { getTeamStandingsEvolution } from "@/lib/standings-evolution";
import { PRIMERA_RFEF_STANDINGS_ZONES } from "@/lib/rfef-rules";

const CHART_WIDTH = 800;
const CHART_HEIGHT = 280;
const PAD = { top: 28, right: 24, bottom: 40, left: 44 };

type StandingsEvolutionChartProps = {
  teamId?: string;
  className?: string;
};

export function StandingsEvolutionChart({ teamId = RAI_TEAM_ID, className }: StandingsEvolutionChartProps) {
  const points = useMemo(() => getTeamStandingsEvolution(teamId, teams, matchdays), [teamId]);
  const teamCount = teams.length;
  const zones = PRIMERA_RFEF_STANDINGS_ZONES;

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
    {
      from: zones.promotion + 1,
      to: zones.promotion + zones.playoff,
      fill: "rgba(56,189,248,0.08)",
    },
    {
      from: teamCount - zones.relegation + 1,
      to: teamCount,
      fill: "rgba(244,63,94,0.08)",
    },
  ];

  const yTicks = [1, zones.promotion + 1, zones.promotion + zones.playoff + 1, teamCount].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  );

  return (
    <Card
      eyebrow="Liga · 1ª RFEF Grupo I"
      title="Evolución de la clasificación"
      className={className}
      borderlessHeader
      action={
        <p className="text-sm font-bold text-slate-600">
          Posición actual:{" "}
          <span className="text-[#214C9B]">
            {lastPoint.position}º · J{lastPoint.round}
          </span>
        </p>
      }
    >
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full min-w-[320px]"
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
              <circle cx={xAt(index)} cy={yAt(point.position)} r={5} fill="#214C9B" />
              <circle cx={xAt(index)} cy={yAt(point.position)} r={8} fill="#214C9B" fillOpacity={0.15} />
              <text
                x={xAt(index)}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-bold"
              >
                J{point.round}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ul className="mt-4 flex flex-wrap gap-4 text-[11px] font-bold text-slate-600">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" aria-hidden />
          Ascenso directo
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400/80" aria-hidden />
          Playoff
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500/80" aria-hidden />
          Descenso
        </li>
      </ul>
    </Card>
  );
}

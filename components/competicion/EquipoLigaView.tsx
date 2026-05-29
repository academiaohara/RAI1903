import type { ReactNode } from "react";
import Link from "next/link";
import { TeamCrest } from "@/components/TeamCrest";
import { Card } from "@/components/Card";
import { InjuryIcon, RedCardIcon, YellowCardIcon } from "@/components/competicion/AvailabilityIcons";
import { LeagueTable } from "@/components/LeagueTable";
import { getRivalAvailability, getRivalSquad, type RivalPlayer } from "@/lib/rival-squads";
import { getBalancedStandingsWindow } from "@/lib/standings-window";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { cn, formatGoalDifference } from "@/lib/utils";
import type { Route } from "next";
import type { Team } from "@/types";

type EquipoLigaViewProps = {
  gender: PrimerEquipoGender;
  team: Team;
  allTeams: Team[];
};

export function EquipoLigaView({ gender, team, allTeams }: EquipoLigaViewProps) {
  const squad = getRivalSquad(team);
  const { injured, cautioned, suspended } = getRivalAvailability(team);
  const fieldPlayers = squad.filter((player) => player.status === "titular" || player.status === "suplente");
  const windowTeams = getBalancedStandingsWindow(allTeams, team.id, 10);
  const diff = team.stats.goalsFor - team.stats.goalsAgainst;
  const backHref = `${primerEquipoBase(gender)}/competicion` as Route;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#214C9B] transition hover:text-[#981915]"
      >
        ← Volver a competicion
      </Link>

      <Card eyebrow="Guia de la liga" title={team.name} borderlessHeader>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <TeamCrest team={team} size="lg" className="shrink-0" />
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <InfoItem label="Entrenador" value={team.coach} />
            <InfoItem label="Estadio" value={team.stadium} />
            <InfoItem label="Ciudad" value={team.city} />
            <InfoItem label="Posicion" value={`${team.position}º en liga`} />
          </div>
        </div>
      </Card>

      <Card eyebrow="Temporada" title="Estadisticas" borderlessHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <StatBox label="PJ" value={team.stats.played} />
          <StatBox label="G" value={team.stats.won} />
          <StatBox label="E" value={team.stats.drawn} />
          <StatBox label="P" value={team.stats.lost} />
          <StatBox label="GF" value={team.stats.goalsFor} />
          <StatBox label="GC" value={team.stats.goalsAgainst} />
          <StatBox label="DG" value={formatGoalDifference(diff)} />
          <StatBox label="Pts" value={team.stats.points} highlight />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <AvailabilitySection title="Lesionados" players={injured} empty="Sin lesionados registrados." icon={<InjuryIcon className="h-5 w-5" />} />
        <AvailabilitySection
          title="Apercibidos"
          players={cautioned}
          empty="Sin apercibidos."
          icon={<YellowCardIcon className="h-5 w-3.5" />}
          showCards
        />
        <AvailabilitySection
          title="Sancionados"
          players={suspended}
          empty="Sin sancionados activos."
          icon={<RedCardIcon className="h-5 w-3.5" />}
        />
      </div>

      <Card eyebrow="Plantilla" title="Jugadores" borderlessHeader>
        <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/20">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-[#214C9B] text-[10px] uppercase tracking-[0.1em] text-white">
              <tr>
                <th className="px-3 py-2.5 font-bold">Jugador</th>
                <th className="px-3 py-2.5 font-bold">Pos.</th>
                <th className="px-3 py-2.5 text-center font-bold">PJ</th>
                <th className="px-3 py-2.5 text-center font-bold">G</th>
                <th className="px-3 py-2.5 text-center font-bold">A</th>
                <th className="px-3 py-2.5 text-center font-bold">TA</th>
                <th className="px-3 py-2.5 text-center font-bold">TR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fieldPlayers.map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card eyebrow="Clasificacion" title="Tu zona en la liga" borderlessHeader>
        <LeagueTable teams={windowTeams} highlightTeamId={team.id} compact showLegend={false} />
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#214C9B]">{value}</p>
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3 text-center",
        highlight ? "border-[#981915]/30 bg-[#981915]/5" : "border-[#214C9B]/15 bg-slate-50/80",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-xl font-extrabold tabular-nums", highlight ? "text-[#981915]" : "text-[#214C9B]")}>
        {value}
      </p>
    </div>
  );
}

function AvailabilitySection({
  title,
  players,
  empty,
  icon,
  showCards = false,
}: {
  title: string;
  players: RivalPlayer[];
  empty: string;
  icon: ReactNode;
  showCards?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
      <div className="flex items-center gap-2">
        <span className="text-[#214C9B]">{icon}</span>
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {players.length > 0 ? (
          players.map((player) => (
            <li key={player.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div>
                <p className="font-bold text-slate-800">{player.displayName}</p>
                <p className="text-xs font-semibold text-slate-500">{player.position}</p>
              </div>
              {showCards && (
                <span className="text-xs font-bold tabular-nums text-slate-600">{player.stats.yellowCards} TA</span>
              )}
            </li>
          ))
        ) : (
          <li className="text-sm font-bold text-slate-500">{empty}</li>
        )}
      </ul>
    </div>
  );
}

function PlayerRow({ player }: { player: RivalPlayer }) {
  return (
    <tr className="bg-white">
      <td className="px-3 py-2.5 font-bold text-[#214C9B]">{player.displayName}</td>
      <td className="px-3 py-2.5 font-semibold text-slate-600">{player.position}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.appearances}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.goals}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.assists}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.yellowCards}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.redCards}</td>
    </tr>
  );
}

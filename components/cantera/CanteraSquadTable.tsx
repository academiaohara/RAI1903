"use client";

import { motion } from "framer-motion";
import type { CanteraTeamId } from "@/lib/cantera-data";
import {
  formatCanteraGoals,
  getCanteraSquadImport,
  getCanteraSquadPlayers,
  type CanteraSquadPlayer,
} from "@/lib/cantera-squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS, type SquadPosition } from "@/types/squad";
import { PositionSection } from "@/components/squad/PositionSection";

const OTHER_POSITION = "Otros" as const;

function groupPlayers(players: CanteraSquadPlayer[]): Map<SquadPosition | typeof OTHER_POSITION, CanteraSquadPlayer[]> {
  const groups = new Map<SquadPosition | typeof OTHER_POSITION, CanteraSquadPlayer[]>();
  for (const position of SQUAD_POSITIONS) {
    groups.set(position, []);
  }
  groups.set(OTHER_POSITION, []);

  for (const player of players) {
    if (player.posLabel.toLowerCase().includes("sin demarcación")) {
      groups.get(OTHER_POSITION)!.push(player);
      continue;
    }
    groups.get(player.posicion)!.push(player);
  }

  return groups;
}

function formatAge(edad: number | null): string {
  return edad == null ? "—" : String(edad);
}

function formatDorsal(dorsal: number | null): string {
  return dorsal == null || dorsal === 0 ? "—" : String(dorsal);
}

type CanteraSquadTableProps = {
  teamId: CanteraTeamId;
};

export function CanteraSquadTable({ teamId }: CanteraSquadTableProps) {
  const players = getCanteraSquadPlayers(teamId);
  const importData = getCanteraSquadImport(teamId);
  const grouped = groupPlayers(players);

  const sections: Array<{ key: string; label: string; list: CanteraSquadPlayer[] }> = [
    ...SQUAD_POSITIONS.map((position) => ({
      key: position,
      label: SQUAD_POSITION_LABELS[position],
      list: grouped.get(position) ?? [],
    })),
    { key: OTHER_POSITION, label: "Otros", list: grouped.get(OTHER_POSITION) ?? [] },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">{importData.plantilla.length} jugadores</strong>
        {" · "}
        Media de edad: <strong className="text-slate-900">{importData.mediaEdad} años</strong>
        {" · "}
        Temporada 2025/26
      </p>

      <div className="space-y-10">
        {sections.map((section, sectionIndex) => {
          if (section.list.length === 0) return null;

          const table = (
              <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3 text-center">#</th>
                        <th className="px-4 py-3 text-left">Jugador</th>
                        <th className="px-4 py-3 text-left">Demarcación</th>
                        <th className="px-4 py-3 text-center">Edad</th>
                        <th className="px-4 py-3 text-center">PC</th>
                        <th className="px-4 py-3 text-center">PJ</th>
                        <th className="px-4 py-3 text-center">PT</th>
                        <th className="px-4 py-3 text-center">Min</th>
                        <th className="px-4 py-3 text-center">Goles</th>
                        <th className="px-4 py-3 text-center">TA</th>
                        <th className="px-4 py-3 text-center">TR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.list.map((player, rowIndex) => (
                        <motion.tr
                          key={player.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: rowIndex * 0.02 }}
                          className="border-b border-slate-50 text-slate-800 last:border-0"
                        >
                          <td className="px-4 py-3 text-center font-bold text-[#214C9B]">{formatDorsal(player.dorsal)}</td>
                          <td className="px-4 py-3 font-semibold">{player.jugador}</td>
                          <td className="px-4 py-3 text-slate-600">{player.posLabel}</td>
                          <td className="px-4 py-3 text-center">{formatAge(player.edad)}</td>
                          <td className="px-4 py-3 text-center">{player.pc}</td>
                          <td className="px-4 py-3 text-center">{player.pj}</td>
                          <td className="px-4 py-3 text-center">{player.pt}</td>
                          <td className="px-4 py-3 text-center">{player.min}</td>
                          <td className="px-4 py-3 text-center font-semibold">{formatCanteraGoals(player)}</td>
                          <td className="px-4 py-3 text-center">{player.ta}</td>
                          <td className="px-4 py-3 text-center">{player.tr}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          );

          if (section.key === OTHER_POSITION) {
            return (
              <motion.section
                key={section.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.04, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-end gap-4">
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#214C9B] sm:text-3xl">
                    {section.label}
                  </h2>
                  <div className="mb-2 h-px flex-1 bg-gradient-to-r from-[#214C9B]/35 via-[#214C9B]/10 to-transparent" />
                </div>
                {table}
              </motion.section>
            );
          }

          return (
            <PositionSection key={section.key} position={section.key as SquadPosition} delay={sectionIndex * 0.04}>
              {table}
            </PositionSection>
          );
        })}
      </div>

      {importData.cuerpoTecnico && importData.cuerpoTecnico.length > 0 && (
        <div className="overflow-hidden rounded-[1.5rem] border border-[#214C9B]/12 bg-white p-4 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Cuerpo técnico</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Rol</th>
                  <th className="px-3 py-2 text-center">Partidos</th>
                  <th className="px-3 py-2 text-center">TA</th>
                  <th className="px-3 py-2 text-center">TR</th>
                </tr>
              </thead>
              <tbody>
                {importData.cuerpoTecnico.map((member) => (
                  <tr key={member.nombre} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-2 font-semibold text-slate-900">{member.nombre}</td>
                    <td className="px-3 py-2 text-slate-600">{member.rol}</td>
                    <td className="px-3 py-2 text-center">{member.partidos}</td>
                    <td className="px-3 py-2 text-center">{member.ta}</td>
                    <td className="px-3 py-2 text-center">{member.tr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

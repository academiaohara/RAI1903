import type { CanteraRosterPlayer } from "@/types/cantera-squad";
import type { PlayerPosition } from "@/types";

const POSITION_ORDER: PlayerPosition[] = ["Portero", "Defensa", "Centrocampista", "Delantero"];

const POSITION_LABELS: Record<PlayerPosition, string> = {
  Portero: "Porteros",
  Defensa: "Defensas",
  Centrocampista: "Centrocampistas",
  Delantero: "Delanteros",
};

function formatDorsal(number: number | null): string {
  return number === null ? "—" : String(number);
}

function formatAge(age: number | null): string {
  return age === null ? "—" : String(age);
}

function formatGoals(player: CanteraRosterPlayer): string {
  const { stats } = player;
  if (stats.golesEncajados !== undefined) {
    return `(${stats.golesEncajados})`;
  }
  return String(stats.goles);
}

type CanteraRosterTableProps = {
  roster: CanteraRosterPlayer[];
  averageAge?: number;
};

export function CanteraRosterTable({ roster, averageAge }: CanteraRosterTableProps) {
  const grouped = POSITION_ORDER.map((position) => ({
    position,
    players: roster.filter((player) => player.position === position),
  })).filter((group) => group.players.length > 0);

  return (
    <div className="space-y-6">
      {averageAge !== undefined && (
        <p className="text-sm font-bold text-slate-600">
          {roster.length} jugadores · Media de edad: {averageAge.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} años
        </p>
      )}

      {grouped.map(({ position, players }) => (
        <section key={position} className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-normal text-[#214C9B]">
            {POSITION_LABELS[position]} ({players.length})
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/15">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#214C9B]/15 bg-blue-50 text-xs font-extrabold uppercase tracking-normal text-[#214C9B]">
                  <th className="px-3 py-2">Dorsal</th>
                  <th className="px-3 py-2">Jugador</th>
                  <th className="px-3 py-2">Demarcación</th>
                  <th className="px-3 py-2 text-center">Edad</th>
                  <th className="px-3 py-2 text-center">PC</th>
                  <th className="px-3 py-2 text-center">PJ</th>
                  <th className="px-3 py-2 text-center">PT</th>
                  <th className="px-3 py-2 text-center">Min</th>
                  <th className="px-3 py-2 text-center">Goles</th>
                  <th className="px-3 py-2 text-center">TA</th>
                  <th className="px-3 py-2 text-center">TR</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 font-bold text-slate-700">{formatDorsal(player.number)}</td>
                    <td className="px-3 py-2">
                      <p className="font-extrabold text-[#214C9B]">{player.displayName}</p>
                      <p className="text-xs font-medium text-slate-500">{player.fullName}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{player.role}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{formatAge(player.age)}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.convocados}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.partidos}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.titular}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.minutos}</td>
                    <td className="px-3 py-2 text-center font-bold text-slate-800">{formatGoals(player)}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.amarillas}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{player.stats.rojas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

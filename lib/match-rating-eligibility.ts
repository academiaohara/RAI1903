import { getRaiTeamId } from "@/lib/fixtures";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import { lineupPlayersToSquad } from "@/lib/squad-lineup";
import type { MatchDetail, MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";

function avilesTeamSide(detail: MatchDetail): "home" | "away" | null {
  const raiId = getRaiTeamId(detail.gender);
  if (detail.match.homeTeamId === raiId) return "home";
  if (detail.match.awayTeamId === raiId) return "away";
  return null;
}

function namesWhoPlayedMinutes(lineup: MatchDetail["homeLineup"], events: MatchEvent[], team: "home" | "away"): Set<string> {
  const played = new Set<string>();
  for (const starter of lineup.starters) {
    played.add(starter.name.trim().toLowerCase());
  }
  for (const event of events) {
    if (event.type !== "substitution" || event.team !== team) continue;
    played.add(event.player.trim().toLowerCase());
  }
  return played;
}

/** Jugadores del Avilés que disputaron minutos en el partido (titulares + suplentes que entraron). */
export function getAvilesPlayersWhoPlayed(
  detail: MatchDetail,
  squad: SquadPlayer[],
): SquadPlayer[] {
  const side = avilesTeamSide(detail);
  if (!side) return [];

  const raiId = getRaiTeamId(detail.gender);
  const lineup = detail.match.homeTeamId === raiId ? detail.homeLineup : detail.awayLineup;
  const playedNames = namesWhoPlayedMinutes(lineup, detail.events, side);

  const entries = lineupPlayersToSquad(lineup, squad).filter((entry) => entry.player != null);
  const eligible: SquadPlayer[] = [];

  for (const entry of entries) {
    const player = entry.player!;
    const fullName = `${player.nombre} ${player.apellido}`.trim().toLowerCase();
    const display = player.nombre.toLowerCase();
    const lineupName = entry.lineupName.trim().toLowerCase();

    const played =
      playedNames.has(lineupName) ||
      playedNames.has(fullName) ||
      playedNames.has(display) ||
      [...playedNames].some((name) => resolveSquadPlayerByName(squad, name)?.id === player.id);

    if (played) eligible.push(player);
  }

  return eligible;
}

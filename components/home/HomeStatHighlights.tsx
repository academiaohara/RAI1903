"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonPlayerRatings } from "@/hooks/useSeasonPlayerRatings";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { formatFanRating } from "@/lib/format-fan-rating";
import { getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import { computeClubLeagueStatsForGender } from "@/lib/season/club-league-stats";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

type HighlightRow = {
  label: string;
  name: string;
  value: string;
  suffix: string;
};

function topBy<T extends SquadPlayer>(players: T[], pick: (player: T) => number, suffix: string, label: string): HighlightRow | null {
  if (!players.length) return null;
  const player = [...players].sort((a, b) => pick(b) - pick(a))[0];
  const value = pick(player);
  if (value <= 0) return null;
  return { label, name: getPlayerFullName(player), value: String(value), suffix };
}

export function HomeStatHighlights() {
  const { squad } = useSquadPlayers("masculino");
  const { averages, loading: ratingsLoading } = useSeasonPlayerRatings();
  const { getFixtureSource } = useSeason();
  const leagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(getFixtureSource("masculino", "active"), "masculino"),
    [getFixtureSource],
  );

  const rows = useMemo(() => {
    const list: HighlightRow[] = [];

    const goals = topBy(squad, (p) => p.goles, "goles", "Mas goles");
    if (goals) list.push(goals);

    const assists = topBy(squad, (p) => p.asistencias, "asist.", "Mas asistencias");
    if (assists) list.push(assists);

    const yellows = topBy(squad, (p) => p.amarillas, "TA", "Mas amarillas");
    if (yellows) list.push(yellows);

    const reds = topBy(squad, (p) => p.rojas, "TR", "Mas rojas");
    if (reds) list.push(reds);

    const cleanSheets = computeClubLeagueStatsForGender("masculino", leagueMatchdays).porteriasImbatidas;
    if (cleanSheets > 0) {
      const keeper = squad.find((p) => p.posicion === "Portero") ?? squad[0];
      if (keeper) {
        list.push({
          label: "Porterias imbatidas",
          name: getPlayerFullName(keeper),
          value: String(cleanSheets),
          suffix: "porterias",
        });
      }
    }

    const ratingEntries = Object.entries(averages);
    if (ratingEntries.length > 0) {
      const [topPlayerId, topRating] = ratingEntries.sort((a, b) => b[1].average - a[1].average)[0];
      const topPlayer = squad.find((p) => p.id === topPlayerId);
      if (topPlayer) {
        list.push({
          label: "Nota media (aficion)",
          name: getPlayerFullName(topPlayer),
          value: formatFanRating(topRating.average),
          suffix: `media · ${topRating.count} voto${topRating.count === 1 ? "" : "s"}`,
        });
      }
    }

    return list;
  }, [averages, leagueMatchdays, squad]);

  if (!rows.length && ratingsLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-semibold text-slate-500">
        Cargando estadisticas…
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-semibold text-slate-500">
        Sin datos destacados todavia. Las valoraciones de aficion aparecen cuando haya votos en los partidos.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-4 border-b border-[#214C9B]/10 pb-3 last:border-b-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
            <p className="mt-1 truncate text-base font-extrabold uppercase text-[#214C9B]">{item.name}</p>
          </div>
          <p className="shrink-0 text-right text-2xl font-extrabold text-slate-950">
            {item.value} <span className="text-xs font-bold text-slate-500">{item.suffix}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

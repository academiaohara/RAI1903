"use client";

import { useMemo } from "react";
import { CaraACaraPanel } from "@/components/match-center/CaraACaraPanel";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { buildCaraACaraData } from "@/lib/cara-a-cara";
import { getRaiTeamId } from "@/lib/fixtures";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { MatchDetail } from "@/types";

export function MatchCaraACaraSection({ detail }: { detail: MatchDetail }) {
  const { match, gender } = detail;
  const { squad } = useSquadPlayers(gender);
  const raiId = getRaiTeamId(gender);

  const data = useMemo(() => {
    const pickFeatured = (teamId: string) => {
      if (teamId !== raiId) return undefined;
      const topScorer = [...squad]
        .filter((player) => player.goles > 0)
        .sort((a, b) => b.goles - a.goles || b.partidos - a.partidos)[0];
      const fallback = squad.find((player) => player.foto) ?? squad[0];
      const featured = topScorer ?? fallback;
      if (!featured) return undefined;
      return { name: getPlayerFullName(featured), photo: featured.foto };
    };

    return buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender, {
      homeFeatured: pickFeatured(match.homeTeamId),
      awayFeatured: pickFeatured(match.awayTeamId),
    });
  }, [gender, match.awayTeamId, match.homeTeamId, raiId, squad]);

  if (!data) return null;

  return <CaraACaraPanel data={data} gender={gender} />;
}

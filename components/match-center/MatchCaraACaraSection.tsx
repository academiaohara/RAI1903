"use client";

import { useMemo } from "react";
import { CaraACaraPanel } from "@/components/match-center/CaraACaraPanel";
import { buildCaraACaraData } from "@/lib/cara-a-cara";
import type { MatchDetail } from "@/types";

export function MatchCaraACaraSection({ detail }: { detail: MatchDetail }) {
  const { match, gender } = detail;

  const data = useMemo(
    () => buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender),
    [gender, match.awayTeamId, match.homeTeamId],
  );

  if (!data) return null;

  return <CaraACaraPanel data={data} gender={gender} />;
}

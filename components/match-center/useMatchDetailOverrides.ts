"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { MatchDetail, MatchVideo } from "@/types";

function storageKey(matchId: string, field: string) {
  return `match:${matchId}:${field}`;
}

export function useMatchDetailOverrides(detail: MatchDetail): MatchDetail {
  const { getValue } = useInlineEditing();
  const matchId = detail.match.id;

  const homeScore = getValue(storageKey(matchId, "homeScore"), detail.match.homeScore);
  const awayScore = getValue(storageKey(matchId, "awayScore"), detail.match.awayScore);
  const attendance = getValue(storageKey(matchId, "attendance"), detail.attendance);
  const referee = getValue(storageKey(matchId, "referee"), detail.referee);
  const stats = getValue(storageKey(matchId, "stats"), detail.stats);
  const events = getValue(storageKey(matchId, "events"), detail.events);
  const homeLineup = getValue(storageKey(matchId, "homeLineup"), detail.homeLineup);
  const awayLineup = getValue(storageKey(matchId, "awayLineup"), detail.awayLineup);
  const availability = getValue(storageKey(matchId, "availability"), detail.availability);
  const rdpPrevia = getValue<MatchVideo | null>(storageKey(matchId, "rdpPrevia"), detail.rdpPrevia);
  const rdpPostpartido = getValue<MatchVideo | null>(
    storageKey(matchId, "rdpPostpartido"),
    detail.rdpPostpartido,
  );
  const resumenVideo = getValue<MatchVideo | null>(storageKey(matchId, "resumenVideo"), detail.resumenVideo);

  return {
    ...detail,
    match: {
      ...detail.match,
      homeScore: homeScore ?? detail.match.homeScore,
      awayScore: awayScore ?? detail.match.awayScore,
    },
    attendance,
    referee,
    stats,
    events,
    homeLineup,
    awayLineup,
    availability,
    rdpPrevia,
    rdpPostpartido,
    resumenVideo,
  };
}

export function useMatchDetailStorageKeys(matchId: string) {
  return {
    homeScore: storageKey(matchId, "homeScore"),
    awayScore: storageKey(matchId, "awayScore"),
    attendance: storageKey(matchId, "attendance"),
    referee: storageKey(matchId, "referee"),
    stats: storageKey(matchId, "stats"),
    events: storageKey(matchId, "events"),
    homeLineup: storageKey(matchId, "homeLineup"),
    awayLineup: storageKey(matchId, "awayLineup"),
    availability: storageKey(matchId, "availability"),
    rdpPrevia: storageKey(matchId, "rdpPrevia"),
    rdpPostpartido: storageKey(matchId, "rdpPostpartido"),
    resumenVideo: storageKey(matchId, "resumenVideo"),
  };
}

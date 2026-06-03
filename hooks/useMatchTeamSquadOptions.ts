"use client";

import { useCallback, useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { isRaiCompetitionTeam } from "@/lib/competicion-squad";
import {
  getMatchTeamSquadOptions,
  squadPlayersToMatchOptions,
  type MatchSquadOption,
} from "@/lib/match-availability-squad";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function useMatchTeamSquadOptions(gender: PrimerEquipoGender) {
  const { bundles } = useSeason();
  const { squad: ownSquad } = useSquadPlayers(gender);

  const ownClubOptions = useMemo(() => squadPlayersToMatchOptions(ownSquad), [ownSquad]);

  const ownClubQuinielaScorerOptions = useMemo(
    () =>
      squadPlayersToMatchOptions(ownSquad.filter((player) => player.posicion !== "Portero")),
    [ownSquad],
  );

  const isOwnClub = useCallback(
    (teamId: string) => isRaiCompetitionTeam(teamId, gender),
    [gender],
  );

  const getOptions = useCallback(
    (teamId: string): MatchSquadOption[] => {
      if (isOwnClub(teamId)) return ownClubOptions;
      return getMatchTeamSquadOptions(teamId, gender, bundles);
    },
    [bundles, gender, isOwnClub, ownClubOptions],
  );

  const getQuinielaScorerOptions = useCallback(
    (teamId: string): MatchSquadOption[] => {
      if (!isOwnClub(teamId)) return [];
      return ownClubQuinielaScorerOptions;
    },
    [isOwnClub, ownClubQuinielaScorerOptions],
  );

  return { getOptions, getQuinielaScorerOptions, isOwnClub, ownSquad };
}

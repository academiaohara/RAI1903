"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeDefaultGameRound } from "@/lib/juegos/default-jornada-round";
import type { Matchday } from "@/types";

const AUTO_ADVANCE_CHECK_MS = 60_000;

/**
 * Jornada seleccionada en juegos por jornada (RAIniela, RAIGol).
 * Avanza sola a la siguiente 48 h después del último pitido de una jornada completa,
 * salvo que el usuario haya elegido otra jornada manualmente.
 */
export function useGameJornadaRound(
  matchdays: Matchday[],
  totalRounds: number,
  currentRound: number,
) {
  const [now, setNow] = useState(() => new Date());
  const manualSelectionRef = useRef(false);
  const lastSyncedDefaultRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), AUTO_ADVANCE_CHECK_MS);
    return () => window.clearInterval(id);
  }, []);

  const defaultRound = useMemo(
    () => computeDefaultGameRound(matchdays, totalRounds, currentRound, now),
    [matchdays, totalRounds, currentRound, now],
  );

  const [round, setRoundState] = useState(defaultRound);

  useEffect(() => {
    const prevDefault = lastSyncedDefaultRef.current;

    if (prevDefault === null) {
      lastSyncedDefaultRef.current = defaultRound;
      setRoundState(defaultRound);
      return;
    }

    if (defaultRound === prevDefault) return;

    lastSyncedDefaultRef.current = defaultRound;

    if (manualSelectionRef.current) {
      setRoundState((current) => (current === prevDefault && defaultRound > prevDefault ? defaultRound : current));
      return;
    }

    setRoundState(defaultRound);
  }, [defaultRound]);

  const setRound = useCallback((nextRound: number) => {
    manualSelectionRef.current = true;
    setRoundState(nextRound);
  }, []);

  const resetRound = useCallback(() => {
    manualSelectionRef.current = false;
    lastSyncedDefaultRef.current = defaultRound;
    setRoundState(defaultRound);
  }, [defaultRound]);

  return { round, setRound, resetRound, defaultRound };
}

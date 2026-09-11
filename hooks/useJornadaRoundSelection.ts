"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeDefaultGameRound } from "@/lib/juegos/default-jornada-round";
import type { JornadaRoundId } from "@/types/jornadas";
import type { Matchday } from "@/types";

const AUTO_ADVANCE_CHECK_MS = 60_000;

export function jornadaRoundId(round: number): JornadaRoundId {
  return `j${round}`;
}

export function parseJornadaRoundNumber(roundId: JornadaRoundId): number {
  const match = /^j(\d+)$/.exec(roundId);
  return match ? Number(match[1]) : 1;
}

function matchdaysSignature(matchdays: Matchday[]): string {
  return matchdays.map((matchday) => `${matchday.round}:${matchday.matches.length}`).join("|");
}

/**
 * Jornada seleccionada en la sección Jornadas (carrusel).
 * Por defecto: jornada activa (primer pitido ya pasado o ventana de previsualización),
 * o la siguiente si pasaron 2 días de calendario desde el último partido jugado.
 */
export function useJornadaRoundSelection(matchdays: Matchday[], totalRounds: number) {
  const [now, setNow] = useState(() => new Date());
  const manualSelectionRef = useRef(false);
  const lastSyncedDefaultRef = useRef<JornadaRoundId | null>(null);
  const matchdaysSignatureValue = matchdaysSignature(matchdays);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), AUTO_ADVANCE_CHECK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    manualSelectionRef.current = false;
    lastSyncedDefaultRef.current = null;
  }, [matchdaysSignatureValue, totalRounds]);

  const defaultRoundId = useMemo(() => {
    const round = computeDefaultGameRound(matchdays, totalRounds, 1, now);
    return jornadaRoundId(round);
  }, [matchdays, totalRounds, now]);

  const [selectedRoundId, setSelectedRoundIdState] = useState(defaultRoundId);

  useEffect(() => {
    const prevDefault = lastSyncedDefaultRef.current;

    if (prevDefault === null) {
      lastSyncedDefaultRef.current = defaultRoundId;
      setSelectedRoundIdState(defaultRoundId);
      return;
    }

    if (defaultRoundId === prevDefault) return;

    lastSyncedDefaultRef.current = defaultRoundId;

    if (manualSelectionRef.current) {
      setSelectedRoundIdState((current) =>
        current === prevDefault && parseJornadaRoundNumber(defaultRoundId) > parseJornadaRoundNumber(prevDefault)
          ? defaultRoundId
          : current,
      );
      return;
    }

    setSelectedRoundIdState(defaultRoundId);
  }, [defaultRoundId]);

  const selectRound = useCallback((roundId: JornadaRoundId) => {
    manualSelectionRef.current = true;
    setSelectedRoundIdState(roundId);
  }, []);

  return { selectedRoundId, selectRound, defaultRoundId };
}

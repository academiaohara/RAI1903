"use client";

import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import {
  formatVotingCountdown,
  getMatchRatingVotingCountdown,
  isMatchRatingVotingOpen,
} from "@/lib/match-rating-voting";

type MatchRatingsCountdownProps = {
  matchDate: string;
};

export function MatchRatingsCountdown({ matchDate }: MatchRatingsCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const open = isMatchRatingVotingOpen(matchDate, now);
  const countdown = getMatchRatingVotingCountdown(matchDate, now);

  if (!open) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Votación cerrada</p>
        <p className="mt-1 text-sm text-slate-600">
          El plazo de 3 días para valorar este partido ha finalizado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[#981915]/25 bg-white px-4 py-3">
      <Timer size={16} className="shrink-0 text-[#981915]" aria-hidden />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Tiempo restante para votar</p>
      <p className="font-mono text-sm font-extrabold tabular-nums text-[#981915]">
        {formatVotingCountdown(countdown)}
      </p>
    </div>
  );
}

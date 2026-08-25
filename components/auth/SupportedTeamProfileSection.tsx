"use client";

import { useEffect, useMemo, useState } from "react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { fetchProfileSupportedTeamId, saveSupportedTeamId } from "@/lib/quiniela-supported-team";
import { getTeamById } from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";
import type { User } from "@supabase/supabase-js";

type SupportedTeamProfileSectionProps = {
  user: User;
};

export function SupportedTeamProfileSection({ user }: SupportedTeamProfileSectionProps) {
  const { bundles } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchProfileSupportedTeamId(user.id).then((value) => {
      if (!cancelled) setTeamId(value);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const team = teamId ? getTeamById(teamId, teams) : null;

  const onChange = async (nextTeamId: string) => {
    setBusy(true);
    setMessage(null);
    await saveSupportedTeamId(user.id, nextTeamId);
    setBusy(false);
    setTeamId(nextTeamId);
    setMessage("Equipo actualizado.");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Tu equipo en la RAIniela</h2>
      <p className="text-sm text-slate-600">
        El equipo que sigues en la quiniela del Grupo I. Aparece también al rellenar pronósticos.
      </p>
      {team ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#214C9B]/15 bg-slate-50 px-4 py-3">
          <OpponentCrest
            logo={getTeamCrestById(team.id, team.crestInitials)}
            opponent={team.name}
            size="md"
            className="h-10 w-10"
          />
          <div>
            <p className="font-extrabold text-[#214C9B]">{team.name}</p>
            <p className="text-xs text-slate-600">Equipo seguido</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Aún no has elegido equipo (por defecto: Real Avilés).</p>
      )}
      <div className="flex flex-wrap gap-2">
        {teams.map((entry) => (
          <button
            key={entry.id}
            type="button"
            disabled={busy}
            onClick={() => void onChange(entry.id)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
              teamId === entry.id
                ? "border-[#214C9B] bg-[#214C9B] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-[#214C9B]/30"
            }`}
          >
            {entry.shortName ?? entry.name}
          </button>
        ))}
      </div>
      {message ? <p className="text-sm font-semibold text-[#214C9B]">{message}</p> : null}
    </div>
  );
}

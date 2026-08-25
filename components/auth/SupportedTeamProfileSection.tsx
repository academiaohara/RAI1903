"use client";

import { useEffect, useMemo, useState } from "react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { ProfileEditableRow } from "@/components/auth/ProfileEditableRow";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import {
  DEFAULT_SUPPORTED_TEAM_ID,
  fetchProfileSupportedTeamId,
  loadSupportedTeamId,
  saveSupportedTeamId,
} from "@/lib/quiniela-supported-team";
import { getTeamById } from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";
import type { User } from "@supabase/supabase-js";

type SupportedTeamProfileSectionProps = {
  user: User;
};

export function SupportedTeamProfileSection({ user }: SupportedTeamProfileSectionProps) {
  const { bundles } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const [teamId, setTeamId] = useState<string>(DEFAULT_SUPPORTED_TEAM_ID);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const profileTeam = await fetchProfileSupportedTeamId(user.id);
      if (cancelled) return;
      if (profileTeam) {
        setTeamId(profileTeam);
        return;
      }
      const resolved = await loadSupportedTeamId(user.id);
      if (!cancelled) setTeamId(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const team = getTeamById(teamId, teams);

  const onChange = async (nextTeamId: string) => {
    setBusy(true);
    setMessage(null);
    await saveSupportedTeamId(user.id, nextTeamId);
    setBusy(false);
    setTeamId(nextTeamId);
    setEditing(false);
    setMessage("Equipo actualizado.");
  };

  return (
    <div className="space-y-3">
      <ProfileEditableRow
        label="Tu equipo"
        editing={editing}
        onEdit={() => {
          setMessage(null);
          setEditing(true);
        }}
        onCancel={() => setEditing(false)}
        editContent={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {teams.map((entry) => {
                const selected = entry.id === teamId;
                const crest = getTeamCrestById(entry.id, entry.crestInitials);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={busy}
                    onClick={() => void onChange(entry.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      selected
                        ? "border-[#214C9B] bg-[#214C9B] text-white shadow-sm"
                        : "border-[#214C9B]/15 bg-white text-slate-700 hover:border-[#214C9B]/35"
                    }`}
                    aria-pressed={selected}
                  >
                    <OpponentCrest logo={crest} opponent={entry.name} size="sm" className="h-6 w-6" />
                    <span>{entry.shortName ?? entry.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          {team ? (
            <OpponentCrest
              logo={getTeamCrestById(team.id, team.crestInitials)}
              opponent={team.name}
              size="lg"
              className="h-14 w-14"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#214C9B]/25 bg-slate-50 text-xs font-bold text-slate-400">
              ?
            </span>
          )}
          <span className="sr-only">{team?.name ?? "Sin equipo"}</span>
        </div>
      </ProfileEditableRow>
      {message ? <p className="text-sm font-semibold text-[#214C9B]">{message}</p> : null}
    </div>
  );
}

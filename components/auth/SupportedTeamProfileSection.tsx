"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { OpponentCrest } from "@/components/OpponentCrest";
import { Modal } from "@/components/Modal";
import { SupportedTeamPicker } from "@/components/quiniela/SupportedTeamSection";
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
import { cn } from "@/lib/utils";

type SupportedTeamProfileSectionProps = {
  user: User;
  embedded?: boolean;
};

export function SupportedTeamProfileSection({ user, embedded = false }: SupportedTeamProfileSectionProps) {
  const { bundles } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const [teamId, setTeamId] = useState<string>(DEFAULT_SUPPORTED_TEAM_ID);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
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
  const crest = team ? getTeamCrestById(team.id, team.crestInitials) : null;

  const onChange = async (nextTeamId: string) => {
    setBusy(true);
    setMessage(null);
    await saveSupportedTeamId(user.id, nextTeamId);
    setBusy(false);
    setTeamId(nextTeamId);
    setMessage("Equipo actualizado.");
    setEditing(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col",
          embedded
            ? "p-3"
            : "overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white p-3 shadow-sm",
        )}
      >
        <header className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Tu equipo</h2>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setEditing(true);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#214C9B]/70 transition hover:bg-[#214C9B]/8 hover:text-[#214C9B]"
            aria-label="Editar equipo"
          >
            <Pencil size={12} aria-hidden />
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1 text-center">
          {crest && team ? (
            <>
              <OpponentCrest
                logo={crest}
                opponent={team.name}
                teamId={team.id}
                size="md"
                className="h-12 w-12"
              />
              <p className="line-clamp-2 text-xs font-extrabold leading-tight text-[#214C9B]">
                {team.shortName ?? team.name}
              </p>
            </>
          ) : (
            <p className="text-xs leading-snug text-slate-500">Sin equipo</p>
          )}
        </div>
      </div>

      <Modal open={editing} title="Elige tu equipo" onClose={() => setEditing(false)}>
        <SupportedTeamPicker
          teams={teams}
          value={teamId}
          onChange={(nextTeamId) => void onChange(nextTeamId)}
          disabled={busy}
        />
        {message ? <p className="mt-3 text-sm font-semibold text-[#214C9B]">{message}</p> : null}
      </Modal>
    </>
  );
}

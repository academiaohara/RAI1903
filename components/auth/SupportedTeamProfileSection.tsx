"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { OpponentCrest } from "@/components/OpponentCrest";
import { Modal } from "@/components/Modal";
import { SupportedTeamPicker } from "@/components/quiniela/SupportedTeamSection";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { fetchProfileSupportedTeamId, saveSupportedTeamId } from "@/lib/quiniela-supported-team";
import { getTeamById } from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";

type SupportedTeamProfileSectionProps = {
  user: User;
};

export function SupportedTeamProfileSection({ user }: SupportedTeamProfileSectionProps) {
  const { bundles } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
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
      <div className="flex aspect-square flex-col overflow-hidden rounded-2xl border border-[#214C9B]/12 bg-white shadow-sm">
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#214C9B]">Tu equipo</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#214C9B]/15 text-[#214C9B] transition hover:border-[#214C9B]/35 hover:bg-[#214C9B]/5"
            aria-label="Editar equipo"
          >
            <Pencil size={14} aria-hidden />
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-5">
          {crest && team ? (
            <>
              <OpponentCrest
                logo={crest}
                opponent={team.name}
                teamId={team.id}
                size="lg"
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
              <p className="text-center text-sm font-extrabold text-[#214C9B]">{team.shortName ?? team.name}</p>
            </>
          ) : (
            <p className="px-2 text-center text-sm text-slate-600">
              Aún no has elegido equipo
            </p>
          )}
        </div>
      </div>

      <Modal open={editing} title="Elige tu equipo" onClose={() => setEditing(false)}>
        <SupportedTeamPicker
          teams={teams}
          value={teamId ?? teams[0]?.id ?? ""}
          onChange={(nextTeamId) => void onChange(nextTeamId)}
          disabled={busy}
        />
        {message ? <p className="mt-3 text-sm font-semibold text-[#214C9B]">{message}</p> : null}
      </Modal>
    </>
  );
}

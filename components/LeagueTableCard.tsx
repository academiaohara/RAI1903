"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { Modal } from "@/components/Modal";
import type { Team } from "@/types";

type LeagueTableCardProps = {
  eyebrow?: string;
  title?: string;
  teams: Team[];
  highlightTeamId: string;
  compact?: boolean;
  className?: string;
};

export function LeagueTableCard({ eyebrow, title, teams, highlightTeamId, compact = false, className }: LeagueTableCardProps) {
  const [open, setOpen] = useState(false);
  const modalTitle = title ?? "Clasificacion";

  return (
    <>
      <Card eyebrow={eyebrow} title={title} className={className}>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#214C9B]/20 px-3 py-2 text-xs font-bold uppercase tracking-normal text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            aria-label="Abrir clasificacion en grande"
          >
            <Maximize2 size={16} />
            Ver en grande
          </button>
        </div>
        <LeagueTable teams={teams} highlightTeamId={highlightTeamId} compact={compact} />
      </Card>

      <Modal open={open} title={modalTitle} onClose={() => setOpen(false)}>
        <LeagueTable teams={teams} highlightTeamId={highlightTeamId} />
      </Modal>
    </>
  );
}

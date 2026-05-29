"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { Modal } from "@/components/Modal";
import type { ReactNode } from "react";
import type { Team } from "@/types";

type LeagueTableCardProps = {
  eyebrow?: string;
  title?: string;
  teams: Team[];
  /** Tabla completa en el modal; por defecto usa `teams`. */
  fullTeams?: Team[];
  highlightTeamId: string;
  compact?: boolean;
  className?: string;
  borderlessHeader?: boolean;
  /** Controles opcionales (filtros) dentro de la tarjeta, encima de la tabla. */
  toolbar?: ReactNode;
};

export function LeagueTableCard({
  eyebrow,
  title,
  teams,
  fullTeams,
  highlightTeamId,
  compact = false,
  className,
  borderlessHeader = false,
  toolbar,
}: LeagueTableCardProps) {
  const modalTeams = fullTeams ?? teams;
  const [open, setOpen] = useState(false);
  const modalTitle = title ?? "Clasificacion";

  return (
    <>
      <Card
        eyebrow={eyebrow}
        title={title}
        className={className}
        borderlessHeader={borderlessHeader}
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            aria-label="Abrir clasificacion en grande"
          >
            <Maximize2 size={16} />
          </button>
        }
      >
        {toolbar && <div className="mb-4 min-w-0 space-y-3">{toolbar}</div>}
        <LeagueTable teams={teams} highlightTeamId={highlightTeamId} compact={compact} />
      </Card>

      <Modal open={open} title={modalTitle} onClose={() => setOpen(false)}>
        <LeagueTable teams={modalTeams} highlightTeamId={highlightTeamId} />
      </Modal>
    </>
  );
}

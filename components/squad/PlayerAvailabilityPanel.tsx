"use client";

import type { ReactNode } from "react";
import type { PlayerStatus } from "@/types";
import type { SquadPlayer } from "@/types/squad";
import { InjuryIcon, RedCardIcon } from "@/components/competicion/AvailabilityIcons";
import { defaultRosterEstado } from "@/lib/squad-utils";
import { cn } from "@/lib/utils";

const CARD_CLASS =
  "rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]";

type PlayerAvailabilityPanelProps = {
  player: SquadPlayer;
  editMode?: boolean;
  onUpdate?: (patch: Partial<SquadPlayer>) => void;
};

export function PlayerAvailabilityPanel({ player, editMode = false, onUpdate }: PlayerAvailabilityPanelProps) {
  const isInjured = player.estado === "lesionado";
  const isSuspended = player.estado === "sancionado";
  const canEdit = Boolean(editMode && onUpdate);

  if (!canEdit && !isInjured && !isSuspended) return null;

  const setInjured = (active: boolean) => {
    if (!onUpdate) return;
    if (active) onUpdate({ estado: "lesionado" });
    else if (isInjured) onUpdate({ estado: defaultRosterEstado(player) });
  };

  const setSuspended = (active: boolean) => {
    if (!onUpdate) return;
    if (active) onUpdate({ estado: "sancionado" });
    else if (isSuspended) onUpdate({ estado: defaultRosterEstado(player) });
  };

  return (
    <section className={cn(CARD_CLASS, "mb-6")} aria-label="Bajas del jugador">
      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">Bajas</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        {canEdit
          ? "Marca si el jugador está lesionado o sancionado. Sigue apareciendo en la plantilla."
          : "Estado de baja actual del jugador."}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AvailabilityToggle
          label="Lesionado"
          icon={<InjuryIcon className="h-5 w-5" />}
          active={isInjured}
          editable={canEdit}
          onToggle={setInjured}
        />
        <AvailabilityToggle
          label="Sancionado"
          icon={<RedCardIcon className="h-5 w-3.5" />}
          active={isSuspended}
          editable={canEdit}
          onToggle={setSuspended}
        />
      </div>
    </section>
  );
}

function AvailabilityToggle({
  label,
  icon,
  active,
  editable,
  onToggle,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  editable: boolean;
  onToggle: (active: boolean) => void;
}) {
  if (!editable) {
    if (!active) return null;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <span className="text-[#214C9B]">{icon}</span>
        <span className="text-sm font-extrabold uppercase tracking-wide text-slate-800">{label}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(!active)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-[#214C9B]/40 bg-blue-50/80 ring-1 ring-[#214C9B]/20"
          : "border-slate-200 bg-white hover:border-[#214C9B]/30 hover:bg-blue-50/40",
      )}
      aria-pressed={active}
    >
      <span className="flex items-center gap-2">
        <span className="text-[#214C9B]">{icon}</span>
        <span className="text-sm font-extrabold uppercase tracking-wide text-slate-800">{label}</span>
      </span>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
          active ? "bg-[#214C9B] text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        {active ? "Sí" : "No"}
      </span>
    </button>
  );
}

/** Estados de plantilla sin bajas (para selectores de edición rápida / ficha). */
export const SQUAD_ROSTER_ESTADOS: PlayerStatus[] = ["titular", "suplente", "cantera", "nuevo fichaje"];

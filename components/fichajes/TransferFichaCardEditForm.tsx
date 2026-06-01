"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransferMarketEdit } from "@/components/editor/TransferMarketEditProvider";
import { TRANSFER_KIND_OPTIONS } from "@/hooks/useTransferMarketDraft";
import type { CmsTransferEntry } from "@/lib/cms/season-bundles";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferKind, TransferMarketWindowId } from "@/types";

type TransferFichaCardEditFormProps = {
  entry: CmsTransferEntry;
};

export function TransferFichaCardEditForm({ entry }: TransferFichaCardEditFormProps) {
  const { squad, squadLoading, updateEntry, removeEntry, marketWindows, inferWindow } = useTransferMarketEdit();

  const handleDateChange = (date: string) => {
    const patch: Partial<CmsTransferEntry> = { date };
    if (entry.marketWindowId) {
      patch.marketWindowId = inferWindow(date);
    }
    updateEntry(entry.id, patch);
  };

  return (
    <div
      className="mt-2 space-y-2 rounded-xl border border-[#214C9B]/25 bg-white p-2.5 shadow-lg"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]">Editar movimiento</p>

      {squadLoading ? (
        <p className="flex items-center gap-2 text-[10px] text-slate-500">
          <Loader2 size={12} className="animate-spin" /> Plantilla…
        </p>
      ) : (
        <label className="block text-[10px] font-bold uppercase text-slate-500">
          Jugador
          <select
            value={entry.playerId}
            onChange={(event) => updateEntry(entry.id, { playerId: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-800"
          >
            {squad.map((player) => (
              <option key={player.id} value={player.id}>
                {getPlayerDisplayName(player)} · #{player.dorsal}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-500">
          Tipo
          <select
            value={entry.kind}
            onChange={(event) => updateEntry(entry.id, { kind: event.target.value as TransferKind })}
            className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold"
          >
            {TRANSFER_KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] font-bold uppercase text-slate-500">
          Fecha
          <input
            type="date"
            value={entry.date}
            onChange={(event) => handleDateChange(event.target.value)}
            className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold"
          />
        </label>
      </div>

      <label className="block text-[10px] font-bold uppercase text-slate-500">
        Ventana
        <select
          value={entry.marketWindowId ?? ""}
          onChange={(event) =>
            updateEntry(entry.id, {
              marketWindowId: (event.target.value || undefined) as TransferMarketWindowId | undefined,
            })
          }
          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold"
        >
          <option value="">Auto ({inferWindow(entry.date)})</option>
          {marketWindows.map((window) => (
            <option key={window.id} value={window.id}>
              {window.label}
            </option>
          ))}
        </select>
      </label>

      {entry.kind !== "renovacion" && (
        <label className="block text-[10px] font-bold uppercase text-slate-500">
          Club origen
          <input
            type="text"
            value={entry.originClub ?? ""}
            onChange={(event) =>
              updateEntry(entry.id, {
                originClub: event.target.value.trim() ? event.target.value : undefined,
              })
            }
            placeholder="Ej. FC Andorra"
            className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold"
          />
        </label>
      )}

      <label className="block text-[10px] font-bold uppercase text-slate-500">
        Enlace comunicado
        <input
          type="url"
          value={entry.clubAnnouncement ?? ""}
          onChange={(event) =>
            updateEntry(entry.id, {
              clubAnnouncement: event.target.value.trim() ? event.target.value.trim() : undefined,
            })
          }
          placeholder="https://…"
          className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold"
        />
      </label>

      <button
        type="button"
        onClick={() => removeEntry(entry.id)}
        className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[#981915]/30 px-2 py-1.5 text-[10px] font-extrabold uppercase text-[#981915] hover:bg-red-50"
      >
        <Trash2 size={12} />
        Eliminar
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTransferMarketEdit } from "@/components/editor/TransferMarketEditProvider";
import {
  ClubAnnouncementUrlField,
  clubAnnouncementFieldsFromUrlValue,
  type ClubAnnouncementUrlValue,
} from "@/components/editor/ClubAnnouncementUrlField";
import { TransferMarketWindowsEditor } from "@/components/editor/TransferMarketWindowsEditor";
import { TRANSFER_KIND_OPTIONS, newTransferEntryId } from "@/hooks/useTransferMarketDraft";
import type { TransferKind, TransferMarketWindowId } from "@/types";

type TransferMarketEditorPanelProps = {
  onClose: () => void;
};

export function TransferMarketEditorPanel({ onClose }: TransferMarketEditorPanelProps) {
  const { viewedSeason } = useSeason();
  const { squad, squadLoading, addEntry, save, busy, message, hasDraft, inferWindow, marketWindows } =
    useTransferMarketEdit();

  const [playerId, setPlayerId] = useState("");
  const [kind, setKind] = useState<TransferKind>("fichaje");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marketWindowId, setMarketWindowId] = useState<TransferMarketWindowId | "">("");
  const [originClub, setOriginClub] = useState("");
  const [clubAnnouncement, setClubAnnouncement] = useState<ClubAnnouncementUrlValue>({});

  const handleAdd = () => {
    if (!playerId) return;
    const ok = addEntry({
      id: newTransferEntryId(),
      playerId,
      kind,
      date,
      marketWindowId: marketWindowId || inferWindow(date),
      ...(kind !== "renovacion" && originClub.trim() ? { originClub: originClub.trim() } : {}),
      ...clubAnnouncementFieldsFromUrlValue(clubAnnouncement),
    });
    if (!ok) return;
    setPlayerId("");
    setOriginClub("");
    setClubAnnouncement({});
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    if (!marketWindowId) return;
    setMarketWindowId(inferWindow(value));
  };

  return (
    <div className="w-[min(100vw-2rem,28rem)] rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Mercado de fichajes</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-600">
        Ventanas de mercado y movimientos del carrusel para <strong>{viewedSeason.label}</strong>. Edita cada ficha en el
        carrusel; aquí gestionas ventanas y altas nuevas.
      </p>

      <TransferMarketWindowsEditor />

      <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]">Añadir movimiento</p>
        {squadLoading ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Cargando plantilla…
          </p>
        ) : (
          <>
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Jugador
              <select
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="">— Elegir de plantilla —</option>
                {squad.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.nombre} {player.apellido} · #{player.dorsal}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500">
                Tipo
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as TransferKind)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
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
                  value={date}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
                />
              </label>
            </div>
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Ventana
              <select
                value={marketWindowId}
                onChange={(event) => setMarketWindowId(event.target.value as TransferMarketWindowId | "")}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
              >
                <option value="">Auto ({inferWindow(date)})</option>
                {marketWindows.map((window) => (
                  <option key={window.id} value={window.id}>
                    {window.label}
                  </option>
                ))}
              </select>
            </label>
            {kind !== "renovacion" && (
              <label className="block text-[10px] font-bold uppercase text-slate-500">
                Club de origen
                <input
                  type="text"
                  value={originClub}
                  onChange={(event) => setOriginClub(event.target.value)}
                  placeholder="Ej. FC Andorra"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
                />
              </label>
            )}
            <ClubAnnouncementUrlField value={clubAnnouncement} onChange={setClubAnnouncement} />
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#214C9B] px-3 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
            >
              <Plus size={14} />
              Añadir al mercado
            </button>
          </>
        )}
      </div>

      {message && (
        <p
          className={`mb-2 text-xs font-bold ${message.includes("Error") || message.includes("Selecciona") || message.includes("ya está") ? "text-[#981915]" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        disabled={busy || !hasDraft}
        onClick={() => void save()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#981915] px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#7a1411] disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : null}
        Guardar en Supabase
      </button>
    </div>
  );
}

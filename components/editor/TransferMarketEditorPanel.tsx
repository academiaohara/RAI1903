"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import { formatSeasonBundleSaveError } from "@/lib/cms/bundle-save-error";
import {
  getTransfersBundle,
  upsertSeasonBundle,
  type CmsTransferEntry,
  type SeasonTransfersBundle,
} from "@/lib/cms/season-bundles";
import { TRANSFER_MARKET_WINDOWS, inferTransferMarketWindowId } from "@/lib/transfer-market-windows";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { TransferKind, TransferMarketWindowId } from "@/types";

type TransferMarketEditorPanelProps = {
  onClose: () => void;
};

const KIND_OPTIONS: Array<{ value: TransferKind; label: string }> = [
  { value: "fichaje", label: "Fichaje" },
  { value: "cesion", label: "Cesión" },
  { value: "renovacion", label: "Renovación" },
];

function newEntryId(): string {
  return `tm-${Date.now().toString(36)}`;
}

export function TransferMarketEditorPanel({ onClose }: TransferMarketEditorPanelProps) {
  const { viewedSeasonId, viewedSeason, bundles, refreshBundles } = useSeason();
  const { squad, loading: squadLoading } = useSquadPlayers("masculino");
  const [draft, setDraft] = useState<CmsTransferEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState("");
  const [kind, setKind] = useState<TransferKind>("fichaje");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marketWindowId, setMarketWindowId] = useState<TransferMarketWindowId | "">("");
  const [originClub, setOriginClub] = useState("");
  const [clubAnnouncement, setClubAnnouncement] = useState("");

  const bundleEntries = useMemo(() => getTransfersBundle(bundles)?.entries ?? [], [bundles]);
  const entries = draft ?? bundleEntries;

  useEffect(() => {
    queueMicrotask(() => setDraft(null));
  }, [bundles, viewedSeasonId]);

  const squadById = useMemo(() => new Map(squad.map((player) => [player.id, player])), [squad]);

  const playerLabel = useCallback(
    (id: string) => {
      const player = squadById.get(id);
      return player ? getPlayerDisplayName(player) : id;
    },
    [squadById],
  );

  const save = async () => {
    setBusy(true);
    setMessage(null);
    const payload: SeasonTransfersBundle = { entries };
    const result = await upsertSeasonBundle(viewedSeasonId, "global", "transfers", payload);
    setBusy(false);
    if (!result.ok) {
      setMessage(formatSeasonBundleSaveError(result.error ?? "Error al guardar"));
      return;
    }
    setMessage(`Mercado guardado para ${viewedSeason.label}`);
    setDraft(null);
    await refreshBundles();
  };

  const removeEntry = (id: string) => {
    setDraft((current) => (current ?? bundleEntries).filter((entry) => entry.id !== id));
  };

  const addEntry = () => {
    if (!playerId) {
      setMessage("Selecciona un jugador de la plantilla");
      return;
    }
    const current = draft ?? bundleEntries;
    if (current.some((entry) => entry.playerId === playerId)) {
      setMessage("Ese jugador ya está en el mercado de esta temporada");
      return;
    }
    const resolvedWindow =
      marketWindowId || inferTransferMarketWindowId(date);

    const entry: CmsTransferEntry = {
      id: newEntryId(),
      playerId,
      kind,
      date,
      marketWindowId: resolvedWindow,
      ...(kind !== "renovacion" && originClub.trim() ? { originClub: originClub.trim() } : {}),
      ...(clubAnnouncement.trim() ? { clubAnnouncement: clubAnnouncement.trim() } : {}),
    };

    setDraft([entry, ...current]);
    setPlayerId("");
    setOriginClub("");
    setClubAnnouncement("");
    setMessage(null);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    if (!marketWindowId) return;
    setMarketWindowId(inferTransferMarketWindowId(value));
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
        Altas, cesiones y renovaciones del carrusel de inicio para <strong>{viewedSeason.label}</strong>.
        Solo entran jugadores de la plantilla masculina (por id). No se muestran salidas.
      </p>

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
                    {getPlayerDisplayName(player)} · #{player.dorsal} · {player.id}
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
                  {KIND_OPTIONS.map((option) => (
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
                <option value="">Auto ({inferTransferMarketWindowId(date)})</option>
                {TRANSFER_MARKET_WINDOWS.map((window) => (
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
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Comunicado (opcional)
              <textarea
                value={clubAnnouncement}
                onChange={(event) => setClubAnnouncement(event.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold"
              />
            </label>
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#214C9B] px-3 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
            >
              <Plus size={14} />
              Añadir al mercado
            </button>
          </>
        )}
      </div>

      <ul className="mb-3 max-h-52 space-y-2 overflow-y-auto text-xs">
        {entries.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-200 p-3 text-slate-500">
            Sin movimientos en Supabase para esta temporada.
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 px-2 py-2"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-800">{playerLabel(entry.playerId)}</p>
                <p className="text-slate-500">
                  {KIND_OPTIONS.find((option) => option.value === entry.kind)?.label ?? entry.kind} · {entry.date}
                  {entry.marketWindowId ? ` · ${entry.marketWindowId}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="shrink-0 rounded-full p-1.5 text-[#981915] hover:bg-red-50"
                aria-label="Quitar"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))
        )}
      </ul>

      {message && (
        <p
          className={`mb-2 text-xs font-bold ${message.includes("Error") || message.includes("Selecciona") || message.includes("ya está") ? "text-[#981915]" : "text-emerald-700"}`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        disabled={busy || draft === null}
        onClick={() => void save()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#981915] px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#7a1411] disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : null}
        Guardar en Supabase
      </button>
    </div>
  );
}

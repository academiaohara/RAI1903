"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  fetchStadiumCatalogEntries,
  saveClubStadiumForSeason,
  type StadiumCatalogEntry,
} from "@/lib/cms/stadium-catalog";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { StadiumInfo } from "@/types/squad";

type StadiumEditorModalProps = {
  open: boolean;
  onClose: () => void;
  gender: PrimerEquipoGender;
  clubName: string;
  current: StadiumInfo;
  onSaved: (stadium: StadiumInfo) => void;
};

const EMPTY_STADIUM: StadiumInfo = {
  nombre: "",
  imagen: "",
  capacidad: 5000,
  direccion: "",
  ciudad: "",
  inaugurado: 1920,
  superficie: "Césped natural",
};

export function StadiumEditorModal({
  open,
  onClose,
  gender,
  clubName,
  current,
  onSaved,
}: StadiumEditorModalProps) {
  const { viewedSeasonId, bundles, refreshBundles } = useSeason();
  const [catalog, setCatalog] = useState<StadiumCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [draft, setDraft] = useState<StadiumInfo>(current);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    const entries = await fetchStadiumCatalogEntries();
    setCatalog(entries);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setDraft(current);
      setMode("pick");
      setMessage(null);
      void loadCatalog();
    });
  }, [current, loadCatalog, open]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (entry) =>
        entry.nombre.toLowerCase().includes(q) ||
        entry.ciudad.toLowerCase().includes(q) ||
        (entry.seasonLabel?.toLowerCase().includes(q) ?? false),
    );
  }, [catalog, filter]);

  const saveStadium = async (stadium: StadiumInfo) => {
    if (!stadium.nombre.trim() || !stadium.imagen.trim()) {
      setMessage("Indica al menos nombre e imagen del estadio.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await saveClubStadiumForSeason(viewedSeasonId, gender, bundles, stadium, clubName);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo guardar el estadio");
      return;
    }
    await refreshBundles();
    onSaved(stadium);
    onClose();
  };

  return (
    <Modal open={open} title="Estadio del club" onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        Elige un estadio ya usado en otra temporada o crea uno nuevo con enlace a la imagen, capacidad y datos.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("pick")}
          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-extrabold uppercase ${
            mode === "pick" ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-slate-200 text-slate-600"
          }`}
        >
          Estadios guardados
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("new");
            setDraft({ ...EMPTY_STADIUM, nombre: current.nombre });
          }}
          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-extrabold uppercase ${
            mode === "new" ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-slate-200 text-slate-600"
          }`}
        >
          Nuevo estadio
        </button>
      </div>

      {mode === "pick" ? (
        <div className="space-y-3">
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar por nombre, ciudad o temporada…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Cargando estadios…
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No hay estadios guardados. Crea uno en «Nuevo estadio».</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {filtered.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveStadium(entry)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left transition hover:border-[#214C9B]/30 hover:bg-blue-50/50 disabled:opacity-60"
                  >
                    <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      {entry.imagen ? (
                        <Image src={entry.imagen} alt="" fill className="object-cover" sizes="80px" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">{entry.nombre}</span>
                      <span className="block text-xs text-slate-500">
                        {entry.ciudad || "Sin ciudad"}
                        {entry.capacidad > 0 ? ` · ${entry.capacidad.toLocaleString("es-ES")} espectadores` : ""}
                      </span>
                      {(entry.seasonLabel || entry.teamLabel) && (
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase text-[#214C9B]/70">
                          {[entry.teamLabel, entry.seasonLabel].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <StadiumForm draft={draft} onChange={setDraft} disabled={busy} />
      )}

      {mode === "new" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveStadium(draft)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Guardar estadio
        </button>
      )}

      {message && <p className="mt-3 text-sm font-semibold text-[#981915]">{message}</p>}
    </Modal>
  );
}

function StadiumForm({
  draft,
  onChange,
  disabled,
}: {
  draft: StadiumInfo;
  onChange: (next: StadiumInfo) => void;
  disabled?: boolean;
}) {
  const patch = (partial: Partial<StadiumInfo>) => onChange({ ...draft, ...partial });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre" value={draft.nombre} onChange={(value) => patch({ nombre: value })} disabled={disabled} />
      <Field
        label="Enlace imagen"
        value={draft.imagen}
        onChange={(value) => patch({ imagen: value })}
        disabled={disabled}
        placeholder="/estadio/real-aviles-industrial.jpg"
      />
      <Field
        label="Capacidad"
        type="number"
        value={String(draft.capacidad)}
        onChange={(value) => patch({ capacidad: Number(value) || 0 })}
        disabled={disabled}
      />
      <Field
        label="Inaugurado"
        type="number"
        value={String(draft.inaugurado)}
        onChange={(value) => patch({ inaugurado: Number(value) || 0 })}
        disabled={disabled}
      />
      <Field label="Dirección" value={draft.direccion} onChange={(value) => patch({ direccion: value })} disabled={disabled} />
      <Field label="Ciudad" value={draft.ciudad} onChange={(value) => patch({ ciudad: value })} disabled={disabled} />
      <Field
        label="Superficie"
        value={draft.superficie}
        onChange={(value) => patch({ superficie: value })}
        disabled={disabled}
        className="sm:col-span-2"
      />
      {draft.imagen.trim() && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:col-span-2">
          <Image src={draft.imagen} alt="Vista previa" fill className="object-cover" sizes="(max-width: 768px) 100vw" />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-bold uppercase text-slate-500 ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold normal-case text-slate-800"
      />
    </label>
  );
}

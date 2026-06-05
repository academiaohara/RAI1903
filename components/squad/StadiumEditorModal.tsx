"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  deleteStadiumCatalogEntry,
  fetchStadiumCatalogEntries,
  saveClubStadiumForSeason,
  stadiumEntryKey,
  updateStadiumCatalogEntry,
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
  /** Si se define, sustituye el guardado en el bundle `squad` del Avilés. */
  onSave?: (stadium: StadiumInfo) => Promise<{ ok: boolean; error?: string }>;
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

type EditorScreen = "list" | "form";

export function StadiumEditorModal({
  open,
  onClose,
  gender,
  clubName,
  current,
  onSaved,
  onSave,
}: StadiumEditorModalProps) {
  const { viewedSeasonId, bundles, refreshBundles } = useSeason();
  const [catalog, setCatalog] = useState<StadiumCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [screen, setScreen] = useState<EditorScreen>("list");
  const [draft, setDraft] = useState<StadiumInfo>(current);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentEntryId = useMemo(() => stadiumEntryKey(current), [current]);

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
      setScreen("list");
      setEditingId(null);
      setMessage(null);
      setFilter("");
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

  const assignStadiumToClub = async (stadium: StadiumInfo) => {
    const result = onSave
      ? await onSave(stadium)
      : await saveClubStadiumForSeason(viewedSeasonId, gender, bundles, stadium, clubName);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo asignar el estadio al club");
      return false;
    }
    await refreshBundles();
    onSaved(stadium);
    return true;
  };

  const saveStadium = async (stadium: StadiumInfo, options?: { assign?: boolean }) => {
    if (!stadium.nombre.trim() || !stadium.imagen.trim()) {
      setMessage("Indica al menos nombre e imagen del estadio.");
      return;
    }
    setBusy(true);
    setMessage(null);

    const shouldAssign =
      options?.assign ?? (editingId === null || editingId === currentEntryId);

    if (editingId) {
      const catalogResult = await updateStadiumCatalogEntry(editingId, stadium, {
        teamLabel: clubName,
      });
      if (!catalogResult.ok) {
        setBusy(false);
        setMessage(catalogResult.error ?? "No se pudo actualizar el estadio");
        return;
      }
    }

    if (shouldAssign) {
      const assigned = await assignStadiumToClub(stadium);
      setBusy(false);
      if (!assigned) return;
      onClose();
      return;
    }

    setBusy(false);
    await loadCatalog();
    setScreen("list");
    setEditingId(null);
    setMessage("Estadio actualizado en el catálogo.");
  };

  const handleUseEntry = async (entry: StadiumCatalogEntry) => {
    setBusy(true);
    setMessage(null);
    const assigned = await assignStadiumToClub(entry);
    setBusy(false);
    if (assigned) onClose();
  };

  const handleEditEntry = (entry: StadiumCatalogEntry) => {
    setDraft({
      nombre: entry.nombre,
      imagen: entry.imagen,
      capacidad: entry.capacidad,
      direccion: entry.direccion,
      ciudad: entry.ciudad,
      inaugurado: entry.inaugurado,
      superficie: entry.superficie,
    });
    setEditingId(entry.id);
    setScreen("form");
    setMessage(null);
  };

  const handleDeleteEntry = async (entry: StadiumCatalogEntry) => {
    if (!entry.deletable) {
      setMessage("Los estadios del repositorio no se pueden borrar desde aquí.");
      return;
    }
    if (!window.confirm(`¿Borrar «${entry.nombre}» del catálogo?`)) return;

    setBusy(true);
    setMessage(null);
    const result = await deleteStadiumCatalogEntry(entry.id);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "No se pudo borrar el estadio");
      return;
    }
    await loadCatalog();
  };

  const openNewForm = () => {
    setDraft({ ...EMPTY_STADIUM, nombre: current.nombre });
    setEditingId(null);
    setScreen("form");
    setMessage(null);
  };

  const backToList = () => {
    setScreen("list");
    setEditingId(null);
    setMessage(null);
  };

  return (
    <Modal open={open} title="Estadio del club" onClose={onClose}>
      {screen === "list" ? (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Elige un estadio para asignarlo al club, edítalo si necesitas corregir datos o crea uno nuevo.
          </p>

          <div className="mb-4 flex gap-2">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Buscar por nombre, ciudad o temporada…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={openNewForm}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#214C9B] bg-[#214C9B] px-3 py-2 text-xs font-extrabold uppercase text-white hover:bg-[#173a78]"
            >
              <Plus size={14} />
              Nuevo
            </button>
          </div>

          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Cargando estadios…
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No hay estadios guardados. Crea uno con «Nuevo».</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {filtered.map((entry) => {
                const isCurrent = entry.id === currentEntryId;
                return (
                  <li key={entry.id}>
                    <div
                      className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                        isCurrent
                          ? "border-[#214C9B]/40 bg-blue-50/60"
                          : "border-slate-200 bg-slate-50/80 hover:border-[#214C9B]/30"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUseEntry(entry)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-60"
                      >
                        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                          {entry.imagen ? (
                            <Image src={entry.imagen} alt="" fill className="object-cover" sizes="80px" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="block truncate text-sm font-bold text-slate-900">{entry.nombre}</span>
                            {isCurrent && (
                              <span className="shrink-0 rounded bg-[#214C9B]/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-[#214C9B]">
                                Actual
                              </span>
                            )}
                          </span>
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
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleEditEntry(entry)}
                          title="Editar estadio"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-[#214C9B]/30 hover:text-[#214C9B] disabled:opacity-60"
                        >
                          <Pencil size={14} />
                        </button>
                        {entry.deletable ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDeleteEntry(entry)}
                            title="Borrar del catálogo"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-red-300 hover:text-red-700 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={backToList}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#214C9B] hover:underline"
          >
            <ArrowLeft size={14} />
            Volver a la lista
          </button>

          <p className="mb-4 text-sm text-slate-600">
            {editingId
              ? "Corrige los datos del estadio. Si es el estadio actual del club, también se actualizará la ficha."
              : "Crea un estadio nuevo y asígnalo al club."}
          </p>

          <StadiumForm draft={draft} onChange={setDraft} disabled={busy} />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveStadium(draft, { assign: true })}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#173a78] disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {editingId ? "Guardar y asignar al club" : "Guardar estadio"}
            </button>
            {editingId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveStadium(draft, { assign: false })}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold uppercase text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Solo actualizar catálogo
              </button>
            ) : null}
          </div>
        </>
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
      <div className="sm:col-span-2">
        <Field
          label="Ruta de la imagen"
          value={draft.imagen}
          onChange={(value) => patch({ imagen: value })}
          disabled={disabled}
          placeholder="/estadio/real-aviles-industrial.jpg"
        />
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Sube el archivo a{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">public/estadio/</code> y escribe la ruta web
          que empieza por <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">/estadio/</code> (sin{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">public</code>). Ejemplo: si subes{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">public/estadio/mi-estadio.jpg</code>, pon{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">/estadio/mi-estadio.jpg</code>. Opcional:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">npm run sync:estadios</code> regenera el
          manifiesto.
        </p>
      </div>
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
      <div className="sm:col-span-2">
        <Field
          label="Enlace Google Maps"
          value={draft.direccion}
          onChange={(value) => patch({ direccion: value })}
          disabled={disabled}
          placeholder="https://maps.app.goo.gl/… o https://www.google.com/maps/place/…"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Pega el enlace completo de Google Maps. Se usará en «Ver en Google Maps» al abrir la ficha del estadio.
        </p>
      </div>
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

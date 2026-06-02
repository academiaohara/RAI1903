"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useTransferMarketEdit } from "@/components/editor/TransferMarketEditProvider";

export function TransferMarketWindowsEditor() {
  const { configuredWindows, addWindow, updateWindow, removeWindow, moveWindow, slugifyWindowId } =
    useTransferMarketEdit();
  const [newLabel, setNewLabel] = useState("");

  const previewId = newLabel.trim() ? slugifyWindowId(newLabel) : "";

  const handleAdd = () => {
    if (!addWindow(newLabel)) return;
    setNewLabel("");
  };

  return (
    <div className="mb-4 space-y-2 rounded-xl border border-[#214C9B]/15 bg-[#214C9B]/5 p-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B]">Ventanas de mercado</p>
      <p className="text-[10px] leading-relaxed text-slate-600">
        Define las ventanas visibles en el carrusel (verano, invierno, etc.). Orden: de la más antigua a la más
        reciente.
      </p>

      <ul className="space-y-1.5">
        {configuredWindows.map((window, index) => (
          <li
            key={window.id}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5"
          >
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={window.label}
                onChange={(event) => updateWindow(window.id, { label: event.target.value })}
                className="w-full rounded border-0 bg-transparent px-0 py-0 text-xs font-semibold text-slate-800 focus:ring-0"
                aria-label={`Nombre de ${window.id}`}
              />
              <p className="truncate text-[9px] font-mono text-slate-400">{window.id}</p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => moveWindow(window.id, "up")}
                disabled={index === 0}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Subir ventana"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveWindow(window.id, "down")}
                disabled={index === configuredWindows.length - 1}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Bajar ventana"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeWindow(window.id)}
                disabled={configuredWindows.length <= 1}
                className="rounded p-1 text-[#981915] hover:bg-red-50 disabled:opacity-30"
                aria-label="Eliminar ventana"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <label className="min-w-0 flex-1 text-[10px] font-bold uppercase text-slate-500">
          Nueva ventana
          <input
            type="text"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Ej. Verano 26/27"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800"
          />
          {previewId ? (
            <span className="mt-0.5 block font-mono text-[9px] normal-case text-slate-400">id: {previewId}</span>
          ) : null}
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="mt-5 inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-[#214C9B]/25 px-2.5 py-2 text-[10px] font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
        >
          <Plus size={14} />
          Añadir
        </button>
      </div>
    </div>
  );
}

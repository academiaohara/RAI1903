"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssetCatalogEntry } from "@/lib/asset-catalog";

type CrestPickerPopoverProps = {
  teamLabel: string;
  currentPath?: string;
  onSelect: (path: string) => void;
  onClose: () => void;
};

export function CrestPickerPopover({ teamLabel, currentPath, onSelect, onClose }: CrestPickerPopoverProps) {
  const [catalog, setCatalog] = useState<AssetCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [manualPath, setManualPath] = useState(currentPath ?? "");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/cms/assets");
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const data = (await response.json()) as { crests: AssetCatalogEntry[] };
    setCatalog(data.crests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalog();
    });
  }, [loadCatalog]);

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((entry) => entry.slug.includes(q) || entry.path.toLowerCase().includes(q));
  }, [catalog, filter]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[min(85vh,32rem)] w-full max-w-md flex-col rounded-2xl border border-[#214C9B]/20 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#214C9B]">Escudo</p>
            <p className="text-[10px] font-semibold text-slate-500">{teamLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <p className="mb-2 text-[10px] leading-relaxed text-slate-500">
            Sube el PNG en GitHub (<code className="rounded bg-slate-100 px-1">public/escudos/</code> o{" "}
            <code className="rounded bg-slate-100 px-1">Escudos/</code>) y elige la imagen aquí.
          </p>

          <div className="mb-3 flex gap-2">
            <input
              value={manualPath}
              onChange={(event) => setManualPath(event.target.value)}
              placeholder="/escudos/equipo.png"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              disabled={!manualPath.trim()}
              onClick={() => onSelect(manualPath.trim())}
              className="shrink-0 rounded-lg bg-[#214C9B] px-2 py-1.5 text-[10px] font-extrabold uppercase text-white disabled:opacity-50"
            >
              Usar ruta
            </button>
          </div>

          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Buscar en imágenes del repo…"
            className="mb-3 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
          />

          {loading ? (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Cargando imágenes…
            </p>
          ) : (
            <div className="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto">
              {filteredCatalog.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  onClick={() => onSelect(entry.path)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-100 p-1 hover:border-[#214C9B]/40 hover:bg-blue-50"
                  title={entry.path}
                >
                  <Image
                    src={entry.path}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    unoptimized
                  />
                  <span className="max-w-full truncate text-[9px] font-semibold text-slate-500">
                    {entry.slug}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

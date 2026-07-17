"use client";

import { Check, Clipboard, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  EDITOR_PAGE_LINKS,
  isFemeninoPath,
  isFichajesPath,
  isFilialPath,
  isJuvenilPath,
  isPlantillaPath,
  plantillaEditorLink,
} from "@/lib/editor-routes";

type EditorMobileMoreMenuProps = {
  pathname: string;
  copied: boolean;
  onExport: () => void;
  onClose: () => void;
  onOpenPanel: (panel: "sectionStatus" | "femenino" | "teams" | "home" | "mediaRai") => void;
  closeEditorPanels: () => void;
};

export function EditorMobileMoreMenu({
  pathname,
  copied,
  onExport,
  onClose,
  onOpenPanel,
  closeEditorPanels,
}: EditorMobileMoreMenuProps) {
  const linkClass =
    "flex min-h-11 w-full items-center gap-2 rounded-xl border border-[#214C9B]/15 px-3 py-2.5 text-left text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50 active:bg-blue-100";

  const femLinkClass =
    "flex min-h-11 w-full items-center gap-2 rounded-xl border border-[#981915]/20 px-3 py-2.5 text-left text-xs font-extrabold uppercase text-[#981915] hover:bg-red-50 active:bg-red-100";

  const openPanel = (panel: "sectionStatus" | "femenino" | "teams" | "home" | "mediaRai") => {
    closeEditorPanels();
    onOpenPanel(panel);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[83] bg-slate-900/40 backdrop-blur-[1px] sm:hidden"
        aria-label="Cerrar menú"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Más opciones del editor"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[84] max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain rounded-2xl border border-[#214C9B]/20 bg-white p-3 shadow-2xl sm:hidden"
      >
        <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
          Más opciones
        </p>
        <div className="grid gap-1.5">
          <button type="button" onClick={() => openPanel("sectionStatus")} className={linkClass}>
            Secciones
          </button>
          {!isPlantillaPath(pathname) && (
            <Link
              href={plantillaEditorLink(pathname)}
              onClick={() => {
                closeEditorPanels();
                onClose();
              }}
              className={linkClass}
            >
              <ExternalLink size={14} aria-hidden />
              Plantilla
            </Link>
          )}
          <button type="button" onClick={() => openPanel("femenino")} className={femLinkClass}>
            Femenino
          </button>
          {!isFemeninoPath(pathname) && (
            <Link href={EDITOR_PAGE_LINKS.femenino} onClick={() => { closeEditorPanels(); onClose(); }} className={femLinkClass}>
              <ExternalLink size={14} aria-hidden />
              Ir a femenino
            </Link>
          )}
          <button type="button" onClick={() => openPanel("teams")} className={linkClass}>
            Equipos
          </button>
          <button type="button" onClick={() => openPanel("home")} className={linkClass}>
            Inicio
          </button>
          <button type="button" onClick={() => openPanel("mediaRai")} className={linkClass}>
            Media RAI
          </button>
          {!isFichajesPath(pathname) && (
            <Link href={EDITOR_PAGE_LINKS.fichajes} onClick={() => { closeEditorPanels(); onClose(); }} className={linkClass}>
              <ExternalLink size={14} aria-hidden />
              Mercado
            </Link>
          )}
          {!isFilialPath(pathname) && (
            <Link href={EDITOR_PAGE_LINKS.filial} onClick={() => { closeEditorPanels(); onClose(); }} className={linkClass}>
              <ExternalLink size={14} aria-hidden />
              Filial
            </Link>
          )}
          {!isJuvenilPath(pathname) && (
            <Link href={EDITOR_PAGE_LINKS.juvenil} onClick={() => { closeEditorPanels(); onClose(); }} className={linkClass}>
              <ExternalLink size={14} aria-hidden />
              Juvenil
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              void onExport();
              onClose();
            }}
            className={linkClass}
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
            {copied ? "Copiado" : "Exportar"}
          </button>
        </div>
      </div>
    </>
  );
}

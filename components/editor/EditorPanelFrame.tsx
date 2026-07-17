"use client";

import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

type EditorPanelFrameProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  message?: string | null;
};

export function EditorPanelFrame({
  title,
  subtitle,
  onClose,
  children,
  footer,
  busy,
  message,
}: EditorPanelFrameProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[84] bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Cerrar panel"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-panel-title"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[85] flex max-h-[min(72vh,640px)] w-auto flex-col overflow-hidden rounded-2xl border border-[#214C9B]/25 bg-white shadow-2xl sm:bottom-20 sm:left-auto sm:right-4 sm:max-h-[min(82vh,720px)] sm:w-[min(100vw-2rem,28rem)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 id="editor-panel-title" className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">{children}</div>
        {(footer || message) && (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3">
            {message ? (
              <p
                className={`mb-2 text-xs font-bold ${message.includes("Error") ? "text-[#981915]" : "text-emerald-700"}`}
              >
                {message}
              </p>
            ) : null}
            {footer}
            {busy ? (
              <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Guardando…
              </p>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

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
    <div className="fixed bottom-20 right-4 z-[85] flex max-h-[min(82vh,720px)] w-[min(100vw-2rem,28rem)] flex-col overflow-hidden rounded-2xl border border-[#214C9B]/25 bg-white shadow-2xl">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
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
  );
}

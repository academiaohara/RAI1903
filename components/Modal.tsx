"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#214C9B]/25 bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[90vh] sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#214C9B]/20 bg-white/95 p-4 backdrop-blur sm:items-center sm:p-5">
          <h2 className="min-w-0 break-words text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:text-xl">{title}</h2>
          <button onClick={onClose} className="shrink-0 rounded-full border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

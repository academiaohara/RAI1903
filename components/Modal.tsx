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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#981915]/25 bg-white shadow-2xl shadow-slate-950/30">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#981915]/20 bg-white/95 p-5 backdrop-blur">
          <h2 className="text-xl font-black uppercase text-[#981915]">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-[#981915]/20 p-2 text-[#981915] transition hover:border-[#981915] hover:bg-red-50" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

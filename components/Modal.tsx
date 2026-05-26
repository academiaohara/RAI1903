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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#c4121a]/25 bg-white shadow-2xl shadow-slate-950/30">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#c4121a]/20 bg-white/95 p-5 backdrop-blur">
          <h2 className="text-xl font-black uppercase text-[#c4121a]">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-[#c4121a]/20 p-2 text-[#c4121a] transition hover:border-[#c4121a] hover:bg-red-50" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

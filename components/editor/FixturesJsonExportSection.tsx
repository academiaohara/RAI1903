"use client";

import { useState } from "react";

type FixturesJsonExportSectionProps = {
  title?: string;
  getJson: () => string;
  accent?: "club" | "femenino";
};

const ACCENT_STYLES = {
  club: {
    section: "border-[#214C9B]/20 bg-blue-50/40",
    button: "border-[#214C9B]/25 text-[#214C9B] hover:bg-white",
    text: "text-[#214C9B]",
  },
  femenino: {
    section: "border-[#981915]/20 bg-red-50/40",
    button: "border-[#981915]/25 text-[#981915] hover:bg-white",
    text: "text-[#981915]",
  },
} as const;

export function FixturesJsonExportSection({
  title = "Exportar calendario JSON",
  getJson,
  accent = "club",
}: FixturesJsonExportSectionProps) {
  const styles = ACCENT_STYLES[accent];
  const [message, setMessage] = useState<string | null>(null);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(getJson());
      setMessage("JSON copiado al portapapeles");
      window.setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("No se pudo copiar. Prueba a descargar el archivo.");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([getJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "calendario.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Descarga iniciada");
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className={`rounded-2xl border p-4 ${styles.section}`}>
      <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${styles.text}`}>{title}</p>
      <p className="mt-2 text-[11px] font-semibold text-slate-500">
        Copia o descarga el calendario actual (con resultados y horas) para editarlo fuera y volver a importarlo.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyJson()}
          className={`rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase ${styles.button}`}
        >
          Copiar JSON
        </button>
        <button
          type="button"
          onClick={downloadJson}
          className={`rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase ${styles.button}`}
        >
          Descargar JSON
        </button>
      </div>
      {message ? <p className="mt-2 text-[11px] font-bold text-emerald-700">{message}</p> : null}
    </section>
  );
}

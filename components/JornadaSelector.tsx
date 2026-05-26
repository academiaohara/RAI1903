"use client";

export function JornadaSelector({ value, total, onChange }: { value: number; total: number; onChange: (round: number) => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <label className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70" htmlFor="matchday">Selecciona jornada</label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select id="matchday" value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-blue-300/60">
          {Array.from({ length: total }).map((_, index) => (
            <option key={index + 1} value={index + 1}>Jornada {index + 1}</option>
          ))}
        </select>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {Array.from({ length: total }).map((_, index) => {
            const round = index + 1;
            return (
              <button key={round} onClick={() => onChange(round)} className={`h-11 min-w-11 rounded-2xl border text-sm font-black transition ${value === round ? "border-white bg-white text-slate-950" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                {round}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

export function JornadaSelector({ value, total, onChange }: { value: number; total: number; onChange: (round: number) => void }) {
  return (
    <div className="rounded-3xl border border-[#c4121a]/20 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
      <label className="text-xs font-black uppercase tracking-[0.22em] text-[#1c4f9c]" htmlFor="matchday">Selecciona jornada</label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select id="matchday" value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-2xl border border-[#c4121a]/25 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-[#c4121a]">
          {Array.from({ length: total }).map((_, index) => (
            <option key={index + 1} value={index + 1}>Jornada {index + 1}</option>
          ))}
        </select>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {Array.from({ length: total }).map((_, index) => {
            const round = index + 1;
            return (
              <button key={round} onClick={() => onChange(round)} className={`h-11 min-w-11 rounded-2xl border text-sm font-black transition ${value === round ? "border-[#c4121a] bg-[#c4121a] text-white" : "border-[#c4121a]/20 bg-white text-slate-700 hover:bg-red-50"}`}>
                {round}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

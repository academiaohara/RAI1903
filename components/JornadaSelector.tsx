"use client";

export function JornadaSelector({
  value,
  total,
  currentRound,
  onChange,
}: {
  value: number;
  total: number;
  currentRound: number;
  onChange: (round: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-[#214C9B]/20 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Jornadas</p>
          <p className="mt-1 text-sm font-bold text-slate-600">
            Jornada <span className="text-[#214C9B]">{value}</span> de {total}
          </p>
        </div>
        <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">Actual: J{currentRound}</p>
      </div>

      <input
        type="range"
        min={1}
        max={total}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#214C9B]/15 accent-[#214C9B]"
        aria-label="Barra de jornadas"
      />

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: total }).map((_, index) => {
          const round = index + 1;
          const isCurrent = round === currentRound;
          const isSelected = value === round;

          return (
            <button
              key={round}
              type="button"
              onClick={() => onChange(round)}
              className={`h-11 min-w-11 shrink-0 rounded-2xl border text-sm font-extrabold transition ${
                isSelected
                  ? isCurrent
                    ? "border-[#981915] bg-[#981915] text-white"
                    : "border-[#214C9B] bg-[#214C9B] text-white"
                  : isCurrent
                    ? "border-[#981915]/50 bg-[#981915]/10 text-[#981915] hover:border-[#214C9B] hover:bg-blue-50 hover:text-[#214C9B]"
                    : "border-[#214C9B]/20 bg-white text-slate-700 hover:border-[#214C9B] hover:bg-blue-50 hover:text-[#214C9B]"
              }`}
            >
              {round}
            </button>
          );
        })}
      </div>
    </div>
  );
}

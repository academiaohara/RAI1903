import { CircleDot, LayoutGrid } from "lucide-react";

const rules = [
  {
    title: "Signo 1-X-2",
    description: "En los 10 partidos de la jornada, acierta si gana el local (1), empatan (X) o gana el visitante (2).",
    points: "+1 pt",
    iconBg: "bg-[#214C9B]",
    icon: (
      <div className="flex gap-0.5 text-[10px] font-extrabold leading-none text-white">
        <span>1</span>
        <span className="opacity-80">·</span>
        <span>X</span>
        <span className="opacity-80">·</span>
        <span>2</span>
      </div>
    ),
  },
  {
    title: "Porra del Avilés",
    description: "En el partido del Real Avilés Industrial, acierta los goles de ambos equipos (0, 1, 2 o M si marca 3 o más).",
    points: "+1 pt",
    iconBg: "bg-[#214C9B]",
    icon: <span className="text-sm font-extrabold leading-none text-white">2:0</span>,
  },
  {
    title: "Goleador del Avilés",
    description: "En el mismo partido, acierta quién marca para el Avilés. Si no anota, elige «Nadie».",
    points: "+1 pt",
    iconBg: "bg-violet-600",
    icon: <CircleDot className="h-6 w-6 text-white" strokeWidth={2.25} aria-hidden />,
  },
] as const;

export function QuinielaHowItWorks() {
  return (
    <section className="space-y-3 sm:space-y-5" aria-labelledby="quiniela-how-it-works-title">
      <div>
        <h2
          id="quiniela-how-it-works-title"
          className="text-lg font-extrabold uppercase leading-tight text-[#214C9B] sm:text-3xl"
        >
          ¿Cómo funciona la quiniela?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          La quiniela de Rai1903 es el juego semanal donde demuestras tu instinto azulón. Rellena los 10 partidos de
          la jornada antes del pitido inicial y compite por el mejor puesto del ranking.
        </p>
      </div>

      <ul className="grid gap-2 sm:gap-3 lg:grid-cols-3">
        {rules.map((rule) => (
          <li
            key={rule.title}
            className="flex items-center gap-2.5 rounded-xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] sm:gap-4 sm:rounded-2xl sm:p-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${rule.iconBg}`}
              aria-hidden
            >
              {rule.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-900 sm:text-base">{rule.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:mt-1 sm:text-sm">{rule.description}</p>
            </div>
            <p className="shrink-0 text-right">
              <span className="block text-sm font-extrabold text-[#981915] sm:text-lg">{rule.points}</span>
            </p>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2 text-xs text-slate-500 sm:text-sm">
        <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[#214C9B]" aria-hidden />
        <span>
          En el partido del Avilés el signo 1-X-2 se calcula solo a partir de los goles que elijas. Hasta 12 puntos por
          jornada si aciertas todo.
        </span>
      </p>
    </section>
  );
}

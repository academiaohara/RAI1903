import Link from "next/link";
import { Trophy } from "lucide-react";
import type { Route } from "next";

const winners = [
  { user: "pacomilla", hits: 5, points: 5 },
  { user: "gon", hits: 5, points: 5 },
  { user: "la paulis", hits: 5, points: 5 },
];

export function MatchCenterSidebar() {
  return (
    <aside>
      <div className="rounded-2xl border border-[#214C9B]/20 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">Inicia sesion para ver tus resultados</p>
        <Link
          href={"/quiniela" as Route}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-[#981915] px-4 py-2 text-sm font-extrabold uppercase text-[#981915] transition hover:bg-[#981915] hover:text-white"
        >
          Entrar
        </Link>
      </div>

      <div className="rounded-2xl border border-[#214C9B]/20 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase text-[#214C9B]">Los ganadores de la semana</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase text-slate-500">
              <th className="pb-2">Usuario</th>
              <th className="pb-2">Aciertos</th>
              <th className="pb-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((row) => (
              <tr key={row.user} className="border-t border-slate-100">
                <td className="py-2 font-semibold text-slate-800">{row.user}</td>
                <td className="py-2">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Trophy size={14} className="text-violet-500" aria-hidden />
                    {row.hits}
                  </span>
                </td>
                <td className="py-2 text-right font-extrabold text-[#214C9B]">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
}

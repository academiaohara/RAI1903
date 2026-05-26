import { Star } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import type { TransferRumor } from "@/types";

const statusTone = {
  Interes: "blue",
  Negociacion: "amber",
  Cercano: "green",
  Oficial: "green",
  Descartado: "red",
} as const;

export function TransferCard({ transfer }: { transfer: TransferRumor }) {
  const movement = transfer.category === "Bajas" ? "Salida" : "Fichaje";
  const initials = transfer.playerName.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#214C9B]/25 bg-white shadow-[0_18px_45px_rgba(17,24,39,0.08)] transition hover:-translate-y-1 hover:border-[#214C9B]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#dbeafe_26%,#214C9B_62%,#173a78_100%)] text-6xl font-extrabold text-white">
        {initials}
        <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#981915] text-sm font-extrabold text-white shadow-lg">
          {(transfer.destinationClub ?? transfer.originClub ?? "RAI").slice(0, 3).toUpperCase()}
        </div>
      </div>
      <div className="bg-[#214C9B] px-5 py-3">
        <h3 className="text-2xl font-extrabold uppercase leading-none text-white">{transfer.playerName}</h3>
        <p className="mt-1 text-sm font-bold uppercase tracking-normal text-white/80">{transfer.position} · {transfer.age} anos</p>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={movement === "Salida" ? "red" : "blue"}>{movement}</Badge>
            <Badge tone={statusTone[transfer.status]}>{transfer.status}</Badge>
          </div>
          <div className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 px-3 py-2 text-center">
            <p className="text-2xl font-extrabold text-[#214C9B]">{transfer.probability}%</p>
            <p className="text-[10px] uppercase tracking-normal text-slate-500">prob.</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#214C9B] to-[#981915]" style={{ width: `${transfer.probability}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><span className="block text-xs uppercase tracking-normal text-slate-500">Origen</span>{transfer.originClub ?? "-"}</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><span className="block text-xs uppercase tracking-normal text-slate-500">Destino</span>{transfer.destinationClub ?? "-"}</div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{transfer.analysis}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={16} fill={index < transfer.rating ? "currentColor" : "none"} />
            ))}
          </div>
          <p className="text-right text-xs font-bold uppercase tracking-normal text-slate-500">{transfer.source} · {formatDate(transfer.date)}</p>
        </div>
      </div>
    </article>
  );
}

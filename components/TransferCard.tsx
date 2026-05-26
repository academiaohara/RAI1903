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
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-blue-300/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone={statusTone[transfer.status]}>{transfer.status}</Badge>
          <h3 className="mt-3 text-2xl font-black text-white">{transfer.playerName}</h3>
          <p className="text-sm font-bold text-blue-100">{transfer.position} · {transfer.age} anos</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-center">
          <p className="text-2xl font-black text-white">{transfer.probability}%</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">prob.</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-[#214C9B] via-white to-[#981915]" style={{ width: `${transfer.probability}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-2xl bg-slate-950/60 p-3"><span className="block text-xs uppercase tracking-[0.16em] text-slate-500">Origen</span>{transfer.originClub ?? "-"}</div>
        <div className="rounded-2xl bg-slate-950/60 p-3"><span className="block text-xs uppercase tracking-[0.16em] text-slate-500">Destino</span>{transfer.destinationClub ?? "-"}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{transfer.analysis}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex text-amber-300">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={16} fill={index < transfer.rating ? "currentColor" : "none"} />
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{transfer.source} · {formatDate(transfer.date)}</p>
      </div>
    </article>
  );
}

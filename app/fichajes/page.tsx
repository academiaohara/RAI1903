"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { TransferCard } from "@/components/TransferCard";
import { transfers } from "@/data/mock";
import type { TransferCategory } from "@/types";

const tabs: TransferCategory[] = ["Rumores", "Altas", "Bajas", "Renovaciones"];

export default function FichajesPage() {
  const [tab, setTab] = useState<TransferCategory>("Rumores");
  const filtered = useMemo(() => transfers.filter((transfer) => transfer.category === tab), [tab]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#981915]/35 via-slate-950 to-[#214C9B]/35 p-6">
        <Badge tone="red">Mercado</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Fichajes y rumores</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Radar de altas, bajas, renovaciones y rumores con estado, probabilidad visual, fuente y analisis corto de encaje.</p>
      </section>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-slate-950/70 p-3">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${tab === item ? "bg-white text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}>{item}</button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((transfer) => <TransferCard key={transfer.id} transfer={transfer} />)}
      </div>
    </div>
  );
}

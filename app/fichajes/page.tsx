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
      <section className="rounded-[2rem] border border-[#c4121a]/25 bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
        <Badge tone="red">Mercado</Badge>
        <h1 className="mt-4 text-5xl font-black uppercase text-[#c4121a]">Fichajes y rumores</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Radar de altas, bajas, renovaciones y rumores con estado, probabilidad visual, fuente y analisis corto de encaje.</p>
      </section>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-[#c4121a]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${tab === item ? "bg-[#c4121a] text-white" : "bg-white text-slate-700 hover:bg-red-50 hover:text-[#c4121a]"}`}>{item}</button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((transfer) => <TransferCard key={transfer.id} transfer={transfer} />)}
      </div>
    </div>
  );
}

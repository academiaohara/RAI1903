"use client";

import { use, useMemo, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { newsItems } from "@/data/mock";
import { newsForTeam } from "@/lib/noticias";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { NewsTag } from "@/types";

const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function PrimerEquipoNoticiasPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const teamNews = newsForTeam(newsItems, gender);

  const filtered = useMemo(
    () => teamNews.filter((item) => tag === "todas" || item.tags.includes(tag)),
    [teamNews, tag],
  );

  return (
    <div className="space-y-6">
      <PrimerEquipoPageHero
        title="Noticias"
        description={`Actualidad del primer equipo ${genderLabels[gender].club.toLowerCase()} filtrada por categorias.`}
      />

      <div className="flex flex-wrap gap-2">
        {tags.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTag(item)}
            className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-normal transition ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4">
        {filtered.length > 0 ? (
          filtered.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
            Sin noticias en esta categoria para {genderLabels[gender].title.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}

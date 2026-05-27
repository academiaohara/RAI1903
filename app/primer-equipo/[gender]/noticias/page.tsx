"use client";

import { use, useState } from "react";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { newsItems } from "@/data/mock";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { NewsCategory, NewsTag } from "@/types";

const newsCategoryTags: Record<NewsCategory, NewsTag> = {
  Fichajes: "fichajes",
  Lesionados: "lesionados",
  Rumores: "rumores",
  Renovaciones: "renovaciones",
  Entrevistas: "entrevistas",
  Otros: "otros",
};

export default function PrimerEquipoNoticiasPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };
  const [category, setCategory] = useState<NewsCategory>("Fichajes");
  const categoryNews = newsItems.filter((item) => item.tags.includes(newsCategoryTags[category]));

  return (
    <>
      <PrimerEquipoPageHero
        gender={gender}
        title="Noticias"
        description={`Actualidad del primer equipo ${genderLabels[gender].club.toLowerCase()} filtrada por categorias mock.`}
      />
      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.keys(newsCategoryTags) as NewsCategory[]).map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-normal transition ${category === item ? "bg-[#214C9B] text-white" : "border border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {categoryNews.length > 0 ? categoryNews.map((item) => <NewsCard key={item.id} item={item} />) : <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">Sin noticias en esta categoria mock.</p>}
        </div>
      </Card>
    </>
  );
}

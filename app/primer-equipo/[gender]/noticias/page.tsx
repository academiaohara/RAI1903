"use client";

import { use, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { SubsectionFilterNav } from "@/components/SubsectionFilterNav";
import { newsItems } from "@/data/mock";
import { newsForTeam } from "@/lib/noticias";
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

const categories = Object.keys(newsCategoryTags) as NewsCategory[];

export default function PrimerEquipoNoticiasPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };
  const [category, setCategory] = useState<NewsCategory>("Fichajes");
  const teamNews = newsForTeam(newsItems, gender);
  const categoryNews = teamNews.filter((item) => item.tags.includes(newsCategoryTags[category]));

  return (
    <div className="space-y-6">
      <PrimerEquipoPageHero
        title="Noticias"
        description={`Actualidad del primer equipo ${genderLabels[gender].club.toLowerCase()} filtrada por categorias.`}
      />

      <SubsectionFilterNav
        items={categories}
        value={category}
        onChange={setCategory}
        ariaLabel="Categorias de noticias"
      />

      <div className="grid gap-3 sm:gap-4">
        {categoryNews.length > 0 ? (
          categoryNews.map((item) => <NewsCard key={item.id} item={item} />)
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
            Sin noticias en esta categoria para {genderLabels[gender].title.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}

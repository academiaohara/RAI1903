import Link from "next/link";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { getMatchArticles } from "@/lib/match-articles";
import { genderLabels, getPrimerEquipoTabs, primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { formatDate } from "@/lib/utils";
import type { Route } from "next";

export default async function PreviasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const articles = getMatchArticles(gender, "previa");

  return (
    <div className="space-y-6">
      <PageHero eyebrow={`Primer Equipo · ${genderLabels[gender].title}`} title="Previas" description="Analisis previos a cada jornada con forma reciente, claves tacticas y estado de la plantilla." />
      <SectionTabs tabs={getPrimerEquipoTabs(gender)} />

      <Card eyebrow="Proximos duelos" title="Archivo de previas">
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`${primerEquipoBase(gender)}/previas/${article.id}` as Route}
              className="block rounded-2xl border border-[#214C9B]/20 bg-white p-4 transition hover:border-[#214C9B] hover:bg-blue-50"
            >
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{formatDate(article.date)} · {article.source}</p>
              <h2 className="mt-2 text-lg font-extrabold uppercase text-[#214C9B]">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

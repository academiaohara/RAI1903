import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import type { MatchArticle } from "@/types";

export function MatchArticleContent({ article }: { article: MatchArticle }) {
  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={article.type === "cronica" ? "blue" : "amber"}>{article.type === "cronica" ? "Cronica" : "Previa"}</Badge>
        <Badge tone="slate">{article.source}</Badge>
        <span className="text-sm font-bold text-slate-500">{formatDate(article.date)}</span>
      </div>
      <h1 className="text-3xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-4xl">{article.title}</h1>
      <p className="text-lg leading-8 text-slate-600">{article.excerpt}</p>
      <div className="space-y-4 border-t border-[#214C9B]/15 pt-5">
        {article.body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-7 text-slate-700">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
